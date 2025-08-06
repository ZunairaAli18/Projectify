export async function createUser(form){
    try {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        department: form.department_name,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    throw error;
}
};

export async function loginUser(credentials) {
  try {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }
    const userArray = [
  result.user.user_id,  // [0]
  result.user.name,     // [1]
  result.user.email,    // [2]
  result.user.role_id,   // [3]
  
];
    console.log(userArray)
   return result;
  } catch (error) {
    throw error;
  }
}


// lib/api/user.js
export async function fetchUserProfile(userId) {
  try {
    const res = await fetch('http://localhost:5000/my-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await res.json();

    if (!res.ok || !data.Success) {
      throw new Error(data.error || 'Failed to fetch user profile');
    }

    return data.profile;

  } catch (err) {
    console.error('Fetch profile error:', err.message);
    throw err;
  }
}
export async function updateUserProfile(updatedUser) {
  console.log('Updating user profile:', updatedUser);
  const res = await fetch(`http://localhost:5000/update-profile`, {
    method: 'PUT', // or PATCH
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedUser),
  });

  if (!res.ok) {
    throw new Error('Failed to update profile');
  }

  return res.json();
}
