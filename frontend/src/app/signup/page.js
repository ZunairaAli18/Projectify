"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/NavBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/api/api";

export default function SignUpPage() {
  const [departments, setDepartments] = useState([]);

  const router = useRouter();
  const [form, setForm] = useState({
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords donot match!");
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      return;
    }
    if (form.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      return;
    }
    console.log("Form Submitted", form);
    try {
      const result = await createUser(form);
      // alert(result.message);
      router.push("/login?registered=success");
    } catch (error) {
      console.error("Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="bg-[#F9F3EF] font-sans min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center">
        <form
          className="mt-7 bg-[#F6F6F6] p-8 rounded-xl shadow-xl w-[600px] h-[1050px]"
          onSubmit={handleSubmit}
        >
          <h2 className="text-7xl text-center font-extrabold mb-6  text-blue-800">
            Sign Up
          </h2>
          <div className="mb-6">
            <label className="block mb-2 font-bold text-2xl">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
              className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-bold text-2xl">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-bold text-2xl">
              Age <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter age"
              className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 font-bold text-2xl">
              Gender <span className="text-red-600">*</span>
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-bold text-2xl">
              Blood Group <span className="text-red-600">*</span>
            </label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">
                Select blood group <span className="text-red-500">*</span>
              </option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
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

          <div className="mb-6">
            <label className="block mb-2 font-bold text-2xl">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create new Password"
              className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Retype new Password"
              className="w-full bg-blue-100 border border-gray-400 px-4 py-2 rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-3 h-[60px] w-full bg-[#456882] text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition text-2xl"
          >
            Sign Up
          </button>
          <p className="mt-6 text-center text-lg font-medium text-gray-700">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
