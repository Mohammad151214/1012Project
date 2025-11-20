document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('username').value;
    const password = document.getElementById('pwd').value;
    
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Login successful!');
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to dashboard or home page
        window.location.href = 'dashboard.html';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login');
    }
  });
});
