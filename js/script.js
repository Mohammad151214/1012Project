let btn = document.querySelector("#menubtn");
let sidebar = document.querySelector(".sidebar");

btn.onclick = function () {
  sidebar.classList.toggle("active");
};

// Logout function
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Display logged-in user's name
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const usernameElement = document.getElementById('username');
  
  if (user && usernameElement) {
    usernameElement.textContent = user.name;
  }
});