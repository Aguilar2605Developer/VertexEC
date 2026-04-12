let materialCount = 0;
let laborCount = 0;
let availableMaterials = [];

function addMaterial() {
  materialCount++;
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <select class="form-select" id="materialSelect${materialCount}">
      <option value="">Seleccionar material...</option>
      ${availableMaterials.map(m => `<option value="${m._id}" data-cost="${m.cost_per_unit}" data-unit="${m.unit}">${m.name} - $${m.cost_per_unit}/${m.unit}</option>`).join('')}
    </select>
    <input type="number" class="form-control" placeholder="Cantidad" id="materialQty${materialCount}" min="0" step="0.01">
    <span class="input-group-text" id="unitDisplay${materialCount}"></span>
    <button type="button" class="btn btn-danger" onclick="removeElement(this)">Eliminar</button>
  `;
  document.getElementById('materialList').appendChild(div);

  // Add event listener for material selection
  document.getElementById(`materialSelect${materialCount}`).addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const unit = selectedOption.getAttribute('data-unit') || '';
    document.getElementById(`unitDisplay${materialCount}`).textContent = unit;
  });
}

function addLabor() {
  laborCount++;
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="text" class="form-control" placeholder="Tipo de mano de obra" id="laborType${laborCount}">
    <input type="number" class="form-control" placeholder="Horas" id="laborHours${laborCount}" min="0" step="0.5">
    <input type="number" class="form-control" placeholder="Tarifa por hora" id="laborRate${laborCount}" min="0" step="0.01">
    <button type="button" class="btn btn-danger" onclick="removeElement(this)">Eliminar</button>
  `;
  document.getElementById('laborList').appendChild(div);
}

function removeElement(btn) {
  btn.parentElement.remove();
}

async function calculateBudget() {
  const materials = [];
  for (let i = 1; i <= materialCount; i++) {
    const select = document.getElementById(`materialSelect${i}`);
    const qty = parseFloat(document.getElementById(`materialQty${i}`)?.value) || 0;

    if (select && select.value) {
      const selectedOption = select.options[select.selectedIndex];
      const name = selectedOption.text.split(' - ')[0];
      const cost = parseFloat(selectedOption.getAttribute('data-cost')) || 0;
      materials.push({ name, quantity: qty, cost });
    }
  }

  const labor = [];
  for (let i = 1; i <= laborCount; i++) {
    const type = document.getElementById(`laborType${i}`)?.value;
    const hours = parseFloat(document.getElementById(`laborHours${i}`)?.value) || 0;
    const rate = parseFloat(document.getElementById(`laborRate${i}`)?.value) || 0;
    if (type) labor.push({ type, hours, rate });
  }

  const specs = document.getElementById('specsText').value;

  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materials, labor, specs })
    });

    const data = await response.json();
    document.getElementById('result').innerHTML = `
      <div class="alert alert-success">
        <h4>Presupuesto Calculado</h4>
        <p class="h3">Total: $${data.total.toFixed(2)}</p>
      </div>
    `;
  } catch (error) {
    document.getElementById('result').innerHTML = `
      <div class="alert alert-danger">
        Error al calcular presupuesto: ${error.message}
      </div>
    `;
  }
}

// Load available materials from database
async function loadMaterials() {
  try {
    const response = await fetch('/api/materials');
    if (!response.ok) throw new Error('Error en la respuesta del servidor');
    availableMaterials = await response.json();
    console.log('✅ Materiales cargados:', availableMaterials.length);
  } catch (error) {
    console.error('⚠️ Error al cargar materiales:', error);
    // Materiales de ejemplo por defecto
    availableMaterials = [
      { _id: '1', name: 'Cemento', cost_per_unit: 25.50, unit: 'kg' },
      { _id: '2', name: 'Arena', cost_per_unit: 15.00, unit: 'm3' },
      { _id: '3', name: 'Grava', cost_per_unit: 35.00, unit: 'm3' },
      { _id: '4', name: 'Acero', cost_per_unit: 85.00, unit: 'kg' },
      { _id: '5', name: 'Ladrillo', cost_per_unit: 8.50, unit: 'unidad' }
    ];
  }
}

// Load projects for dashboard
async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('Error en la respuesta del servidor');
    
    const projects = await response.json();
    const container = document.getElementById('projects');
    
    if (!Array.isArray(projects) || projects.length === 0) {
      container.innerHTML = '<p class="text-muted">📋 No hay proyectos registrados aún.</p>';
    } else {
      container.innerHTML = projects.map(p => `
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text">${p.description || 'Sin descripción'}</p>
            <small class="text-muted">Estado: <span class="badge bg-info">${p.status || 'borrador'}</span></small>
            <br/>
            <small class="text-muted">Creado: ${new Date(p.created_at).toLocaleDateString()}</small>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('⚠️ Error al cargar proyectos:', error);
    const container = document.getElementById('projects');
    container.innerHTML = '<p class="text-muted">📋 No hay proyectos registrados aún.</p>';
  }
}

window.onload = function() {
  loadMaterials();
  loadProjects();
};