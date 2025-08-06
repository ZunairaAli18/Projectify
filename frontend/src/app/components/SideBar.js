"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { Calendar } from "lucide-react"; // Icon
import { useState } from "react";
import CalendarModal from "./CalendarModal"; // <-- You need to create this
import Image from "next/image"; // <-- Import Image component

export default function SideBar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State for modal

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const handleCalendarClick = () => {
    setIsCalendarOpen(true); // Open modal instead of routing
  };

  const closeCalendarModal = () => {
    setIsCalendarOpen(false); // Close modal
  };

  return (
    <>
      <div className="w-72 bg-[#1B3C53] h-screen shadow-md flex flex-col justify-between">
        {/* Top Section with Logo */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-300">
            <div className="flex items-center">
              {/* Project Icon */}
              <Image
                src="/project-management.png"
                alt="Project Management"
                width={40}
                height={40}
                className="mr-3 rounded-full"
              />
              <h1 className="text-xl font-bold text-gray-100">Projectify</h1>
            </div>
            <button
              onClick={handleCalendarClick}
              className="text-gray-300 hover:text-blue-400"
            >
              <Calendar size={20} />
            </button>
          </div>

          {/* Sidebar Buttons */}
          <div className="flex flex-col px-6 mt-8 divide-y divide-gray-300 text-lg text-gray-100 font-medium">
            <Link href="/dashboard" className="py-4 hover:text-blue-300">
              Dashboard
            </Link>
            <Link
              href="/dashboard?view=myprojects"
              className="py-4 hover:text-blue-300"
            >
              My Projects
            </Link>
            <Link
              href="/dashboard?view=created"
              className="py-4 hover:text-blue-300"
            >
              My Created Projects
            </Link>
            <Link href="/members" className="py-4 hover:text-blue-300">
              Members
            </Link>
            <Link href="/myprofile" className="py-4 hover:text-blue-300">
              My Profile
            </Link>
            <Link href="/settings" className="py-4 hover:text-blue-300">
              Settings
            </Link>
          </div>
        </div>

        {/* Bottom Logout */}
        <div className="px-6 py-4 border-t border-gray-300">
          <button
            onClick={handleLogout}
            className="block text-lg text-red-400 hover:text-red-300 font-medium w-full text-left"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Render Calendar Modal */}
      {isCalendarOpen && <CalendarModal onClose={closeCalendarModal} />}
    </>
  );
}
