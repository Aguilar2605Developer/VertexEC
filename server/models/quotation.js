const mongoose = require('mongoose');
const { roleCatalog } = require('../utils/roles');

const roleKeys = roleCatalog.map(role => role.key);

const quotationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  client_name: { type: String, required: true },
  client_email: { type: String },
  client_phone: { type: String },
  
  // Materiales (array de items)
  materials: [{
    name: String,
    cost_per_unit: Number,
    unit: String,
    quantity: Number,
    subtotal: Number
  }],
  
  // Mano de obra (array de items)
  labor: [{
    description: String,
    hours: Number,
    rate_per_hour: Number,
    subtotal: Number
  }],
  
  // Equipo asignado y roles técnicos
  assigned_team: [{
    role: { type: String, enum: roleKeys },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responsibilities: [String],
    notes: String,
    assigned_at: { type: Date, default: Date.now }
  }],
  
  // Totales
  materials_total: { type: Number, default: 0 },
  labor_total: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  
  // Discuento opcional
  discount: { type: Number, default: 0 },
  final_total: { type: Number, default: 0 },
  
  // Estado
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected', 'completed'], default: 'draft' },
  
  // Usuario propietario
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Especificaciones
  specifications: { type: String },
  notes: { type: String },
  
  // Fechas
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  valid_until: { type: Date },
  
  // Historial de cambios
  history: [{
    action: String,
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }]
});

// Calcular totales automáticamente
quotationSchema.pre('save', function(next) {
  // Calcular total de materiales
  this.materials_total = this.materials.reduce((sum, item) => {
    item.subtotal = (item.quantity || 0) * (item.cost_per_unit || 0);
    return sum + item.subtotal;
  }, 0);
  
  // Calcular total de mano de obra
  this.labor_total = this.labor.reduce((sum, item) => {
    item.subtotal = (item.hours || 0) * (item.rate_per_hour || 0);
    return sum + item.subtotal;
  }, 0);
  
  // Calcular total
  this.total = this.materials_total + this.labor_total;
  this.final_total = this.total - (this.discount || 0);
  
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);
