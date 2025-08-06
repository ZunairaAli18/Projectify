// utils/api.js


export async function fetchMembers() {
  try {
    const res = await fetch('http://localhost:5000/usersList');

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }

    const data = await res.json();
    console.log(data)
    console.log('hello');
    return data;

  } catch (err) {
    console.error("Fetch error:", err);
    return []; 
  }
}

export async function getUnassignedUsers(projectId) {
  if (!projectId) {
    console.warn('No projectId provided to getUnassignedUsers');
    return [];
  }

  try {
    const response = await fetch(`http://localhost:5000/${projectId}/unassigned-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch unassigned users');
    }

    console.log('Unassigned users:', result);
    return result|| [];

  } catch (error) {
    console.error('Fetch Unassigned Users Error:', error.message);
    return [];
  }
}

export async function assignMemberToProject(projectId, userId) {
  if (!projectId || !userId) {
    throw new Error('Project ID and User ID are required');
  }

  const response = await fetch(`http://localhost:5000/${projectId}/assignMember`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to assign member');
  }

  return await response.json();
}
export async function assignMemberToUserStory(storyId, userId) {
  try {
    const response = await fetch(`http://localhost:5000/user-stories/${storyId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const result = await response.json();

    if (!response.ok || result?.Success === false) {
      throw new Error(result?.error || 'Failed to assign member to user story');
    }

    return result.message;
  } catch (error) {
    console.error('Error in assignMemberToUserStory:', error.message);
    throw error;
  }
}
