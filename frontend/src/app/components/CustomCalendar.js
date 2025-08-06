"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useSelector } from "react-redux";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});
function getStatusLabel(statusId) {
  switch (statusId) {
    case 1:
      return "Paused";
    case 2:
      return "Yet to Start";
    case 3:
      return "In Progress";
    case 4:
      return "Completed";
    default:
      return "Unknown";
  }
}

const DnDCalendar = withDragAndDrop(Calendar);

export default function CustomCalendar() {
  const userId = useSelector((state) => state.auth.user?.user_id); // Adjust based on your Redux shape
  const [events, setEvents] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      try {
        // Fetch projects
        const projectsRes = await fetch(
          `http://localhost:5000/assigned-projects/${userId}`
        );
        const projectsData = await projectsRes.json();
        console.log(projectsData);
        // Fetch events
        console.log(userId);
        const eventsRes = await fetch(`http://localhost:5000/events/${userId}`);
        const eventsData = await eventsRes.json();
        console.log(eventsData);
        const combined = [];

        if (projectsData.Success && Array.isArray(projectsData.projects)) {
          const mappedProjects = projectsData.projects.map((item) => ({
            ...item, // spread all details
            title: item.title,
            start: new Date(item.deadline),
            end: new Date(item.deadline),
            type: "project",
          }));
          combined.push(...mappedProjects);
        }

        if (Array.isArray(eventsData)) {
          const mappedEvents = eventsData.map((item) => ({
            id: item.event_id,
            title: item.title,
            start: new Date(item.deadline),
            end: new Date(item.deadline),
            type: "event",
          }));
          combined.push(...mappedEvents);
        }

        console.log(combined);
        setEvents(combined);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAll();
  }, [userId]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.MONTH);

  const handleSelectSlot = async ({ start, end }) => {
    console.log("Selected slot:", start, end);
    const title = prompt("Enter title");
    if (!title || !userId) return;

    try {
      const response = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          title: title,
          deadline: start.toLocaleDateString("en-CA"), // Convert JS date to YYYY-MM-DD
        }),
      });

      const data = await response.json();

      if (response.ok && data.message === "Event created successfully") {
        setEvents((prev) => [
          ...prev,
          {
            id: Date.now(),
            title: title,
            start,
            end,
            type: "event",
          },
        ]);
      } else {
        console.error(data.error || "Failed to create event.");
        alert("Event creation failed.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to save event.");
    }
  };

  const handleSelectEvent = (event) => {
    if (event.type === "project") {
      setSelectedProject(event);
      setIsProjectModalOpen(true);
    } else {
      const confirmDelete = confirm(
        `Are you sure you want to delete "${event.title}"?`
      );
      if (!confirmDelete) return;

      fetch(`http://localhost:5000/delete-event/${event.id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.Success) {
            setEvents((prev) => prev.filter((e) => e.id !== event.id));
            alert("Event deleted successfully");
          } else {
            alert(data.error || "Failed to delete event");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Server error");
        });
    }
  };

  const moveEvent = async ({ event, start, end }) => {
    try {
      const response = await fetch(
        "http://localhost:5000/update-event-deadline",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_id: event.id,
            new_deadline: start.toISOString().split("T")[0], // YYYY-MM-DD
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.Success) {
        // Only update in frontend if backend update succeeded
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
        );
      } else {
        console.error(data.error || "Failed to update event");
        alert("Backend failed to update deadline");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Server error while updating deadline");
    }
  };

  //   const resizeEvent = ({ event, start, end }) => {
  //     setEvents((prev) =>
  //       prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
  //     );
  //   };

  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="flex justify-between items-center mb-4 bg-[#456882] px-4 py-2 rounded-md ">
      <div className="flex gap-2">
        <button
          className="bg-[#1B3C53] text-white px-2 py-1 rounded"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>
        <button
          className="bg-[#1B3C53] text-white px-2 py-1 rounded"
          onClick={() => onNavigate("PREV")}
        >
          ‹
        </button>
        <button
          className="bg-[#1B3C53] text-white px-2 py-1 rounded"
          onClick={() => onNavigate("NEXT")}
        >
          ›
        </button>
      </div>
      <h2 className="text-xl font-bold text-orange-700">{label}</h2>
      <div className="flex gap-2">
        <button
          className="bg-[#1B3C53] text-white px-2 py-1 rounded"
          onClick={() => onView("month")}
        >
          Month
        </button>
        <button
          className="bg-[#1B3C53] text-white px-2 py-1 rounded"
          onClick={() => onView("week")}
        >
          Week
        </button>
        <button
          className="bg-[#1B3C53] text-white px-2 py-1 rounded"
          onClick={() => onView("day")}
        >
          Day
        </button>
      </div>
    </div>
  );

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: "#1B3C53",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        padding: "2px 6px",
        fontSize: "0.875rem",
      },
    };
  };
  return (
    <div className="p-4">
      <DndProvider backend={HTML5Backend}>
        <div className="p-4 flex justify-center ">
          <div className="w-full max-w-4xl border-black">
            <DnDCalendar
              localizer={localizer}
              events={events}
              view={currentView}
              date={currentDate}
              onView={setCurrentView}
              onNavigate={setCurrentDate}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onEventDrop={moveEvent}
              resizable={false}
              onEventResize={null}
              selectable
              defaultView={Views.MONTH}
              components={{
                toolbar: CustomToolbar,
              }}
              style={{
                height: "60vh",
                backgroundColor: "#F9F3EF", //cal bg
                borderRadius: "10px",
                padding: "10px",
               
              }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: "#1B3C53",
                  borderRadius: "5px",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                },
              })}
            />
          </div>
        </div>
      </DndProvider>
      {isProjectModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-xl relative">
            <button
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">{selectedProject.title}</h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-sm font-medium">
                  {getStatusLabel(selectedProject?.status_id)}
                </span>
              </p>
              <p>
                <strong>Created By:</strong> {selectedProject.created_by_name}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {selectedProject.created_at
                  ? new Date(selectedProject.created_at).toLocaleString("en-CA")
                  : "N/A"}{" "}
              </p>
              <p>
                <strong>Deadline:</strong>{" "}
                {new Date(selectedProject.start).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
