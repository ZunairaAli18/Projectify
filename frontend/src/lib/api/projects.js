export async function getAllProjects() {
  try {
    const response = await fetch("http://localhost:5000/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch projects");
    }
    console.log(result);
    return result;
  } catch (error) {
    console.error("Fetch Projects Error:", error.message);
    throw error;
  }
}

export async function addProject(projectData) {
  try {
    const response = await fetch("http://localhost:5000/addProject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });

    const result = await response.json();
    console.log(result);
    if (!response.ok) {
      throw new Error(result.error || "Failed to create project");
    }

    return result;
  } catch (error) {
    console.error("Create Project Error:", error.message);
    throw error;
  }
}

// lib/api/projects.js

export async function getProjectMembers(projectId) {
  if (!projectId) {
    console.warn("No projectId provided to getProjectMembers");
    return [];
  }

  try {
    const response = await fetch(
      `http://localhost:5000/${projectId}/getProjectMembers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch project members");
    }
    console.log(result);

    return result.users || []; // assuming the members are returned in `data`
  } catch (error) {
    console.error("Fetch Members Error:", error.message);
    return []; // Return empty array on failure
  }
}

export async function updateProject(payload, id) {
  if (!payload || !id) {
    console.warn("Project ID and payload are required");
    return { success: false, error: "Missing project data" };
  }

  try {
    const response = await fetch(`http://localhost:5000/${id}/updateProject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update project");
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Update Project Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function getProjectsCreatedByEmail(email) {
  try {
    const res = await fetch("http://localhost:5000/my-projects/created", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) throw new Error("Failed to fetch projects");

    const data = await res.json();
    console.log(data);
    return data.data; // assuming you return projects inside `projects`
  } catch (err) {
    console.error("Error fetching created projects:", err.message);
    return [];
  }
}

// lib/api/projects.js

export async function getAllMyProjectsByEmail(email) {
  try {
    const response = await fetch("http://localhost:5000/my-projects/all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch user projects");
    }

    return data.data || []; // assuming result is wrapped like: { Success: true, projects: [...] }
  } catch (err) {
    console.error("getAllMyProjectsByEmail error:", err);
    return [];
  }
}

// api/projects.js
export async function getProjectSummaryAlphabetical() {
  const res = await fetch(
    "http://localhost:5000/get_project_summary_alphabetical"
  );
  const json = await res.json();
  console.log("Alphabetical Project Summary:", json);

  if (!json.success) throw new Error(json.message);
  console.log("Alphabetical Project Summary:", json);
  return json.data;
}
