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

// Connect to MongoDB
connectMongo();

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Abre: http://localhost:${PORT}\n`);
});