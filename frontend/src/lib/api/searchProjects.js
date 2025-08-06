export async function searchProjects(query) {
  try {
    const res = await fetch(`http://localhost:5000/search-projects?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Search failed");

    return data.projects;
  } catch (err) {
    console.error("Search error:", err.message);
    throw err;
  }
}
