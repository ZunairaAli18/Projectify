"use client";

import { useState } from "react";
import Guard from "../components/Guard";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useSelector } from "react-redux";
import { changePassword } from "@/lib/api/ChangePassword";
import SettingsHeader from "@/app/components/SettingsHeader";

export default function SettingsPage() {
  return (
    <Guard>
      <SettingsDashboard />
    </Guard>
  );
}

function SettingsDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleConfirmPassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await changePassword(
        user.email,
        currentPassword,
        newPassword
      );
      if (res.success) {
        alert("Password updated successfully!");
        setShowChangePassword(false);
      } else {
        alert("Failed to update password: " + res.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex relative">
      <SideBar />
      <div className="flex-1 p-6 bg-[#F1EFEC] min-h-screen transition duration-300">
        <SettingsHeader />
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-black mt-20">
          <h1 className="text-3xl font-bold mb-8 text-center">⚙️ Settings</h1>

          {/* Email Info */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              Logged in Email
            </label>
            <div className="bg-gray-100 px-4 py-2 rounded text-gray-800 border">
              {user?.email || "Unknown"}
            </div>
          </div>

          {/* Common Platform Settings */}
          <div className="space-y-6">
            <SettingItem label="Notifications" />
            <SettingItem label="Privacy Settings" />
            <SettingItem label="Language & Region" />
            <SettingItem
              label="Theme"
              value="Light / Dark Toggle Coming Soon"
            />
          </div>

          {/* Change Password Button */}
          <div className="mt-10 text-center">
            <button
              onClick={handleChangePassword}
              className="bg-[#58A0C8] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md shadow-md"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onConfirm={handleConfirmPassword}
        />
      )}
    </div>
  );
}

function SettingItem({ label, value = "Enabled" }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-gray-100 rounded shadow-sm">
      <span className="font-medium text-gray-800">{label}</span>
      <span className="text-sm text-gray-600">{value}</span>
    </div>
  );
}
