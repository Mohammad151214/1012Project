// Recipe Management JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the add recipe page
  const addRecipeForm = document.getElementById('addRecipeForm');
  
  if (addRecipeForm) {
    addRecipeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('Recipe_title').value;
      const content = document.getElementById('Recipe_box').value;
      
      if (!title || !content) {
        alert('Please fill in all fields');
        return;
      }
      
      try {
        const response = await fetch('http://localhost:3000/api/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            content,
            userId: JSON.parse(localStorage.getItem('user')).id
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('Recipe added successfully!');
          // Clear form
          document.getElementById('Recipe_title').value = '';
          document.getElementById('Recipe_box').value = '';
          // Redirect to dashboard
          window.location.href = 'dashboard.html';
        } else {
          alert(data.error || 'Failed to add recipe');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding recipe');
      }
    });
  }
  
  // Load recipes on dashboard
  if (window.location.pathname.includes('dashboard.html')) {
    loadRecipes();
  }
});

async function loadRecipes() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch('http://localhost:3000/api/recipes');
    
    if (!response.ok) {
      throw new Error('Failed to load recipes');
    }
    
    const recipes = await response.json();
    const userRecipes = recipes.filter(r => r.userId === user.id);
    
    displayRecipes(userRecipes);
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
}

function displayRecipes(recipes) {
  const mainContent = document.querySelector('.main-content');
  
  // Remove default "no recipes" card
  const defaultCard = mainContent.querySelector('.recipe-card');
  if (defaultCard) {
    defaultCard.remove();
  }
  
  if (recipes.length === 0) {
    const noRecipeCard = document.createElement('div');
    noRecipeCard.className = 'recipe-card';
    noRecipeCard.innerHTML = `
      <div class="recipe-img"></div>
      <div class="recipe-info">
        <h3>No recipes yet</h3>
        <p>Add your first recipe to get started!</p>
      </div>
    `;
    mainContent.appendChild(noRecipeCard);
    return;
  }
  
  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <div class="recipe-img"></div>
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <p>${recipe.content.substring(0, 100)}${recipe.content.length > 100 ? '...' : ''}</p>
        <div style="margin-top: 10px;">
          <button onclick="editRecipe(${recipe.id})" style="margin-right: 5px; padding: 5px 10px; cursor: pointer;">Edit</button>
          <button onclick="deleteRecipe(${recipe.id})" style="padding: 5px 10px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Delete</button>
        </div>
      </div>
    `;
    mainContent.appendChild(card);
  });
}

function editRecipe(id) {
  // Store recipe ID in localStorage and redirect
  localStorage.setItem('editRecipeId', id);
  window.location.href = 'editRecipe.html';
}

async function deleteRecipe(id) {
  if (!confirm('Are you sure you want to delete this recipe?')) {
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Recipe deleted successfully');
      window.location.reload();
    } else {
      alert('Failed to delete recipe');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while deleting recipe');
  }
}