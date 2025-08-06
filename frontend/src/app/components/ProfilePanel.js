"use client";

import { useEffect, useState } from "react";
import { fetchUserProfile, updateUserProfile } from "../../lib/api/api";
import { useSelector } from "react-redux";

export default function ProfilePanel() {
  const loggedInUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    user_id: "",
    name: "",
    email: "",
    age: "",
    gender: "",
    blood_group: "",
    department_name: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (loggedInUser) {
      const userId = loggedInUser.user_id;

      if (userId) {
        fetchUserProfile(userId)
          .then((fetchedUser) => {
            setUser(fetchedUser);
            setFormData({
              name: fetchedUser.name || "",
              email: fetchedUser.email || "",
              age: fetchedUser.age || "",
              gender: fetchedUser.gender || "",
              blood_group: fetchedUser.blood_group || "",
              department_name: fetchedUser.department_name || "",
              user_id: fetchedUser.user_id || "",
            });
          })
          .catch((err) => {
            console.error("Failed to fetch user from backend:", err.message);
          });
      }
    }
  }, [loggedInUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      console.log("Saving profile with data:", formData);
      const updated = await updateUserProfile(formData);
      setUser(updated);
      setIsEditing(false); // Exit editing mode after save
      alert("Profile updated!");
    } catch (err) {
      console.error("Failed to update profile", err.message);
      alert("Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bg-white top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[68[p[p;;';'p;'-p[['-p['[=]\[=-p[];['0px] bg-[#FBF5DE] rounded-lg border ml-30 shadow-lg p-6 z-50 ">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-4">
        <ProfileInput
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileInput
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileInput
          label="Age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileInput
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileInput
          label="Blood Group"
          name="blood_group"
          value={formData.blood_group}
          onChange={handleChange}
          editable={isEditing}
        />
        <ProfileInput
          label="Department"
          name="department_name"
          value={formData.department_name}
          onChange={handleChange}
          editable={isEditing}
        />

        {isEditing ? (
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-[#58A0C8] text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

function ProfileInput({ label, name, value, onChange, editable = true }) {
  return (
    <div>
      <label className="block font-semibold mb-1">{label}:</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={editable ? onChange : undefined}
        readOnly={!editable}
        className={`border rounded p-2 w-full ${
          editable ? "bg-gray-200" : " cursor-not-allowed"
        }`}
      />
    </div>
  );
}
