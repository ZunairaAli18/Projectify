"use client";
import {
  Users,
  UserPlus,
  Pencil,
  FileText,
  MessageCircleCodeIcon,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import CommentModal from "./commentMOdal";
export default function Card({
  task,
  onDragStart,
  onViewDetails,
  onEditStoryModal,
  onViewMembers,
  onAssignMember,
}) {
  const user = useSelector((state) => state.auth.user);
  const [showCommentModal, setShowCommentModal] = useState(false);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white p-4 rounded shadow mb-4 hover:shadow-lg relative"
    >
      <h4 className="text-md font-semibold text-black">{task.title}</h4>
      <span className="text-sm text-gray-500">{task.tag}</span>

      <div className="mt-2">
        <img src={task.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
      </div>

      <div className="absolute bottom-2 right-2 flex space-x-2">
        <button
          onClick={() => onViewMembers?.(task)}
          title="View Members"
          className="hover:scale-110 transition"
        >
          <Users className="w-4 h-4 text-blue-600 hover:text-blue-800" />
        </button>
        <button
          onClick={() => onAssignMember?.(task)}
          title="Assign Member"
          className="hover:scale-110 transition"
        >
          <UserPlus className="w-4 h-4 text-green-600 hover:text-green-800" />
        </button>
        <button
          onClick={() => setShowCommentModal(true)}
          title="Add Comment"
          className="hover:scale-110 transition"
        >
          <MessageCircleCodeIcon className="w-4 h-4 text-orange-700 hover:text-orange-900" />
        </button>{" "}
        <button
          onClick={() => onEditStoryModal?.(task)}
          title="Edit Story"
          className="hover:scale-110 transition"
        >
          <Pencil className="w-4 h-4 text-yellow-600 hover:text-yellow-800" />
        </button>
        <button
          onClick={() => onViewDetails?.(task)}
          title="View Details"
          className="hover:scale-110 transition"
        >
          <FileText className="w-4 h-4 text-gray-600 hover:text-black" />
        </button>
      </div>
      {showCommentModal && (
        <CommentModal
          taskId={task.story_id}
          userId={user.user_id} // replace with actual logged-in user
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </div>
  );
}
