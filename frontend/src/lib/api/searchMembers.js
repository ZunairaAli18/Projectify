export async function searchMembers(query) {
  const res = await fetch(`http://localhost:5000/search-members?query=${encodeURIComponent(query)}`);
  
  if (!res.ok) {
    throw new Error("Failed to fetch members");
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Search failed");
  }

  return data.members;
}
