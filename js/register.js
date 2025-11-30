document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector(".login"); // signup button
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent submission
    // Gettting form values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("pwd").value;
    // Basic password strength check
    if (password.length < 8 || password.length > 15) {
      alert("Password must be between 8-15 characters long");
      return;
    }
    try {
      // Adding data to JSON
      const response = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please login.");
        // Redirect to login page
        window.location.href = "login.html";
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during signup");
    }
  });
});
