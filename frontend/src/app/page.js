"use client";
import Link from "next/link";
import NavBar from "./components/NavBar";
import "./globals.css";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F1EFEC] font-sans">
      <NavBar />

      <div className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20">
        {/* Left Section */}
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Manage projects, tasks, and your team effortlessly.
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            A smart way to stay organized and improve productivity.
          </p>

          {/* Login Button as Link */}
          <Link href="/signup">
            <button className="bg-[#456882] hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow">
              Get Started With Us
            </button>
          </Link>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="Collaboration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
