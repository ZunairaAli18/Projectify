"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "../components/SideBar";
import ProjectCard from "../components/ProjectCard";
import Header from "../components/Header";
import AddProjectModal from "../components/AddProjectModal";
import AddUserModal from "../components/AddUserModal";
import SingleProjectMembersPanel from "../components/SingleProjectMembersPanel";
import MembersPanel from "../components/MembersPanel";
import ProjectAttachmentsModal from "../components/ProjectAttachments";
import {
  getProjectSummaryAlphabetical,
  getAllProjects,
  getProjectsCreatedByEmail,
  getAllMyProjectsByEmail,
} from "@/lib/api/projects";
import { fetchProjectAttachments } from "@/lib/api/fetchProjectAttachments";
import { useSearchParams } from "next/navigation";
import Guard from "../components/Guard";
import DebugAuth from "../debug-auth";
import { useSelector } from "react-redux";
import { Upload } from "lucide-react";
import BotpressChatbot from "../components/BotPressChatbot";
import { searchProjects } from "@/lib/api/searchProjects";

export default function Page() {
  return (
    <Guard>
      <DashboardContent />
    </Guard>
  );
}

function DashboardContent() {
  const router = useRouter();

  const SearchParams = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [assignProjectId, setAssignProjectId] = useState(null);
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchProjects = async () => {
      const view = SearchParams.get("view");

      const email = user.email;
      const statusMap = {
        1: "Paused",
        2: "Yet to Start",
        3: "In Progress",
        4: "Completed",
      };

      if (!email) {
        alert("User email not found");
        return;
      }

      try {
        let data = [];
        if (view === "created") {
          data = await getProjectsCreatedByEmail(email);
        } else if (view === "myprojects") {
          data = await getAllMyProjectsByEmail(email);
        } else if (view === "alphabetical") {
          console.log("Fetching alphabetical projects");
          data = await getProjectSummaryAlphabetical(); // ✅ New line for alphabetical
        } else {
          data = await getAllProjects();
        }

        const normalized = data.map((p) => ({
          ...p,
          created_by: p.created_by || user.name,
          created_by_id: p.created_by_id || user.user_id,
          status: p.status || statusMap[p.status_id] || "Yet to Start",
        }));

        setProjects(normalized);
      } catch (err) {
        console.error("Error fetching projects:", err.message);
        alert("Could not load projects. Please try again.");
      }
    };

    fetchProjects();
  }, [SearchParams]);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query) {
      const view = SearchParams.get("view");
      const email = user.email;

      let data = [];
      if (view === "created") {
        data = await getProjectsCreatedByEmail(email);
      } else if (view === "myprojects") {
        data = await getAllMyProjectsByEmail(email);
      } else {
        data = await getAllProjects();
      }
      setProjects(data);
      return;
    }

    try {
      const data = await searchProjects(query);
      setProjects(data);
    } catch (err) {
      alert("Search failed: " + err.message);
    }
  };

  const handleViewMembers = (projectId) => {
    setSelectedProjectId(projectId);
    setShowMembersModal(true);
  };
  const handleSortChange = (value) => {
    const params = new URLSearchParams(window.location.search);
    params.set("view", value);
    router.push(`?${params.toString()}`);
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    setSelectedProjectId(null);
  };

  const handleSaveProject = async (newProject) => {};

  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setShowModal(true);
  };

  const handleAssignMembers = (projectId) => {
    setAssignProjectId(projectId);
    setShowAssignPanel(true);
  };

  const closeAssignPanel = () => {
    setAssignProjectId(null);
    setShowAssignPanel(false);
  };

  const handleAttachmentFetch = async (project) => {
    try {
      const files = await fetchProjectAttachments(project.project_id);
      setAttachments(files);
      setSelectedProjectTitle(project.title);
      setShowAttachmentsModal(true);
    } catch (err) {
      console.error("Error loading attachments:", err.message);
      alert("Failed to load attachments");
    }
  };

  return (
    <>
      <div className="flex relative">
        <SideBar />
        <BotpressChatbot />
        <div
          className={`flex-1 p-6 bg-[#F1EFEC] min-h-screen transition duration-300 ${
            showModal ? "blur-sm" : ""
          }`}
        >
          <Header
            onAddProjectClick={() => setShowModal(true)}
            onAddUserClick={() => setShowUserModal(true)}
            onSearch={handleSearch}
          />
          <div className="mt-3 mb-4 flex justify-end">
            <select
              className=" p-3 rounded-lg border border-gray-300 text-white bg-[#58A0C8] hover:bg-yellow-600 transition"
              onChange={(e) => handleSortChange(e.target.value)}
              defaultValue="default"
            >
              <option value="default">Sort by: Default</option>
              <option value="alphabetical">Sort by: A-Z</option>
            </select>
          </div>

          <div className="h-[calc(100vh-120px)] overflow-y-auto pr-2">
            {projects.map((project, index) => (
              <ProjectCard
                key={index}
                project={project}
                onViewMembers={handleViewMembers}
                onEdit={() => handleEditProject(project)}
                onAssignMembers={handleAssignMembers}
                onAttachmentFetch={handleAttachmentFetch}
              />
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <AddProjectModal
          onClose={() => {
            setShowModal(false);
            setProjectToEdit(null);
          }}
          onAssignMembers={handleAssignMembers}
          onSave={handleSaveProject}
          projectToEdit={projectToEdit}
        />
      )}
      {showUserModal && (
        <AddUserModal onClose={() => setShowUserModal(false)} />
      )}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <button
            onClick={closeMembersModal}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl font-bold"
          >
            ×
          </button>
          <SingleProjectMembersPanel
            projectId={selectedProjectId}
            onclose={() => {
              setShowMembersModal(false);
              setSelectedProjectId(null);
            }}
          />
        </div>
      )}
      {showAssignPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <button
            onClick={closeAssignPanel}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-xl font-bold"
          >
            ×
          </button>
          <MembersPanel
            projectId={assignProjectId}
            isAssigning={true}
            onclose={() => {
              setAssignProjectId(null);
              setShowAssignPanel(false);
            }}
          />
        </div>
      )}
      {showAttachmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <ProjectAttachmentsModal
            projectTitle={selectedProjectTitle}
            attachments={attachments}
            onClose={() => setShowAttachmentsModal(false)}
          />
        </div>
      )}
    </>
  );
}
