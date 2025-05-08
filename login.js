document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');

  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem('isAdminLoggedIn', 'true'); // Set login state
    window.location.href = 'index.html';             // Redirect to dashboard
  } else {
    errorEl.textContent = 'Invalid credentials. Please try again.';
  }
});
