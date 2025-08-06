"use client";
import { useState, useEffect } from "react";
import { addProject, updateProject } from "@/lib/api/projects";
import { useSelector } from "react-redux";
import MembersPanel from "./MembersPanel";
import { useRef } from "react";

export default function AddProjectModal({
  onClose,
  onSave,
  projectToEdit,
  onAssignMembers,
}) {
  const [form, setForm] = useState(null);
  const [edit, setEdit] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [enable, setEnable] = useState(false);
  const [projectId, setProjectId] = useState(null); // ✅ Store project ID
  const modalRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        !showAssignPanel &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showAssignPanel]);
  const openAssignPanel = () => {
    setShowAssignPanel(true);
  };

  const closeAssignPanel = () => {
    setShowAssignPanel(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const uniqueNewFiles = files.filter(
      (file) =>
        !selectedFiles.some((f) => f.name === file.name && f.size === file.size)
    );
    if (uniqueNewFiles.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...uniqueNewFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16);
    const draft = JSON.parse(localStorage.getItem("project-draft"));

    if (!user) {
      alert("User  not found in localStorage.");
      return;
    }

    if (projectToEdit) {
      setEdit(true);
      const parsedCreatedAt = new Date(projectToEdit.created_at)
        .toISOString()
        .slice(0, 16);
      const parsedDeadline = new Date(projectToEdit.deadline)
        .toISOString()
        .slice(0, 10);

      const statusMap = {
        Paused: 1,
        "Yet to Start": 2,
        "In Progress": 3,
        Completed: 4,
      };

      setForm({
        name: projectToEdit.title || "",
        deadline: parsedDeadline,
        createdBy: projectToEdit.created_by,
        createdById: parseInt(projectToEdit.created_by_id),
        createdAt: parsedCreatedAt,
        status_id: statusMap[projectToEdit.status] || 2,
      });
    } else {
      setForm({
        name: draft?.name || "",
        deadline: draft?.deadline || "",
        createdBy: user.name,
        createdById: user.user_id,
        createdAt: now,
        status_id: 2,
      });
    }
  }, [projectToEdit]);

  useEffect(() => {
    if (!edit && form !== null) {
      localStorage.setItem(
        "project-draft",
        JSON.stringify({
          name: form.name,
          deadline: form.deadline,
        })
      );
    }
  }, [form?.name, form?.deadline]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, deadline, createdById, status_id } = form;
    if (!name || !deadline) {
      alert("Enter all required details");
      return;
    }

    const payload = {
      title: name,
      deadline,
      created_by: parseInt(user.user_id),
      status_id,
    };
    let savedProjectId;
    try {
      if (edit && projectToEdit?.project_id) {
        await updateProject(
          { title: name, deadline },
          projectToEdit.project_id
        );
        savedProjectId = projectToEdit.project_id;
      } else {
        const res = await addProject(payload);
        savedProjectId = res.message;
        localStorage.removeItem("project-draft");
      }
      setProjectId(savedProjectId); // ✅ store in state
      setEnable(true);
      setSuccessMessage("✅ Project has been created!");
      const attachmentIds = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", user.user_id);
        formData.append("project_id", savedProjectId);

        const uploadRes = await fetch(
          "http://localhost:5000/upload-attachment",
          {
            method: "POST",
            body: formData,
          }
        );
        console.log(formData);
        const uploadData = await uploadRes.json();
        console.log(uploadData);
        if (uploadRes.ok && uploadData.attachment_id) {
          attachmentIds.push(uploadData.attachment_id);
        } else {
          console.error("Upload failed for file:", file.name);
        }
      }

      console.log("Sending attachment IDs:", attachmentIds);

      if (attachmentIds.length > 0) {
        await fetch("http://localhost:5000/assign-attachments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: savedProjectId,
            attachment_ids: attachmentIds,
          }),
        });
      }

      //   onSave();
    } catch (err) {
      console.error(err);
      alert("Failed to save project and attachments: " + err.message);
    }
  };

  const handleCancel = () => {
    console.log("Saving again");
    onClose();
  };

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-[#F0E4D3] p-6 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-screen overflow-y-auto relative"
      >
        <h2 className="text-4xl font-bold mb-8">
          {projectToEdit ? "Edit Project" : "Add New Project"}
        </h2>
        {successMessage && (
          <div className="mb-4 text-green-700 bg-green-100 border border-green-400 px-4 py-2 rounded">
            {successMessage}
          </div>
        )}

        <label className="block text-gray-800 mb-1">Project Name</label>
        <input
          type="text"
          name="name"
          placeholder="Project Name"
          value={form.name}
          onChange={handleChange}
          className="w-full h-[50px] bg-blue-100 border px-3 py-2 mb-8 rounded-lg shadow-lg"
        />
        <label className="block text-gray-800 mb-1">Deadline</label>
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className="w-full h-[50px] bg-blue-100 border px-3 py-2 mb-8 rounded-lg shadow-lg"
        />
        <label className="block text-gray-800 mb-1">Created By</label>
        <input
          type="text"
          name="createdBy"
          placeholder="Created By"
          value={form.createdBy}
          readOnly
          className="w-full h-[50px] bg-blue-100 border px-3 py-2 mb-8 rounded-lg shadow-lg"
        />
        <label className="block text-gray-800 mb-1">Created At</label>
        <input
          type="datetime-local"
          name="createdAt"
          value={form.createdAt}
          readOnly
          className="w-full h-[50px] bg-blue-100 border px-3 py-2 mb-8 rounded-lg shadow-lg cursor-not-allowed"
        />
        <label className="block text-gray-800 mb-1">Attachments</label>
        <label className="flex items-center gap-2 cursor-pointer mb-2">
          <span className="text-blue-600">📎 Attach Files</span>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {selectedFiles.length > 0 && (
          <div className="mt-2 mb-4">
            <h4 className="font-semibold text-gray-800 mb-1">
              Selected Files:
            </h4>
            <div className="flex flex-col gap-2 ">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1 rounded shadow-sm text-sm text-gray-700 "
                >
                  <span className="truncate">📄 {file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="text-red-500 hover:text-red-700 ml-3 text-sm"
                    title="Remove"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Assign Members Button (shown in all cases) */}
        <div className="mb-4 flex justify-end">
          <button
            disabled={!enable}
            onClick={() => openAssignPanel(projectId)}
            className={`px-3 py-2 text-sm text-white rounded ${
              enable ? "bg-green-600 hover:bg-green-700" : "bg-green-300"
            } `}
          >
            ➕ Assign Members
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>

      {/* Modal for MembersPanel */}
      {showAssignPanel && projectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          {/* Close button */}

          <MembersPanel
            isAssigning={true} // or false depending on logic
            projectId={projectId}
            onclose={closeAssignPanel}
          />
        </div>
      )}
    </div>
  );
}
