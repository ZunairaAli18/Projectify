"use client";
import { useState, useEffect, useRef } from "react";

export default function CommentModal({ taskId, userId, onClose }) {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
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
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      setResponseMsg("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story_id: taskId,
          user_id: userId,
          comment_text: commentText,
        }),
      });

      const data = await res.json();
      setResponseMsg(data.message);

      if (data.success) {
        setCommentText("");
        setTimeout(() => onClose(), 1200); // close modal after success
      }
    } catch (err) {
      setResponseMsg("Error submitting comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      {" "}
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-96 p-6 relative"
      >
        <h2 className="text-lg font-semibold mb-4">Add a Comment</h2>

        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your comment..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={4}
        />

        {responseMsg && (
          <p className="text-sm mt-2 text-gray-700">{responseMsg}</p>
        )}

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitComment}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
