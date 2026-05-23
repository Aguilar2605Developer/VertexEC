const express = require('express');
const router = express.Router();
const Quotation = require('../models/quotation');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { getMongoStatus } = require('../config/db');
const inMemoryStore = require('../utils/inMemoryStore');

const elevatedRoles = ['admin', 'project_manager'];

function hasElevatedAccess(role) {
  return elevatedRoles.includes(role);
}

// Todos requieren autenticación
router.use(verifyToken);

// GET - Obtener todas las cotizaciones del usuario o todas si es admin
router.get('/', async (req, res) => {
  try {
    if (getMongoStatus()) {
      const query = hasElevatedAccess(req.user.role) ? {} : { created_by: req.user.id };
      const quotations = await Quotation.find(query)
        .populate('created_by', 'name email')
        .sort({ created_at: -1 });
      
      res.json(quotations);
    } else {
      // Fallback: usar in-memory store
      const quotations = hasElevatedAccess(req.user.role)
        ? inMemoryStore.quotations
        : inMemoryStore.quotations.filter(q => q.created_by === req.user.id);
      res.json(quotations);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener cotizaciones de todos (solo admin)
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate('created_by', 'name email')
      .sort({ created_at: -1 });
    
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Obtener una cotización específica
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('created_by', 'name email')
      .populate('history.changed_by', 'name email');
    
    if (!quotation) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    // Verificar que el usuario sea el propietario o admin
    if (quotation.created_by._id.toString() !== req.user.id && !hasElevatedAccess(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Crear nueva cotización
router.post('/', async (req, res) => {
  try {
    const { title, description, client_name, client_email, client_phone, materials, labor, discount, specifications, notes, valid_until } = req.body;
    
    const quotation = new Quotation({
      title,
      description,
      client_name,
      client_email,
      client_phone,
      materials: materials || [],
      labor: labor || [],
      discount: discount || 0,
      specifications,
      notes,
      valid_until,
      created_by: req.user.id,
      history: [{
        action: 'Cotización creada',
        changed_by: req.user.id,
        details: { status: 'draft' }
      }]
    });
    
    await quotation.save();
    await quotation.populate('created_by', 'name email');
    
    res.status(201).json({
      message: 'Cotización creada exitosamente',
      quotation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Actualizar cotización
router.put('/:id', async (req, res) => {
  try {
    let quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    // Verificar permisos
    if (quotation.created_by.toString() !== req.user.id && !hasElevatedAccess(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const { title, description, client_name, client_email, client_phone, materials, labor, discount, status, specifications, notes, valid_until } = req.body;
    
    // Guardar estado anterior para el historial
    const previousStatus = quotation.status;
    
    // Actualizar campos
    if (title !== undefined) quotation.title = title;
    if (description !== undefined) quotation.description = description;
    if (client_name !== undefined) quotation.client_name = client_name;
    if (client_email !== undefined) quotation.client_email = client_email;
    if (client_phone !== undefined) quotation.client_phone = client_phone;
    if (materials !== undefined) quotation.materials = materials;
    if (labor !== undefined) quotation.labor = labor;
    if (discount !== undefined) quotation.discount = discount;
    if (status !== undefined) quotation.status = status;
    if (specifications !== undefined) quotation.specifications = specifications;
    if (notes !== undefined) quotation.notes = notes;
    if (valid_until !== undefined) quotation.valid_until = valid_until;
    
    quotation.updated_at = new Date();
    
    // Agregar al historial
    if (status && status !== previousStatus) {
      quotation.history.push({
        action: `Estado cambiado a ${status}`,
        changed_by: req.user.id,
        details: { from: previousStatus, to: status }
      });
    } else {
      quotation.history.push({
        action: 'Cotización actualizada',
        changed_by: req.user.id,
        details: { updated_fields: Object.keys(req.body) }
      });
    }
    
    await quotation.save();
    await quotation.populate('created_by', 'name email');
    await quotation.populate('history.changed_by', 'name email');
    
    res.json({
      message: 'Cotización actualizada',
      quotation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Eliminar cotización
router.delete('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    // Solo el propietario o acceso ejecutivo puede eliminar
    if (quotation.created_by.toString() !== req.user.id && !hasElevatedAccess(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    await Quotation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Cotización eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Cambiar estado de cotización
router.post('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}` });
    }
    
    let quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    // Verificar permisos
    if (quotation.created_by.toString() !== req.user.id && !hasElevatedAccess(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const previousStatus = quotation.status;
    quotation.status = status;
    quotation.updated_at = new Date();
    
    quotation.history.push({
      action: `Estado cambiado de ${previousStatus} a ${status}`,
      changed_by: req.user.id,
      details: { from: previousStatus, to: status }
    });
    
    await quotation.save();
    await quotation.populate('created_by', 'name email');
    
    res.json({
      message: 'Estado actualizado',
      quotation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
