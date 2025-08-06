"use client";
import { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";
import { useRef } from "react";
import SelectAttachmentsModal from "./SelectAttachmentsMOdal";
import { useSelector } from "react-redux";

export default function AddUserStoryModal({
  onClose,
  onSave,
  onUpdate,
  projectId,
  storyToEdit,
}) {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(null); // null initially
  const [edit, setEdit] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const modalRef = useRef(null);
  // Close modal on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
  const openFileDialog = () => {
    setShowAttachmentModal(true);
  };
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("story-draft"));

    if (!user) {
      alert("User not found in localStorage.");
      return;
    }

    if (storyToEdit) {
      console.log("Editing story:", storyToEdit);
      setEdit(true);
      setForm({
        title: storyToEdit.title || "",
        description: storyToEdit.description || "",
        estimated_time: storyToEdit.estimated_time || "",
        createdBy: user.name,
        createdById: user.user_id,
        status_id: storyToEdit.status_id || 2,
        story_id: storyToEdit.story_id, // include story_id for updates
      });
    } else {
      setEdit(false);
      setForm({
        title: draft?.title || "",
        description: draft?.description || "",
        estimated_time: draft?.estimated_time || "",
        createdBy: user.name,
        createdById: user.user_id,
        status_id: 2,
      });
    }
  }, [storyToEdit, user]); // include user so it's always fresh

  // Watch form updates AFTER setForm runs
  useEffect(() => {
    if (form) {
      console.log("Form updated:", form);
    }
  }, [form]);

  // Auto-save draft (only if not editing)
  useEffect(() => {
    if (!edit && form) {
      const { title, description, estimated_time } = form;
      localStorage.setItem(
        "story-draft",
        JSON.stringify({ title, description, estimated_time })
      );
    }
  }, [form, edit]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, estimated_time, createdById } = form;

    if (!title || !projectId || !createdById) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      title,
      description,
      estimated_time,
      project_id: projectId,
      created_by: parseInt(createdById),
      status_id: 2,
      story_id: form.story_id || null, // use existing ID if editing
    };

    try {
      let storyId;

      // Step 1: Add or update story
      if (edit && onUpdate && storyToEdit?.story_id) {
        console.log(payload);
        console.log("Updating story:", storyToEdit.story_id);

        await onUpdate(payload);

        storyId = storyToEdit.story_id;
      } else {
        const res = await onSave(payload);
        console.log("Story saved: ", res);
        storyId = res.story_id;
        setSuccessMessage("User story added successfully!");
        localStorage.removeItem("story-draft");
      }

      // Step 2: Handle attachments (both new + existing)
      const uploadedAttachmentIds = [];
      console.log(selectedAttachments);
      for (const attachment of selectedAttachments) {
        try {
          console.log("attachment: ", attachment);
          if (attachment.file_object) {
            // New file -> upload now
            const formData = new FormData();
            formData.append("file", attachment.file_object);
            formData.append("user_id", createdById);
            formData.append("project_id", projectId);
            formData.append("story_id", storyId);
            console.log(formData);
            const uploadRes = await fetch(
              "http://localhost:5000/upload-attachment",
              {
                method: "POST",
                body: formData,
              }
            );

            const uploadData = await uploadRes.json();
            console.log("data uploaded", uploadData);
            if (uploadRes.ok && uploadData.attachment_id) {
              uploadedAttachmentIds.push(uploadData.attachment_id);

              // Update the local object with the real ID
              attachment.attachment_id = uploadData.attachment_id;
              delete attachment.file_object; // not needed anymore
            } else {
              console.error("Upload failed:", attachment.file_name, uploadData);
            }
          } else if (attachment.attachment_id) {
            // Existing attachment
            uploadedAttachmentIds.push(attachment.attachment_id);
          }
        } catch (err) {
          console.error("Error uploading attachment:", err);
        }
      }

      console.log("✅ Final uploaded IDs:", uploadedAttachmentIds);

      // Step 3: Assign each attachment individually
      for (const attachmentId of uploadedAttachmentIds) {
        await fetch("http://localhost:5000/assign-attachment-to-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attachment_id: attachmentId,
            project_id: projectId,
            user_story_id: storyId,
          }),
        });
      }
    } catch (err) {
      alert("Failed to save user story and attachments: " + err.message);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem("story-draft");
    setForm((prev) => ({
      ...prev,
      title: "",
      description: "",
      estimated_time: "",
    }));
  };

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-[#F0E4D3] p-6 rounded-lg shadow-lg w-[90%] max-w-2xl + max-h-[90vh] overflow-y-auto
 relative"
      >
        <h2 className="text-4xl font-bold mb-8">
          {storyToEdit ? "Edit Story" : "Add New Story"}
        </h2>
        {successMessage && (
          <div className="mb-4 p-4 text-green-800 bg-green-200 border border-green-400 rounded">
            {successMessage}
          </div>
        )}

        <input
          type="text"
          name="title"
          placeholder="Story Title"
          value={form.title}
          onChange={handleChange}
          className="w-full h-[50px] bg-blue-100 border px-3 py-2 mb-8 rounded-lg shadow-lg"
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="w-full h-[100px] bg-blue-100 border px-3 py-2 mb-8 rounded-lg shadow-lg resize-none"
        />

        <input
          type="text"
          name="estimated_time"
          placeholder="Estimated Time (e.g. 2 hours)"
          value={form.estimated_time}
          onChange={handleChange}
          className="w-full h-[50px] bg-blue-100 border px-3 py-2 mb-8 rounded-lg shadow-lg"
        />
        <div className="justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openFileDialog}
              className="text-gray-600 hover:text-black flex items-center gap-1"
            >
              <Paperclip size={20} />
              <span className="text-sm">Upload</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple // ✅ allow multiple selection
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedAttachments((prev) => [
                  ...prev,
                  ...files.map((file) => ({
                    attachment_id: `temp-${Date.now()}-${file.name}`, // temp ID
                    file_name: file.name,
                    file_type: file.type,
                    uploaded_by: "You", // since just selected
                    file_object: file, // keep file object for upload
                  })),
                ]);
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            {!edit && (
              <button
                onClick={handleClearDraft}
                type="button"
                className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
              >
                Clear Draft
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {storyToEdit ? "Update" : "Save"}
            </button>
          </div>
        </div>
        {showAttachmentModal && (
          <SelectAttachmentsModal
            projectId={projectId}
            selectedAttachments={selectedAttachments}
            onClose={() => setShowAttachmentModal(false)}
            onConfirm={({ selected, attachments, selectedAttachments }) => {
              // Store the actual selected attachment objects
              setSelectedAttachments(selectedAttachments);
              setShowAttachmentModal(false);

              // For debugging:
              console.log("Selected IDs:", selected);
              console.log("All attachments:", attachments);
              console.log("Selected objects:", selectedAttachments);
            }}
            onBrowseUpload={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
