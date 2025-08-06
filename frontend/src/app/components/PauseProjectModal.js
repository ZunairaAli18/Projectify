"use client";
import { useState, useEffect, useRef } from "react";

export default function PauseProjectModal({ project, onClose, onPause }) {
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for pausing the project.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/pause-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.project_id,
          reason,
        }),
      });

      if (res.ok) {
        setSuccessMessage("✅ Project has been paused successfully.");
        setTimeout(() => {
          onPause(); // Parent callback (e.g., refresh UI)
          onClose(); // Close modal
        }, 1500);
      } else {
        throw new Error("Failed to pause project.");
      }
    } catch (err) {
      console.error(err);
      alert("Error pausing project: " + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center
justify-center bg-black/30 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className="bg-[#F0E4D3] p-6 rounded-lg shadow-lg w-[90%]
max-w-2xl max-h-screen overflow-y-auto relative"
      >
        <h2 className="text-4xl font-bold mb-8 text-black">Pause Project</h2>

        {successMessage && (
          <div
            className="mb-4 text-green-700 bg-green-100 border
border-green-400 px-4 py-2 rounded"
          >
            {successMessage}
          </div>
        )}

        <p className="mb-4 text-gray-700 text-lg">
          Are you sure you want to pause the project{" "}
          <span className="font-semibold text-black">{project.title}</span>?
          Please provide a reason:
        </p>

        <label className="block text-gray-800 mb-1">Reason</label>
        <textarea
          rows="4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-blue-100 border px-3 py-2 mb-8
rounded-lg shadow-lg resize-none"
          placeholder="Explain why this project is being paused..."
        ></textarea>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm Pause
          </button>
        </div>
      </div>
    </div>
  );
}
