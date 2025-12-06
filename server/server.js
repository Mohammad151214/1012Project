// Backend/server file
// AI mostly helped with this file
// Using express and other libraries
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 
const genAI = new GoogleGenerativeAI("AIzaSyAsKGlModdvywgtj_-HLVKkUNBU_69jHwc"); // 
const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, "..", "data", "users.json"); // JSON file for users
const RECIPES_FILE = path.join(__dirname, "..", "data", "recipes.json"); // JSON file for recipes

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

// Helper function to read data from file
async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    if (error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
}

// Helper function to write data to file
async function writeData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

// ============= USER ROUTES =============

// GET all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// GET single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const user = users.find((u) => u.id === parseInt(req.params.id));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// POST create new user
app.post("/api/users", async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const index = users.findIndex((u) => u.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email, password } = req.body;

    if (name !== undefined) {
      users[index].name = name;
    }
    if (email !== undefined) {
      users[index].email = email;
    }
    // update password only if provided
    if (password && password !== "") {
      users[index].password = password;
    }

    users[index].updatedAt = new Date().toISOString();

    await writeData(USERS_FILE, users);

    // don't send password back
    const { password: _, ...userWithoutPassword } = users[index];
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const index = users.findIndex((u) => u.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const deletedUser = users.splice(index, 1)[0];
    await writeData(USERS_FILE, users);

    res.json({ message: "User deleted", user: deletedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// POST login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// POST signup endpoint
app.post("/api/signup", async (req, res) => {
  try {
    const users = await readData(USERS_FILE);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: "Signup successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// ============= RECIPE ROUTES =============

// GET all recipes
app.get("/api/recipes", async (req, res) => {
  try {
    const recipes = await readData(RECIPES_FILE);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Failed to read recipes" });
  }
});

// GET single recipe by ID
app.get("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readData(RECIPES_FILE);
    const recipe = recipes.find((r) => r.id === parseInt(req.params.id));

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Failed to read recipe" });
  }
});

/// POST create new recipe
app.post("/api/recipes", async (req, res) => {
  try {
    const recipes = await readData(RECIPES_FILE);
    const { title, content, userId, category } = req.body; // added category here

    if (!title || !content || !userId) {
      return res
        .status(400)
        .json({ error: "Title, content and userId are required" });
    }

    const newRecipe = {
      id: recipes.length > 0 ? Math.max(...recipes.map((r) => r.id)) + 1 : 1,
      title,
      content,
      category: category || "other", // save category, default to 'other' if missing
      userId,
      createdAt: new Date().toISOString(),
    };

    recipes.push(newRecipe);
    await writeData(RECIPES_FILE, recipes);

    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// DELETE recipe
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readData(RECIPES_FILE);
    const index = recipes.findIndex((r) => r.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const deletedRecipe = recipes.splice(index, 1)[0];
    await writeData(RECIPES_FILE, recipes);

    res.json({ message: "Recipe deleted", recipe: deletedRecipe });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// POST generate AI recipe with random cuisine
app.post("/api/generate-recipe", async (req, res) => {
  try {
    const cuisines = [
      "Italian",
      "Chinese",
      "Mexican",
      "Indian",
      "Japanese",
      "Thai",
      "French",
      "Greek",
      "American",
      "Korean",
      "Vietnamese",
      "Spanish",
      "Middle Eastern",
      "Caribbean",
    ];

    const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];

    // Use gemini-pro (this is the correct free model name)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate a random ${randomCuisine} recipe. Format it exactly like this:

Title: [Recipe Name]

Ingredients:
- ingredient 1
- ingredient 2
- ingredient 3

Instructions:
1. step 1
2. step 2
3. step 3

Keep it simple, realistic, and easy to follow. Only provide the recipe, no extra commentary.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const recipeText = response.text();

    // Parse the response
    const titleMatch = recipeText.match(/Title:\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : `${randomCuisine} Recipe`;
    const content = recipeText.replace(/Title:\s*.+\n\n?/, "").trim();

    console.log("Recipe generated successfully:", title);

    res.json({
      title: title,
      content: content,
      cuisine: randomCuisine,
    });
  } catch (error) {
    console.error("Google AI Error Details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    });
    res.status(500).json({
      error: "Failed to generate recipe with AI",
      details: error.message,
    });
  }
});

// PUT update recipe
app.put("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readData(RECIPES_FILE);
    const index = recipes.findIndex((r) => r.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const { title, content, category } = req.body; // added category

    recipes[index] = {
      ...recipes[index],
      title: title || recipes[index].title,
      content: content || recipes[index].content,
      category: category || recipes[index].category, // update category
      updatedAt: new Date().toISOString(),
    };

    await writeData(RECIPES_FILE, recipes);
    res.json(recipes[index]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, "..")));

// Serve login page as default for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "login.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3000`);
  console.log(`Users file: ${USERS_FILE}`);
  console.log(`Recipes file: ${RECIPES_FILE}`);
});
