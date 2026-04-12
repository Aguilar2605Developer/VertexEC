// Alternar entre login y signup
function toggleForm() {
  document.getElementById('loginTab').style.display = 
    document.getElementById('loginTab').style.display === 'none' ? 'block' : 'none';
  document.getElementById('signupTab').style.display = 
    document.getElementById('signupTab').style.display === 'none' ? 'block' : 'none';
}

// Mostrar alerta
function showAlert(message, type = 'danger') {
  const alertContainer = document.getElementById('alertContainer');
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.error || 'Error al iniciar sesión', 'danger');
      return;
    }

    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('¡Iniciando sesión...', 'success');
    
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
  } catch (error) {
    showAlert('Error de conexión: ' + error.message, 'danger');
  }
});

// Sign Up
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const company = document.getElementById('signupCompany').value;

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, company })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.error || 'Error al registrarse', 'danger');
      return;
    }

    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('¡Cuenta creada, redirigiendo...', 'success');

    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
  } catch (error) {
    showAlert('Error de conexión: ' + error.message, 'danger');
  }
});

// Verificar si ya está logueado
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = '/dashboard.html';
  }
});
