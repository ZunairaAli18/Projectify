"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1B3C53] shadow-md px-6 py-4 flex justify-between items-center ">
      {/*Left logo+Appname*/}
      <div className="ml-1 flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-6">
          <Image src="/logo.png" alt="img" width={52} height={52} />
          <span className="text-[40px] font-bold text-white">Projectify</span>
        </Link>
      </div>

      {/*Login ans sign up buttons*/}
      <div className="space-x-6">
        <Link href="/login">
          <button
            className={`w-26 shadow-xl px-4 py-2 rounded-xl ${
              pathname === "/login"
                ? "bg-blue-600 text-white"
                : "bg-[#F1EFEC] text-gray-800 hover:bg-blue-200"
            }`}
          >
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button
            className={`w-26 shadow-xl px-4 py-2 rounded-xl ${
              pathname === "/signup"
                ? "bg-green-600 text-white"
                : "bg-[#F1EFEC] text-gray-800 hover:bg-green-200"
            }`}
          >
            SignUp
          </button>
        </Link>
      </div>
    </nav>
  );
}
