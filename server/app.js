const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectMongo } = require('./config/db');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const quotationRoutes = require('./routes/quotations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api', apiRoutes);

// Start server
const startServer = async () => {
  const connected = await connectMongo();

  if (!connected) {
    const inMemoryStore = require('./utils/inMemoryStore');
    const bcryptjs = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vertexec.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    const existingAdmin = inMemoryStore.users.find(u => u.role === 'admin');
    if (!existingAdmin) {
      const salt = await bcryptjs.genSalt(10);
      const passwordHash = await bcryptjs.hash(adminPassword, salt);
      inMemoryStore.users.push({
        _id: `admin_${Date.now()}`,
        name: 'Administrador',
        email: adminEmail,
        password: passwordHash,
        role: 'admin',
        company: 'VertexEC',
        created_at: new Date()
      });
      console.log(`🔐 Admin in-memory creado: ${adminEmail}`);
      console.log('   Contraseña inicial:', adminPassword);
    }
  }

  app.listen(PORT, () => {
    console.log(`\n✅ Servidor ejecutándose en puerto ${PORT}`);
    console.log(`🌐 Abre: http://localhost:${PORT}\n`);
  });
};

startServer();
