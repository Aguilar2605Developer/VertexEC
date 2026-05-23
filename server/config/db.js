const mongoose = require('mongoose');
const Material = require('../models/material');
const Project = require('../models/project');
const User = require('../models/user');
require('dotenv').config();

let mongoConnected = false;

const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    console.log('⚠️  MongoDB no configurado - intentando conexión local...');
    // Intentar conexión a MongoDB local como fallback
    process.env.MONGO_URI = 'mongodb://localhost:27017/vertexec';
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    
    mongoConnected = true;
    console.log('✅ MongoDB conectado');
    console.log(`📍 Base de datos: ${process.env.MONGO_URI}`);
    
    await initializeSampleData();
    await initializeAdminUser();
    return true;
  } catch (err) {
    console.log('⚠️  MongoDB no disponible');
    console.log('💾 Sistema funcionará con en-memory storage');
    console.log('📌 Nota: Para datos persistentes, instala MongoDB en tu máquina');
    console.log('   O configura MONGO_URI en el archivo .env');
    return false;
  }
};

const initializeSampleData = async () => {
  try {
    // Check if materials already exist
    const materialCount = await Material.countDocuments();
    
    if (materialCount === 0) {
      console.log('📦 Inicializando materiales de ejemplo...');
      const sampleMaterials = [
        { name: 'Cemento', cost_per_unit: 25.50, unit: 'kg' },
        { name: 'Arena', cost_per_unit: 15.00, unit: 'm3' },
        { name: 'Grava', cost_per_unit: 35.00, unit: 'm3' },
        { name: 'Acero', cost_per_unit: 85.00, unit: 'kg' },
        { name: 'Ladrillo', cost_per_unit: 8.50, unit: 'unidad' }
      ];
      
      await Material.insertMany(sampleMaterials);
      console.log('✨ Materiales cargados');
    }
  } catch (err) {
    console.error('Error initializing sample data:', err.message);
  }
};

const initializeAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vertexec.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Administrador',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        company: 'VertexEC'
      });
      await adminUser.save();
      console.log(`🔐 Usuario administrador creado: ${adminEmail}`);
      console.log('   Contraseña inicial:', adminPassword);
    }
  } catch (err) {
    console.error('Error initializing admin user:', err.message);
  }
};

const getMongoStatus = () => mongoConnected;

module.exports = { connectMongo, getMongoStatus };