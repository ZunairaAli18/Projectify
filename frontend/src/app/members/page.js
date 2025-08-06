"use client";

import MembersPanel from "../components/MembersPanel";
import SideBar from "../components/SideBar";
import Guard from "../components/Guard";
import { Calendar } from "lucide-react";

export default function Members() {
  return (
    <Guard>
      <div className="flex bg-[#F1EFEC]">
        <SideBar />
        <MembersPanel />
      </div>
    </Guard>
  );
}
