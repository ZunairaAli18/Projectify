"use client";
import AssignMemberButton from "./AssignMemberButton"; // Adjust the path if needed

export default function MemberProfile({
  member,
  hideTimestamps,
  projectId,
  userStoryId,
  isAssigning,

  setNewlyAssignedUserIds,
  markAssigned,
  newlyAssignedUserIds,
}) {
  const isAlreadyAssigned = newlyAssignedUserIds?.has(member.user_id);
  if (!member) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-lg">
        Select a member to view details.
      </div>
    );
  }

  return (
    <div className="h-full p-6 flex flex-col items-center bg-gradient-to-b from-white to-gray-100 rounded-lg shadow-inner">
      {/* Profile Icon and Name */}
      <div className="flex flex-col items-center space-y-2 mb-6">
        <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
          {member.name?.charAt(0) ?? "?"}
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{member.name}</h2>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 mb-4"></div>

      {/* Profile Details */}
      <div className="w-full space-y-3 text-gray-700">
        <Detail label="UserId" value={member.user_id} />
        <Detail label="Name" value={member.name} />
        <Detail label="Email" value={member.email} />
        <Detail label="Age" value={member.age} />
        <Detail label="Gender" value={member.gender} />
        <Detail label="Blood Group" value={member.blood_group} />
        <Detail label="Department" value={member.department_name} />
        {hideTimestamps === false && (
          <>
            <Detail label="Joined" value={formatDate(member.joined_at)} />
            <Detail label="Modified" value={formatDate(member.modified_at)} />
          </>
        )}
      </div>
      {(projectId || (userStoryId && isAssigning)) && (
        <div className="mt-6">
          <AssignMemberButton
            projectId={projectId}
            member={member}
            userStoryId={userStoryId}
            isAlreadyAssigned={isAlreadyAssigned}
            markAssigned={markAssigned}
          />
        </div>
      )}
    </div>
  );
}

// Reusable detail line
function Detail({ label, value }) {
  return (
    <div className="flex justify-between text-sm md:text-base">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-800">{value ?? "-"}</span>
    </div>
  );
}

// Optional: format ISO string date to readable form
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(); // Or customize as needed
}
