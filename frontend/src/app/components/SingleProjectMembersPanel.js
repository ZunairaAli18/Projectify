"use client";

import { useEffect, useState, useRef } from "react";
import MemberProfile from "./MemberProfile";
import { getProjectMembers } from "../../lib/api/projects"; // adjust path if needed

export default function SingleProjectMembersPanel({ projectId, onclose }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const modalRef = useRef(null);
  // Close modal on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onclose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const data = await getProjectMembers(projectId); // now returns list of dicts
        console.log(data);
        setMembers(data);
        console.log("Fetched Members:", data);
        setSelectedMember(data.users?.[0] || null);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching project members:", err.message);
        setLoading(false);
      }
    }
    fetchMembers();
  }, [projectId]);

  return (
    <div
      className="fixed inset-20 top-25 bottom-10 left-110 bg-white rounded-lg border shadow-lg z-100 overflow-hidden"
      style={{ width: "1200px", height: "80vh" }}
    >
      <div ref={modalRef} className="flex h-full">
        {/* Left Panel */}
        <div className="w-[40%] border-r overflow-y-auto p-4">
          {/* Heading */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Members</h2>
          </div>

          <div className="space-y-2">
            {Array.isArray(members) &&
              members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center bg-gray-100 gap-3 p-3 rounded-md hover:bg-[#FBF5DE] cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                    {member.name?.charAt(0)}
                  </div>

                  {/* Member name */}
                  <span className="font-medium text-gray-800">
                    {member.name}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[60%] p-6 bg-white">
          {selectedMember ? (
            <MemberProfile member={selectedMember} hideTimestamps={true} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-lg">
              Select a member to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
