// Sidebar toggle functionality
let btn = document.querySelector("#menubtn");
let sidebar = document.querySelector(".sidebar");

btn.onclick = function () {
  sidebar.classList.toggle("active");
};

// Theme Toggle Functionality
// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply the theme on page load
if (currentTheme === 'dark') {
  document.body.classList.add('dark-mode');
}

// Toggle theme function
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  
  // Save preference to localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

// Create theme toggle button and add to page
document.addEventListener('DOMContentLoaded', function() {
  // Create button element
  const themeToggleBtn = document.createElement('button');
  themeToggleBtn.className = 'theme-toggle';
  themeToggleBtn.setAttribute('aria-label', 'Toggle theme');
  themeToggleBtn.innerHTML = `
    <i class="fa-solid fa-moon"></i>
    <i class="fa-solid fa-sun"></i>
  `;
  
  // Add click event
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Add to body
  document.body.appendChild(themeToggleBtn);
});