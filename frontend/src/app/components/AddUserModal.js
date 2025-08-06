"use client";
import { useState, useEffect, useRef } from "react";
import { createUser } from "@/lib/api/api";

export default function AddUserModal({ onClose }) {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(null); // initially null to detect "not yet initialized"
  const [successMessage, setSuccessMessage] = useState("");

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
  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:5000/departments");
        const data = await response.json();
        if (data.Success) {
          setDepartments(data.departments);
        } else {
          console.error("Failed to fetch departments:", data.error);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Restore draft or initialize empty form
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem("user-draft"));

    setForm(
      draft || {
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
        age: "",
        gender: "",
        bloodGroup: "",
        department_name: "",
      }
    );
  }, []);

  // Save draft automatically when form changes
  useEffect(() => {
    if (form !== null) {
      localStorage.setItem("user-draft", JSON.stringify(form));
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      return;
    }

    if (form.password.length < 8) {
      alert("Password must be at least 8 characters.");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      return;
    }

    try {
      const result = await createUser(form);
      // alert(result.message);
      setSuccessMessage("✅ User has been registered successfully!"); // ✅ Set message
      localStorage.removeItem("user-draft"); // clear saved draft after success
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancel = () => {
    onClose(); // Do not clear draft
  };

  const handleClearDraft = () => {
    localStorage.removeItem("user-draft");
    setForm({
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
      age: "",
      gender: "",
      bloodGroup: "",
      department_name: "",
    });
  };

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm ">
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className="bg-[#F0E4D3] p-6 rounded-lg shadow-lg w-[90%] max-w-2xl h-[726px] overflow-y-auto"
      >
        <h2 className="text-4xl font-bold mb-8 text-center">Add New User</h2>
        {/* ✅ Display success message */}
        {successMessage && (
          <div className="mb-6 text-green-700 text-center font-semibold bg-green-100 p-3 rounded shadow">
            {successMessage}
          </div>
        )}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-8 p-3 bg-blue-100 border rounded-lg shadow-lg"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-8 p-3 bg-blue-100 border rounded-lg shadow-lg"
          required
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="w-full mb-8 p-3 bg-blue-100 border rounded-lg shadow-lg"
          required
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full mb-8 p-3 bg-blue-100 border rounded-lg shadow-lg"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <select
          name="bloodGroup"
          value={form.bloodGroup}
          onChange={handleChange}
          className="w-full mb-8 p-3 bg-blue-100 border rounded-lg shadow-lg"
          required
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        <div className="mb-6">
          <label className="block mb-2 font-bold text-2xl">
            Department <span className="text-red-600">*</span>
          </label>
          <select
            name="department_name"
            value={form.department_name}
            onChange={handleChange}
            required
            className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a department</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-8 p-3 bg-blue-100 border rounded-lg shadow-lg"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full mb-8 p-3 bg-blue-100 border rounded-lg shadow-lg"
          required
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClearDraft}
            className="px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500"
          >
            Clear Draft
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save User
          </button>
        </div>
      </form>
    </div>
  );
}
