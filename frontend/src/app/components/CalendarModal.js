// components/CalendarModal.js
"use client";

import CustomCalendar from "./CustomCalendar";
import { useEffect, useRef } from "react";

export default function CalendarModal({ onClose }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div
        ref={modalRef}
        className="relative w-[90%] bg-white max-w-5xl bg- rounded-lg shadow-lg p-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl font-bold"
        >
          ×
        </button>
        <CustomCalendar />
      </div>
    </div>
  );
}
