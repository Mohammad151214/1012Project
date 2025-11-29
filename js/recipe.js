// Recipe Management JavaScript

document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the add recipe page
  const addRecipeForm = document.getElementById("addRecipeForm");
  const aiButton = document.getElementById("ai");

  // Handle AI button click
  if (aiButton) {
    aiButton.addEventListener("click", async (e) => {
      e.preventDefault();

      console.log("AI button clicked"); // Debug

      aiButton.disabled = true;
      aiButton.textContent = "Generating...";

      try {
        console.log("Calling API..."); // Debug

        const response = await fetch(
          "http://localhost:3000/api/generate-recipe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response status:", response.status); // Debug

        if (!response.ok) {
          throw new Error("API returned error");
        }

        const recipe = await response.json();
        console.log("Recipe received:", recipe); // Debug

        // Fill in the form
        document.getElementById("Recipe_title").value = recipe.title;
        const contentDiv = document.getElementById("Recipe_box");
        if (contentDiv.contentEditable === "true") {
          contentDiv.innerHTML = recipe.content.replace(/\n/g, "<br>");
        } else {
          contentDiv.value = recipe.content;
        }

        alert("Recipe generated successfully!");
      } catch (error) {
        console.error("Full error:", error);
        alert("Error: " + error.message);
      } finally {
        aiButton.disabled = false;
        aiButton.textContent = "Inspire!";
      }
    });
  }

  // Handle form submission on ADD recipe page
  if (addRecipeForm && window.location.pathname.includes("addRecipe.html")) {
    addRecipeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("Recipe_title").value;
      const contentDiv = document.getElementById("Recipe_box");
      const content = contentDiv.innerHTML || contentDiv.textContent;

      if (!title || !content) {
        alert("Please fill in all fields");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/recipes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
            userId: JSON.parse(localStorage.getItem("user")).id,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Recipe added successfully!");
          document.getElementById("Recipe_title").value = "";
          contentDiv.innerHTML = "";
          window.location.href = "dashboard.html";
        } else {
          alert(data.error || "Failed to add recipe");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding recipe");
      }
    });
  }

  // Load recipes on dashboard
  if (window.location.pathname.includes("dashboard.html")) {
    loadRecipes();
  }

  // Check if we're on the edit recipe page
  if (window.location.pathname.includes("editRecipe.html")) {
    loadRecipeForEdit();
  }

  // Rich Text Editor Functionality
  const editorToolbar = document.getElementById("editor-toolbar");

  if (editorToolbar) {
    // Handle toolbar button clicks
    editorToolbar.addEventListener("click", (e) => {
      const button = e.target.closest(".format-btn");
      if (!button) return;

      e.preventDefault();
      const command = button.dataset.command;

      // Execute the formatting command
      document.execCommand(command, false, null);

      // Keep focus on editor
      document.getElementById("Recipe_box").focus();
    });

    // Keyboard shortcuts
    const editorContent = document.getElementById("Recipe_box");
    if (editorContent) {
      editorContent.addEventListener("keydown", (e) => {
        // Bold: Ctrl+B or Cmd+B
        if ((e.ctrlKey || e.metaKey) && e.key === "b") {
          e.preventDefault();
          document.execCommand("bold", false, null);
        }
      });
    }
  }
});

async function loadRecipes() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch("http://localhost:3000/api/recipes");

    if (!response.ok) {
      throw new Error("Failed to load recipes");
    }

    const recipes = await response.json();
    let userRecipes = recipes.filter((r) => r.userId === user.id);

    // check if there's a filter selected
    const filterDropdown = document.getElementById("categoryFilter");
    if (filterDropdown && filterDropdown.value !== "all") {
      // filter by category
      userRecipes = userRecipes.filter(
        (r) => r.category === filterDropdown.value
      );
    }

    displayRecipes(userRecipes);
  } catch (error) {
    console.error("Error loading recipes:", error);
  }
}

function displayRecipes(recipes) {
  const mainContent = document.querySelector(".main-content");

  // Remove default "no recipes" card
  const defaultCard = mainContent.querySelector(".recipe-card");
  if (defaultCard) {
    defaultCard.remove();
  }

  if (recipes.length === 0) {
    const noRecipeCard = document.createElement("div");
    noRecipeCard.className = "recipe-card";
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

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    // make a category badge
    let categoryBadge = "";
    if (recipe.category) {
      categoryBadge = `<span style="display: inline-block; background: #04AA6D; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px;">${recipe.category}</span>`;
    }

    card.innerHTML = `
      <div class="recipe-img"></div>
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <div>${categoryBadge}</div>
        <p>${recipe.content.substring(0, 100).replace(/<[^>]*>/g, "")}${
      recipe.content.length > 100 ? "..." : ""
    }</p>
        <div style="margin-top: 10px; display: flex; gap: 5px; flex-wrap: wrap;">
          <button onclick="editRecipe(${
            recipe.id
          })" style="padding: 5px 10px; cursor: pointer; background: #04AA6D; color: white; border: none; border-radius: 4px;">
            <i class="fa-solid fa-edit"></i> Edit
          </button>
          <button onclick="deleteRecipe(${
            recipe.id
          })" style="padding: 5px 10px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
    mainContent.appendChild(card);
  });
}

function editRecipe(id) {
  // Store recipe ID in localStorage and redirect
  localStorage.setItem("editRecipeId", id);
  window.location.href = "editRecipe.html";
}

async function deleteRecipe(id) {
  if (!confirm("Are you sure you want to delete this recipe?")) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Recipe deleted successfully");
      window.location.reload();
    } else {
      alert("Failed to delete recipe");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while deleting recipe");
  }
}

// Load recipe data for editing
async function loadRecipeForEdit() {
  const recipeId = localStorage.getItem("editRecipeId");

  if (!recipeId) {
    alert("No recipe selected for editing");
    window.location.href = "dashboard.html";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/recipes/${recipeId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load recipe");
    }

    const recipe = await response.json();

    // Fill in the form
    // Fill in the form
    document.getElementById("Recipe_title").value = recipe.title;

    // ADD THIS - load category too
    if (recipe.category) {
      document.getElementById("Recipe_category").value = recipe.category;
    }

    const editorContent = document.getElementById("Recipe_box");

    // If content has HTML, use innerHTML, otherwise use textContent
    if (recipe.content.includes("<")) {
      editorContent.innerHTML = recipe.content;
    } else {
      editorContent.textContent = recipe.content;
    }

    // Handle PDF export button
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", () => {
        exportCurrentRecipeToPDF(recipe.id);
      });
    }

    // Handle form submission (update recipe)
    const editForm = document.getElementById("addRecipeForm");
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("Recipe_title").value;
      const contentDiv = document.getElementById("Recipe_box");
      const content = contentDiv.innerHTML || contentDiv.textContent;

      if (!title || !content) {
        alert("Please fill in all fields");
        return;
      }

      try {
        const updateResponse = await fetch(
          `http://localhost:3000/api/recipes/${recipeId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              content,
              category: document.getElementById("Recipe_category").value, // add this
            }),
          }
        );

        if (updateResponse.ok) {
          alert("Recipe updated successfully!");
          localStorage.removeItem("editRecipeId");
          window.location.href = "dashboard.html";
        } else {
          alert("Failed to update recipe");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while updating recipe");
      }
    });
  } catch (error) {
    console.error("Error loading recipe:", error);
    alert("Failed to load recipe for editing");
    window.location.href = "dashboard.html";
  }
}

// Export current recipe to PDF from edit page
async function exportCurrentRecipeToPDF(recipeId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recipes/${recipeId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load recipe");
    }

    const recipe = await response.json();

    // Load jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text(recipe.title, 20, 20);

    // Content
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");

    // Remove HTML tags and format content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = recipe.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Split text into lines that fit the page
    const lines = doc.splitTextToSize(textContent, 170);

    let yPosition = 40;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 7;

    // Add lines and handle page breaks
    lines.forEach((line) => {
      if (yPosition + lineHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += lineHeight;
    });

    // Save the PDF
    const fileName = recipe.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`${fileName}.pdf`);

    alert("PDF exported successfully!");
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("Failed to export PDF");
  }
}
// Handle form submission on ADD recipe page
if (addRecipeForm && window.location.pathname.includes("addRecipe.html")) {
  addRecipeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("Recipe_title").value;
    const contentDiv = document.getElementById("Recipe_box");
    const content = contentDiv.innerHTML || contentDiv.textContent;
    const category = document.getElementById("Recipe_category").value; // grab the category

    if (!title || !content || !category) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category: category, // send category too
          userId: JSON.parse(localStorage.getItem("user")).id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Recipe added successfully!");
        document.getElementById("Recipe_title").value = "";
        contentDiv.innerHTML = "";
        document.getElementById("Recipe_category").value = ""; // clear it
        window.location.href = "dashboard.html";
      } else {
        alert(data.error || "Failed to add recipe");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding recipe");
    }
  });
}
// Load recipes on dashboard
if (window.location.pathname.includes("dashboard.html")) {
  loadRecipes();

  // add filter listener
  const filterDropdown = document.getElementById("categoryFilter");
  if (filterDropdown) {
    filterDropdown.addEventListener("change", function () {
      loadRecipes(); // just reload when filter changes
    });
  }
}
