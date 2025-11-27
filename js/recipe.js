// Load and display all recipes
async function loadRecipes() {
  try {
    const response = await fetch('http://localhost:3000/api/recipes');
    const recipes = await response.json();
    
    const container = document.querySelector('.main-content');
    const existingCards = container.querySelectorAll('.recipe-card');
    existingCards.forEach(card => card.remove());
    
    recipes.forEach(recipe => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="recipe-img"></div>
        <div class="recipe-info">
          <h3>${recipe.title}</h3>
          <p>${recipe.content.substring(0, 50)}...</p>
          <button onclick="editRecipe(${recipe.id})">Edit</button>
          <button onclick="deleteRecipe(${recipe.id})">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
}

// Save recipe (for addRecipe.html)
async function saveRecipe(event) {
  event.preventDefault();
  
  const title = document.getElementById('Recipe_title').value;
  const content = document.getElementById('Recipe_box').value;
  const user = JSON.parse(localStorage.getItem('user'));
  
  try {
    const response = await fetch('http://localhost:3000/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        title, 
        content,
        userId: user ? user.id : null
      })
    });
    
    if (response.ok) {
      alert('Recipe saved!');
      window.location.href = 'dashboard.html';
    } else {
      alert('Failed to save recipe');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred');
  }
}

// Delete recipe
async function deleteRecipe(id) {
  if (!confirm('Are you sure you want to delete this recipe?')) return;
  
  try {
    const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      loadRecipes();
    } else {
      alert('Failed to delete recipe');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Edit recipe (redirect to edit page)
function editRecipe(id) {
  window.location.href = `editRecipe.html?id=${id}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // If on dashboard, load recipes
  if (window.location.pathname.includes('dashboard')) {
    loadRecipes();
  }
  
  // If on addRecipe page, attach form handler
  const addForm = document.querySelector('form[action=""]');
  if (addForm && window.location.pathname.includes('addRecipe')) {
    addForm.addEventListener('submit', saveRecipe);
  }
});