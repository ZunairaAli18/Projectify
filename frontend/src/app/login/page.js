"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import { loginUser } from "@/lib/api/api";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (searchParams.get("registered") === "success") {
      setShowSuccessMessage(true);
    }
  }, [searchParams]);
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const result = await loginUser({ email, password });
      dispatch(login(result.user));
      console.log("Dispatched login to Redux");
      // alert(result.message);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message || "Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F1EFEC] font-sans">
      <NavBar />

      {/* Center the card */}
      <div className="flex justify-center items-center mt-30 p-4">
        <div className="w-full max-w-md bg-[#F6F6F6] p-10 rounded-xl shadow-lg">
          {showSuccessMessage && (
            <div className="mb-6 text-green-700 bg-green-100 px-4 py-2 rounded shadow">
              You are registered successfully!
            </div>
          )}
          <h2 className="text-7xl font-bold text-blue-800 mb-6 text-center">
            Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="mb-6">
              <label className="block mb-2 font-bold text-2xl">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="w-full bg-blue-100 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-bold text-2xl">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-blue-100 border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              />
            </div>

            <button
              type="submit"
              className="mt-3 h-[60px] w-full bg-[#456882] text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition text-2xl"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-lg font-medium text-gray-700">
            New user?{" "}
            <span
              className="text-blue-600 hover:underline font-semibold"
              onClick={() => router.push("/signup")}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
