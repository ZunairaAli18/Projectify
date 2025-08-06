export async function changePassword(email, currentPassword, newPassword) {
  try {
    const response = await fetch('http://localhost:5000/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: error.message };
  }
}
