const API_BASE = "http://localhost:3000/api/auth";  // backend URL

// -------- Register form --------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      document.getElementById("registerMessage").textContent = data.message || data.error;
    } catch (err) {
      console.error(err);
      document.getElementById("registerMessage").textContent = "Registration failed";
    }
  });
}

// -------- Login form --------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role); // store role

        window.location.href = 'index.html'; // redirect to dashboard
      } else {
        document.getElementById('loginMessage').innerText = data.error || 'Login failed';
      }
    } catch(err) {
      console.error(err);
      alert('Login failed');
    }
  });
}