"use client";

import { useState } from "react";

export default function ChangePasswordModal({ onClose, onConfirm }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

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
  const handleConfirm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
    } else if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
    } else {
      setError("");
      onConfirm({ currentPassword, newPassword }); // Pass both
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div
        ref={modalRef}
        className="bg-[#f5e4cd] rounded-xl p-8 shadow-xl w-[400px]"
      >
        <h2 className="text-2xl font-bold text-center text-black mb-6">
          Update Password
        </h2>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-300 bg-blue-100 text-black focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-300 bg-blue-100 text-black focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-300 bg-blue-100 text-black focus:outline-none"
          />
        </div>

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
