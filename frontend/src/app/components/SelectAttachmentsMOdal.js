"use client";
import { useEffect, useState, useRef } from "react";
import { X, Paperclip, Upload } from "lucide-react";
import { fetchForStory } from "@/lib/api/userstory";

export default function SelectAttachmentsModal({
  onClose,
  onConfirm,
  onBrowseUpload,
  projectId,
  selectedAttachments,
}) {
  const [attachments, setAttachments] = useState([]);
  const [selected, setSelected] = useState([]);
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
  useEffect(() => {
    const loadAttachments = async () => {
      if (!projectId) return;
      try {
        const result = await fetchForStory(projectId);
        setAttachments(result);
      } catch (err) {
        console.error("Failed to fetch attachments:", err.message);
      }
    };
    loadAttachments();
  }, [projectId]);
  useEffect(() => {
    setAttachments((prev) => {
      const ids = new Set(prev.map((a) => a.attachment_id));
      const newOnes = selectedAttachments.filter(
        (a) => !ids.has(a.attachment_id)
      );
      return [...prev, ...newOnes];
    });

    // ✅ Auto-select newly added temp attachments
    setSelected((prev) => {
      const current = new Set(prev);
      const newlyAdded = selectedAttachments
        .filter((a) => !current.has(a.attachment_id))
        .map((a) => a.attachment_id);
      return [...prev, ...newlyAdded];
    });
  }, [selectedAttachments]);

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedAttachments = attachments.filter((file) =>
      selected.includes(file.attachment_id)
    );
    console.log(selected, attachments, selectedAttachments);
    onConfirm({ selected, attachments, selectedAttachments });
    onClose();
  };

  const handleBrowse = () => {
    onBrowseUpload(); // triggers system file picker in parent
    // onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative bg-[#FFF7E9] shadow-xl rounded-xl p-8 w-[600px] max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Paperclip size={20} /> Select Attachments
          </h1>
        </div>
        <hr className="mb-4" />

        {/* Attachment List */}
        <div className="space-y-3 px-4">
          {attachments.length === 0 ? (
            <p className="text-gray-600 text-center">
              No attachments found for this project.
            </p>
          ) : (
            attachments.map((file) => {
              const isSelected = selected.includes(file.attachment_id);
              return (
                <div
                  key={file.attachment_id}
                  onClick={() => toggleSelection(file.attachment_id)}
                  className={`flex items-center justify-between px-4 py-2 rounded-lg shadow-sm cursor-pointer border ${
                    isSelected
                      ? "bg-orange-100 border-orange-400"
                      : "bg-white border-gray-300 hover:bg-orange-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-medium">
                      {file.file_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created by: {file.uploaded_by}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {file.file_type?.toUpperCase()}
                    </span>
                    {isSelected && (
                      <span className="text-green-600 font-semibold">✓</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* ✅ Selected attachments preview */}
        {selected.length > 0 && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg w-full">
            <h4 className="font-semibold mb-2">Selected Attachments:</h4>
            <ul className="list-disc pl-5">
              {attachments
                .filter((file) => selected.includes(file.attachment_id))
                .map((file) => (
                  <li key={file.attachment_id}>{file.file_name}</li>
                ))}
            </ul>
          </div>
        )}
        {/* Bottom Buttons */}
        <div className="flex justify-end gap-3 mt-6 px-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleBrowse}
            className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 flex items-center gap-2"
          >
            <Upload size={18} /> Browse
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
