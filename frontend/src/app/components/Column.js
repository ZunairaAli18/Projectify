"use client";
import { useState, useEffect, useRef } from "react";
import Card from "./Card";
import AddUserStoryModal from "./AddUserStoryModal";
import UserStporyDetails from "./UserStporyDetails";
import { fetchUserStoryDetails } from "@/lib/api/userstory"; // Adjust the import path as necessary
import MembersPanel from "./MembersPanel"; // Adjust the import path as necessary

export default function Column({
  title,
  tasks,
  onDragStart,
  onDrop,
  projectId,
  onSaveStory,
  onUpdateStory,
}) {
  const [showModal, setShowModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [editStory, setEditStory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  // either task or project

  const handleViewDetails = async (story) => {
    try {
      const result = await fetchUserStoryDetails(story.story_id); // or story.id
      const details = result;
      setSelectedStory(details); // this includes full data: story, comments, etc.
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch story details:", error);
    }
  };

  const handleEditStoryModal = (story) => {
    setEditStory(story);
    setShowEditModal(true);
  };
  const handleViewMembers = (story) => {
    // for user story
    setIsAssigning(false);
    setSelectedStory(story);
    setShowMembersPanel(true);
  };

  const handleAssignMember = (story) => {
    setIsAssigning(true);
    setSelectedStory(story);
    setShowMembersPanel(true);
  };

  return (
    <>
      <div
        className="bg-[#58A0C8] p-4 rounded-lg shadow-md w-1/3 mx-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black">{title}</h3>
          {title === "To Do" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-200 hover:bg-green-300 text-green-900 px-3 py-1 rounded text-sm font-semibold"
            >
              + Add Task
            </button>
          )}
        </div>

        {tasks.map((task) => (
          <Card
            key={task.story_id}
            task={task}
            onDragStart={() => onDragStart(task.story_id)} // ✅ use story_id
            onViewDetails={handleViewDetails}
            onEditStoryModal={handleEditStoryModal}
            onViewMembers={handleViewMembers}
            onAssignMember={handleAssignMember}
          />
        ))}
      </div>

      {showModal && (
        <AddUserStoryModal
          onClose={() => setShowModal(false)}
          onSave={onSaveStory}
          projectId={projectId}
        />
      )}

      {showEditModal && editStory && (
        <AddUserStoryModal
          onClose={() => setShowEditModal(false)}
          onUpdate={onUpdateStory}
          projectId={projectId}
          storyToEdit={editStory}
        />
      )}

      {showDetailsModal && selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <UserStporyDetails
            projectId={projectId}
            story={selectedStory.story}
            comments={selectedStory.comments}
            attachments={selectedStory.attachments}
            onClose={() => setShowDetailsModal(false)}
          />
        </div>
      )}
      {showMembersPanel && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <button
            onClick={() => setShowMembersPanel(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl font-bold"
          >
            ×
          </button>
          <MembersPanel
            userStoryId={selectedStory?.story_id} // Pass the story_id if available
            isAssigning={isAssigning}
            onclose={() => {
              setShowMembersPanel(false);
            }}
          />
        </div>
      )}
    </>
  );
}
