"use client";
import { X, Paperclip, MessageSquareText, Import } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function UserStoryDetails({
  projectId,
  story,
  comments,
  attachments,
  onClose,
}) {
  const backendURL = "http://localhost:5000";
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
          <h1 className="text-2xl font-bold text-gray-900">{story?.title}</h1>
        </div>

        <hr className="mb-6" />

        {/* Story Info */}
        <div className="text-gray-800 space-y-3 px-4">
          <div className="flex justify-between">
            <span className="font-semibold">Story ID:</span>
            <span>{story.story_id}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Estimated Time:</span>
            <span>{story.estimated_time || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Created By (ID):</span>
            <span>{story.created_by}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Created At:</span>
            <span>{new Date(story.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Modified At:</span>
            <span>{new Date(story.modified_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Description */}
        {story.description && (
          <>
            <hr className="my-6" />
            <div className="px-4">
              <h3 className="font-semibold mb-1 text-gray-900">Description:</h3>
              <p className="text-gray-700">{story.description}</p>
            </div>
          </>
        )}

        {/* Attachments */}
        {attachments?.length > 0 && (
          <>
            <hr className="my-6" />
            <div className="px-4">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <Paperclip size={18} />
                Attachments
              </h3>
              <ul className="list-disc list-inside text-blue-700 mt-2">
                {attachments.map((file) => {
                  const downloadUrl = `${backendURL}/download-attachment?project_id=${projectId}&filename=${encodeURIComponent(
                    file.filename
                  )}`;

                  return (
                    <li
                      className="flex items-center gap-8"
                      key={file.attachment_id}
                    >
                      <a
                        href={downloadUrl}
                        download={file.filename}
                        className="hover:underline"
                      >
                        {file.filename}
                      </a>
                      <p className="text-black">By: {file.uploaded_by}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {/* Comments */}
        {comments?.length > 0 && (
          <>
            <hr className="my-6" />
            <div className="px-4">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <MessageSquareText size={18} />
                Comments
              </h3>
              <ul className="space-y-3 mt-2">
                {comments.map((comment) => (
                  <li
                    key={comment.comment_id}
                    className="text-gray-800 bg-white p-3 rounded-lg shadow-sm"
                  >
                    <div className="text-sm text-gray-600 mb-1">
                      <strong>{comment.commented_by}</strong> •{" "}
                      {new Date(comment.comment_time).toLocaleString()}
                    </div>
                    <p className="text-gray-700">{comment.comment_text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
