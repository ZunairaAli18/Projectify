"use client";
import { useState } from "react";
import Board from "./Board";
import { PauseCircle, PlayCircle } from "lucide-react";

export default function ProjectCard({
  project,
  onViewMembers,
  onEdit,
  onAssignMembers,
  onAttachmentFetch,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(project.status); // local status tracking

  const getStatusBadge = (status) => {
    if (status === "Completed") return "bg-green-100 text-green-800";
    if (status === "In Progress") return "bg-blue-100 text-blue-800";
    if (status === "Paused") return "bg-gray-200 text-gray-800";
    return "bg-red-100 text-red-800"; // Not Started
  };

  const handleAssignMember = () => {
    if (onAssignMembers) onAssignMembers(project.project_id);
  };

  const handleEditProject = () => {
    onEdit(project);
  };

  const handleAttachmentFetch = () => {
    if (onAttachmentFetch) onAttachmentFetch(project);
  };

  const handleViewMembers = () => {
    onViewMembers(project.project_id);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const updateStatus = async (newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/${project.project_id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus === "In Progress" ? "resume" : newStatus, // auto convert "Resume" to "resume"
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.Success) {
        setStatus(data.new_status || newStatus); // fallback to newStatus if backend didn't send new_status
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating project status");
    }
  };

  return (
    <div className="relative bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition mb-6 border border-gray-300">
      {/* Main clickable header */}
      <div onClick={toggleDropdown} className="cursor-pointer">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">{project.title}</h2>
          <span
            className={`text-sm px-4 py-1 rounded-full font-medium ${getStatusBadge(
              status
            )}`}
          >
            {status}
          </span>
        </div>
        <div className="text-gray-700 space-y-2 mb-4">
          <p>
            <strong>Created By:</strong> {project.created_by}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(project.created_at).toLocaleDateString()}
          </p>
          <p>
            <strong>Deadline:</strong>{" "}
            {new Date(project.deadline).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={handleViewMembers}
          className="bg-[#58A0C8] hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          View Members
        </button>
        <button
          onClick={handleAssignMember}
          className="bg-[#58A0C8] hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          Assign Member
        </button>
        <button
          onClick={handleEditProject}
          className="bg-[#58A0C8] hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          Edit Project
        </button>
        <button
          onClick={handleAttachmentFetch}
          className="bg-[#58A0C8] hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-semibold"
        >
          View Attachments
        </button>
      </div>

      {/* Pause & Resume buttons */}
      <div className="absolute bottom-4 right-4 flex gap-3">
        <button
          onClick={() => updateStatus("Paused")}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
          title="Pause Project"
        >
          <PauseCircle className="w-6 h-6" />
        </button>
        <button
          onClick={() => updateStatus("In Progress")}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2"
          title="Resume Project"
        >
          <PlayCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Expandable task board */}
      {isOpen && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center gap-2 bg-blue-200 text-blue-800 px-6 py-4 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-blue-900">
              📋 User Stories and Tasks
            </h3>
          </div>
          <Board projectId={project.project_id} />
        </div>
      )}
    </div>
  );
}
