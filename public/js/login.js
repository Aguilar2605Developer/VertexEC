let selectedRole = 'user';

function toggleForm() {
  document.getElementById('loginTab').style.display = 
    document.getElementById('loginTab').style.display === 'none' ? 'block' : 'none';
  document.getElementById('signupTab').style.display = 
    document.getElementById('signupTab').style.display === 'none' ? 'block' : 'none';
}

function setLoginType(role) {
  selectedRole = role;
  document.getElementById('loginRole').value = role;

  document.getElementById('clientTypeBtn').classList.toggle('active', role === 'user');
  document.getElementById('proTypeBtn').classList.toggle('active', role === 'admin');

  const description = role === 'admin'
    ? 'Accede como empleado para gestionar cotizaciones y proyectos de construcción.'
    : 'Accede como cliente para enviar solicitudes y revisar propuestas de obra.';
  document.getElementById('userTypeDescription').textContent = description;
}

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
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.error || 'Error al iniciar sesión', 'danger');
        return;
      }

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
}

if (document.getElementById('signupForm')) {
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const company = document.getElementById('signupCompany').value;
    const role = document.getElementById('signupRole').value;

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company, role })
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.error || 'Error al registrarse', 'danger');
        return;
      }

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
}

window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = '/dashboard.html';
  }
});
