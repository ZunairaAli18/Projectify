export async function fetchProjectAttachments(projectId) {
  try {
    const res = await fetch(`http://localhost:5000/project/${projectId}/attachments`, {
      method: 'GET',
    });

    if (!res.ok) throw new Error('Failed to fetch attachments');

    const data = await res.json();
    return data.attachments || [];
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return [];
  }
}
