// profile page stuff

document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // load current user data
  const usernameField = document.getElementById('username');
  const emailField = document.getElementById('email');
  
  if (usernameField) {
    usernameField.value = user.name || '';
  }
  if (emailField) {
    emailField.value = user.email || '';
  }

  // update sidebar
  updateSidebar(user.name);

  // form submit
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleSubmit);
  }

  // image upload
  const uploadImage = document.getElementById('uploadImage');
  if (uploadImage) {
    uploadImage.addEventListener('change', handleImage);
  }
});

function updateSidebar(username) {
  const userDiv = document.querySelector('.user div');
  if (userDiv && username) {
    const usernamePara = userDiv.querySelector('p:not(.bold)');
    if (usernamePara) {
      usernamePara.textContent = username;
    }
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    showMessage('User not found. Please log in again.', 'error');
    return;
  }

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('psw').value.trim();

  if (!username) {
    showMessage('Please enter a username', 'error');
    return;
  }

  if (!email) {
    showMessage('Please enter an email', 'error');
    return;
  }

  // basic email check
  if (!email.includes('@') || !email.includes('.')) {
    showMessage('Please enter a valid email', 'error');
    return;
  }

  const updateData = {
    name: username,
    email: email
  };

  if (password) {
    updateData.password = password;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try {
    const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (response.ok) {
      // update localStorage
      const updatedUser = {
        ...user,
        name: username,
        email: email
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      updateSidebar(username);
      showMessage('Profile updated!', 'success');
      document.getElementById('psw').value = '';
    } else {
      showMessage(data.error || 'Failed to update profile', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Something went wrong. Try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function showMessage(msg, type) {
  // remove old message if exists
  const oldMsg = document.querySelector('.profile-message');
  if (oldMsg) {
    oldMsg.remove();
  }

  const msgDiv = document.createElement('div');
  msgDiv.className = `profile-message ${type}`;
  msgDiv.textContent = msg;

  // style it
  if (type === 'success') {
    msgDiv.style.cssText = 'padding: 12px 20px; margin-bottom: 20px; border-radius: 8px; font-weight: 500; text-align: center; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
  } else {
    msgDiv.style.cssText = 'padding: 12px 20px; margin-bottom: 20px; border-radius: 8px; font-weight: 500; text-align: center; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
  }

  const form = document.getElementById('profileForm');
  if (form) {
    form.insertBefore(msgDiv, form.firstChild);
  }

  // auto remove success messages
  if (type === 'success') {
    setTimeout(() => {
      if (msgDiv.parentNode) {
        msgDiv.remove();
      }
    }, 3000);
  }
}

function handleImage(e) {
  const file = e.target.files[0];
  
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showMessage('Please select an image file', 'error');
    return;
  }

  // check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showMessage('Image too large. Max 5MB', 'error');
    return;
  }

  const reader = new FileReader();
  
  reader.onload = function(e) {
    const img = document.getElementById('profileImage');
    if (img) {
      img.src = e.target.result;
      showMessage('Profile picture updated! (preview only)', 'success');
    }
  };

  reader.onerror = function() {
    showMessage('Error reading file', 'error');
  };

  reader.readAsDataURL(file);
}

// delete account function
window.deleteAccount = async function() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || !user.id) {
    showMessage('User not found', 'error');
    return;
  }

  if (!confirm('Are you sure? This cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      localStorage.removeItem('user');
      alert('Account deleted. Redirecting to login...');
      window.location.href = 'login.html';
    } else {
      const data = await response.json();
      showMessage(data.error || 'Failed to delete account', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Error deleting account', 'error');
  }
}
