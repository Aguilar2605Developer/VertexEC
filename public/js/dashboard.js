let currentQuotationId = null;
let materialRowCount = 0;
let laborRowCount = 0;
let allQuotations = [];
let currentUserId = null;
let allUsers = [];
let currentUserEditId = null;

const API_URL = '/api/quotations';
const USERS_API_URL = '/api/auth/users';

// Obtener token
function getToken() {
  return localStorage.getItem('token');
}

// Obtener usuario actual
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Headers para las peticiones
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
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
  
  // Auto cerrar después de 5 segundos si es success
  if (type === 'success') {
    setTimeout(() => {
      alertContainer.innerHTML = '';
    }, 5000);
  }
}

// Logout
function logout() {
  try {
    localStorage.clear();
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 100);
  } catch (error) {
    window.location.href = '/login.html';
  }
}

// Cargar cotizaciones
async function loadQuotations() {
  try {
    const response = await fetch(API_URL, {
      headers: getHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        return;
      }
      throw new Error('Error al cargar cotizaciones');
    }

    allQuotations = await response.json();
    displayQuotations();
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

// Mostrar cotizaciones en la tabla o vista de progreso
function displayQuotations() {
  const user = getCurrentUser();
  const container = document.getElementById('quotationsContainer');
  
  if (allQuotations.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-5">
        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
        <p class="mt-3">No hay cotizaciones aún</p>
      </div>
    `;
    return;
  }

  if (user.role === 'admin') {
    // Vista de tabla para admin
    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Título</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Creada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${allQuotations.map(q => `
              <tr onclick="viewQuotation('${q._id}')">
                <td><strong>${q.title}</strong></td>
                <td>${q.client_name}</td>
                <td><strong>$${(q.final_total || 0).toFixed(2)}</strong></td>
                <td><span class="badge status-${q.status}">${getStatusLabel(q.status)}</span></td>
                <td><small>${new Date(q.created_at).toLocaleDateString()}</small></td>
                <td onclick="event.stopPropagation()">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editQuotation('${q._id}')">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteQuotation('${q._id}')">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Vista de progreso para usuarios
    const stages = ['Presupuesto', 'Revisado', 'Aprobado'];
    
    container.innerHTML = allQuotations.map(q => {
      const statusIndex = getStatusIndex(q.status);
      
      return `
        <div class="card mb-3 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="card-title mb-0">${q.title}</h5>
              <span class="badge status-${q.status}">${getStatusLabel(q.status)}</span>
            </div>
            
            <div class="mb-3">
              <div class="progress" style="height: 30px;">
                ${stages.map((stage, index) => {
                  const isActive = index <= statusIndex;
                  const isCurrent = index === statusIndex;
                  return `
                    <div class="progress-bar ${isActive ? 'bg-success' : 'bg-secondary'} ${isCurrent ? 'progress-bar-striped progress-bar-animated' : ''}" 
                         style="width: ${100 / stages.length}%; font-size: 12px; line-height: 28px;">
                      ${stage}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            
            <div class="row text-center">
              <div class="col-4">
                <small class="text-muted">Cliente</small>
                <p class="mb-0">${q.client_name}</p>
              </div>
              <div class="col-4">
                <small class="text-muted">Total</small>
                <p class="mb-0"><strong>$${(q.final_total || 0).toFixed(2)}</strong></p>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-primary btn-sm" onclick="viewQuotation('${q._id}')">
                  <i class="bi bi-eye"></i> Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Función auxiliar para obtener índice del estado
function getStatusIndex(status) {
  const statusMap = {
    'draft': 0,
    'sent': 1,
    'accepted': 2,
    'rejected': 1, // Si hay rechazado, queda en revisado
    'completed': 2
  };
  return statusMap[status] || 0;
}

// Etiqueta de estado
function getStatusLabel(status) {
  const labels = {
    'draft': 'Borrador',
    'sent': 'Enviada',
    'accepted': 'Aceptada',
    'rejected': 'Rechazada',
    'completed': 'Completada'
  };
  return labels[status] || status;
}

// Agregar fila de material
function addMaterialRow(name = '', costPerUnit = '', unit = '', quantity = '') {
  materialRowCount++;
  const container = document.getElementById('materialsContainer');
  const row = document.createElement('div');
  row.className = 'row mb-2';
  row.id = `material-${materialRowCount}`;
  row.innerHTML = `
    <div class="col-md-4">
      <input type="text" class="form-control form-control-sm" placeholder="Nombre" value="${name}" 
        onchange="calculateTotal()">
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control form-control-sm" placeholder="Costo" value="${costPerUnit}" 
        min="0" step="0.01" onchange="calculateTotal()">
    </div>
    <div class="col-md-2">
      <input type="text" class="form-control form-control-sm" placeholder="Unidad" value="${unit}"
        onchange="calculateTotal()">
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control form-control-sm" placeholder="Cantidad" value="${quantity}" 
        min="0" step="0.01" onchange="calculateTotal()">
    </div>
    <div class="col-md-2">
      <button type="button" class="btn btn-sm btn-outline-danger w-100" 
        onclick="document.getElementById('material-${materialRowCount}').remove(); calculateTotal()">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
  container.appendChild(row);
}

// Agregar fila de mano de obra
function addLaborRow(description = '', hours = '', rate = '') {
  laborRowCount++;
  const container = document.getElementById('laborContainer');
  const row = document.createElement('div');
  row.className = 'row mb-2';
  row.id = `labor-${laborRowCount}`;
  row.innerHTML = `
    <div class="col-md-5">
      <input type="text" class="form-control form-control-sm" placeholder="Descripción" value="${description}"
        onchange="calculateTotal()">
    </div>
    <div class="col-md-3">
      <input type="number" class="form-control form-control-sm" placeholder="Horas" value="${hours}"
        min="0" step="0.5" onchange="calculateTotal()">
    </div>
    <div class="col-md-3">
      <input type="number" class="form-control form-control-sm" placeholder="Tarifa/hora" value="${rate}"
        min="0" step="0.01" onchange="calculateTotal()">
    </div>
    <div class="col-md-1">
      <button type="button" class="btn btn-sm btn-outline-danger w-100"
        onclick="document.getElementById('labor-${laborRowCount}').remove(); calculateTotal()">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
  container.appendChild(row);
}

// Calcular total
function calculateTotal() {
  let total = 0;

  // Materiales
  const materialRows = document.querySelectorAll('[id^="material-"]');
  materialRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const cost = parseFloat(inputs[1].value) || 0;
    const quantity = parseFloat(inputs[3].value) || 0;
    total += cost * quantity;
  });

  // Mano de obra
  const laborRows = document.querySelectorAll('[id^="labor-"]');
  laborRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const hours = parseFloat(inputs[1].value) || 0;
    const rate = parseFloat(inputs[2].value) || 0;
    total += hours * rate;
  });

  // Descuento
  const discount = parseFloat(document.getElementById('formDiscount').value) || 0;
  total -= discount;

  document.getElementById('formTotal').value = `$${total.toFixed(2)}`;

  return total;
}

// Guardar cotización
async function saveQuotation() {
  const title = document.getElementById('formTitle').value;
  const clientName = document.getElementById('formClientName').value;
  const description = document.getElementById('formDescription').value;
  const clientEmail = document.getElementById('formClientEmail').value;
  const status = document.getElementById('formStatus').value;
  const discount = parseFloat(document.getElementById('formDiscount').value) || 0;
  const notes = document.getElementById('formNotes').value;

  // Recolectar materiales
  const materials = [];
  document.querySelectorAll('[id^="material-"]').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const name = inputs[0].value;
    const cost_per_unit = parseFloat(inputs[1].value);
    const unit = inputs[2].value;
    const quantity = parseFloat(inputs[3].value);

    if (name && cost_per_unit && quantity) {
      materials.push({ name, cost_per_unit, unit, quantity });
    }
  });

  // Recolectar mano de obra
  const labor = [];
  document.querySelectorAll('[id^="labor-"]').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const description = inputs[0].value;
    const hours = parseFloat(inputs[1].value);
    const rate_per_hour = parseFloat(inputs[2].value);

    if (description && hours && rate_per_hour) {
      labor.push({ description, hours, rate_per_hour });
    }
  });

  if (!title || !clientName) {
    showAlert('Título y nombre del cliente son requeridos', 'warning');
    return;
  }

  const quotationData = {
    title,
    description,
    client_name: clientName,
    client_email: clientEmail,
    materials,
    labor,
    discount,
    status,
    notes
  };

  try {
    let response;
    let method;
    let url = API_URL;

    if (currentQuotationId) {
      method = 'PUT';
      url = `${API_URL}/${currentQuotationId}`;
    } else {
      method = 'POST';
    }

    response = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(quotationData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al guardar');
    }

    showAlert(
      currentQuotationId ? 'Cotización actualizada' : 'Cotización creada',
      'success'
    );

    // Cerrar modal y recargar
    const modal = bootstrap.Modal.getInstance(document.getElementById('quotationModal'));
    modal.hide();

    resetForm();
    loadQuotations();
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

// Resetear formulario
function resetForm() {
  document.getElementById('quotationForm').reset();
  document.getElementById('materialsContainer').innerHTML = '';
  document.getElementById('laborContainer').innerHTML = '';
  document.getElementById('formStatus').value = 'draft';
  document.getElementById('formDiscount').value = '0';
  document.getElementById('formTotal').value = '$0.00';
  currentQuotationId = null;
  materialRowCount = 0;
  laborRowCount = 0;
  document.getElementById('modalTitle').textContent = 'Nueva Cotización';
}

// Ver cotización
function viewQuotation(id) {
  const quotation = allQuotations.find(q => q._id === id);
  if (!quotation) return;

  currentQuotationId = id;

  let materialsHTML = quotation.materials.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.quantity} ${m.unit}</td>
      <td>$${m.cost_per_unit.toFixed(2)}</td>
      <td>$${(m.quantity * m.cost_per_unit).toFixed(2)}</td>
    </tr>
  `).join('');

  let laborHTML = quotation.labor.map(l => `
    <tr>
      <td>${l.description}</td>
      <td>${l.hours} hrs</td>
      <td>$${l.rate_per_hour.toFixed(2)}</td>
      <td>$${(l.hours * l.rate_per_hour).toFixed(2)}</td>
    </tr>
  `).join('');

  document.getElementById('detailsContent').innerHTML = `
    <h6>${quotation.title}</h6>
    <p><strong>Cliente:</strong> ${quotation.client_name}</p>
    <p><strong>Email:</strong> ${quotation.client_email}</p>
    <p><strong>Descripción:</strong> ${quotation.description}</p>
    
    ${materialsHTML ? `
    <h6 class="mt-3">Materiales</h6>
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Material</th>
          <th>Cantidad</th>
          <th>Costo Unitario</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>${materialsHTML}</tbody>
    </table>
    ` : ''}

    ${laborHTML ? `
    <h6>Mano de Obra</h6>
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Horas</th>
          <th>Tarifa</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>${laborHTML}</tbody>
    </table>
    ` : ''}

    <h6>Resumen</h6>
    <p><strong>Total Materiales:</strong> $${quotation.materials_total.toFixed(2)}</p>
    <p><strong>Total Mano de Obra:</strong> $${quotation.labor_total.toFixed(2)}</p>
    <p><strong>Descuento:</strong> $${quotation.discount.toFixed(2)}</p>
    <p class="h6"><strong>Total Final:</strong> $${quotation.final_total.toFixed(2)}</p>
  `;

  const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
  modal.show();
}

// Editar cotización
function editQuotation(id) {
  const quotation = allQuotations.find(q => q._id === id);
  if (!quotation) return;

  currentQuotationId = id;

  document.getElementById('formTitle').value = quotation.title;
  document.getElementById('formDescription').value = quotation.description;
  document.getElementById('formClientName').value = quotation.client_name;
  document.getElementById('formClientEmail').value = quotation.client_email;
  document.getElementById('formStatus').value = quotation.status;
  document.getElementById('formDiscount').value = quotation.discount;
  document.getElementById('formNotes').value = quotation.notes;

  document.getElementById('materialsContainer').innerHTML = '';
  quotation.materials.forEach(m => {
    addMaterialRow(m.name, m.cost_per_unit, m.unit, m.quantity);
  });

  document.getElementById('laborContainer').innerHTML = '';
  quotation.labor.forEach(l => {
    addLaborRow(l.description, l.hours, l.rate_per_hour);
  });

  calculateTotal();
  document.getElementById('modalTitle').textContent = 'Editar Cotización';

  const modal = new bootstrap.Modal(document.getElementById('quotationModal'));
  modal.show();
}

// Editar cotización actual (desde modal de detalles)
function editCurrentQuotation() {
  const modal = bootstrap.Modal.getInstance(document.getElementById('detailsModal'));
  modal.hide();
  editQuotation(currentQuotationId);
}

// Eliminar cotización actual
async function deleteCurrentQuotation() {
  if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
    await deleteQuotation(currentQuotationId);
    const modal = bootstrap.Modal.getInstance(document.getElementById('detailsModal'));
    modal.hide();
  }
}

// Eliminar cotización
async function deleteQuotation(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al eliminar');
    }

    showAlert('Cotización eliminada', 'success');
    loadQuotations();
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

// ==================== FUNCIONES DE USUARIOS ====================

// Cargar usuarios (solo admin)
async function loadUsers() {
  try {
    const response = await fetch(USERS_API_URL, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }

    allUsers = await response.json();
    displayUsers();
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

// Mostrar usuarios en la tabla
function displayUsers() {
  const tbody = document.getElementById('usersTable');
  
  if (allUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="bi bi-inbox"></i> No hay usuarios
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allUsers.map(u => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td>${u.company || '-'}</td>
      <td>
        <span class="badge ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${u.role === 'admin' ? 'Admin' : 'Usuario'}</span>
      </td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser('${u._id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${u._id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Guardar usuario
async function saveUser() {
  const form = document.getElementById('userForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const userData = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    company: document.getElementById('userCompany').value,
    phone: document.getElementById('userPhone').value,
    role: document.getElementById('userRole').value
  };

  if (currentUserEditId) {
    // Actualizar
    userData.password = document.getElementById('userPassword').value || undefined;
  } else {
    // Crear
    userData.password = document.getElementById('userPassword').value;
  }

  try {
    const method = currentUserEditId ? 'PUT' : 'POST';
    const url = currentUserEditId ? `${USERS_API_URL}/${currentUserEditId}` : USERS_API_URL;

    const response = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al guardar usuario');
    }

    const result = await response.json();
    showAlert(result.message, 'success');

    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    modal.hide();

    loadUsers();
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

// Editar usuario
function editUser(id) {
  const user = allUsers.find(u => u._id === id);
  if (!user) return;

  currentUserEditId = id;
  document.getElementById('userModalTitle').textContent = 'Editar Usuario';
  document.getElementById('userName').value = user.name;
  document.getElementById('userEmail').value = user.email;
  document.getElementById('userCompany').value = user.company || '';
  document.getElementById('userPhone').value = user.phone || '';
  document.getElementById('userRole').value = user.role;
  document.getElementById('passwordField').style.display = 'none';
  document.getElementById('userPassword').required = false;

  const modal = new bootstrap.Modal(document.getElementById('userModal'));
  modal.show();
}

// Eliminar usuario
async function deleteUser(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

  try {
    const response = await fetch(`${USERS_API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }

    showAlert('Usuario eliminado', 'success');
    loadUsers();
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

// Resetear formulario de usuario
function resetUserForm() {
  currentUserEditId = null;
  document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
  document.getElementById('userForm').reset();
  document.getElementById('passwordField').style.display = 'block';
  document.getElementById('userPassword').required = true;
}

// Inicializar
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  const user = getCurrentUser();
  if (user) {
    document.getElementById('userNameDisplay').textContent = `👤 ${user.name}`;
    
    // Mostrar pestaña de usuarios y ocultar botón de nueva cotización si es admin
    if (user.role === 'admin') {
      document.getElementById('usersTab').style.display = 'block';
      loadUsers();
    } else {
      document.getElementById('newQuotationBtn').style.display = 'none';
    }
  }

  // Event listeners para modal
  document.getElementById('quotationModal').addEventListener('hidden.bs.modal', resetForm);
  document.getElementById('userModal').addEventListener('hidden.bs.modal', resetUserForm);

  // Event listener para tabs
  document.getElementById('users-tab').addEventListener('shown.bs.tab', () => {
    if (getCurrentUser().role === 'admin') {
      loadUsers();
    }
  });

  // Agregar una fila de material y labor vacías por default
  document.getElementById('quotationModal').addEventListener('shown.bs.modal', () => {
    if (document.getElementById('materialsContainer').children.length === 0) {
      addMaterialRow();
    }
    if (document.getElementById('laborContainer').children.length === 0) {
      addLaborRow();
    }
  });

  loadQuotations();

  // Refrescar el dashboard cada 8 segundos para que los cambios de estado del admin
  // se reflejen en los dashboards de otros usuarios sin recarga manual.
  window.dashboardRefreshInterval = setInterval(loadQuotations, 8000);
  window.addEventListener('beforeunload', () => clearInterval(window.dashboardRefreshInterval));
});
