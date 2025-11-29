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

// AI Recipe Generation
document.addEventListener('DOMContentLoaded', () => {
  const aiButton = document.getElementById('ai');
  
  if (aiButton) {
    aiButton.addEventListener('click', async (e) => {
      e.preventDefault(); // Prevent form submission
      
      // Show loading message
      aiButton.disabled = true;
      aiButton.textContent = 'Generating...';
      
      try {
        const response = await fetch('http://localhost:3000/api/generate-recipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate recipe');
        }
        
        const recipe = await response.json();
        
        // Fill in the form fields with the AI-generated recipe
        document.getElementById('Recipe_title').value = recipe.title;
        document.getElementById('Recipe_box').value = recipe.content;
        
        alert(`Recipe generated! (${recipe.cuisine} cuisine)\nYou can edit it before saving.`);
        
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate recipe. Please try again.');
      } finally {
        // Re-enable button
        aiButton.disabled = false;
        aiButton.textContent = 'Inspire!';
      }
    });
  }
});