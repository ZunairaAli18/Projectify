"use client";
import { useState } from "react";
import {
  assignMemberToProject,
  assignMemberToUserStory,
} from "@/lib/api/Members";
export default function AssignMemberButton({
  projectId,
  userStoryId,
  member,
  isAlreadyAssigned,
  markAssigned,
}) {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!member?.user_id || isAlreadyAssigned) return;

    setIsAssigning(true);
    try {
      if (projectId) {
        await assignMemberToProject(projectId, member.user_id);
      } else if (userStoryId) {
        await assignMemberToUserStory(userStoryId, member.user_id);
      }

      markAssigned(member.user_id); // ✅ Update parent state
    } catch (error) {
      console.error("Error assigning member:", error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <button
      onClick={handleAssign}
      disabled={isAssigning || isAlreadyAssigned}
      className={`mt-4 px-4 py-2 rounded text-white disabled:opacity-50 ${
        isAlreadyAssigned ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {isAlreadyAssigned
        ? "Assigned"
        : isAssigning
        ? "Assigning..."
        : projectId
        ? "Assign to Project"
        : "Assign to User Story"}
    </button>
  );
}
