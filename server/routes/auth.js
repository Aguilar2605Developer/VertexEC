const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { generateToken, verifyToken, verifyAdmin } = require('../middleware/auth');
const { getMongoStatus } = require('../config/db');
const inMemoryStore = require('../utils/inMemoryStore');

// Sign Up - Registro de usuario
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    
    // Validar que vengan los datos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    if (getMongoStatus()) {
      // Si MongoDB está disponible, usar Mongoose
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      
      // Crear nuevo usuario
      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        company,
        phone,
        role: 'user'
      });
      
      await user.save();
      
      // Generar token
      const token = generateToken(user);
      
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: user.toJSON()
      });
    } else {
      // Fallback: usar in-memory store
      const existingUser = inMemoryStore.users.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      
      const bcryptjs = require('bcryptjs');
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      
      const user = {
        _id: 'user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        company,
        phone,
        role: 'user'
      };
      
      inMemoryStore.users.push(user);
      
      const token = generateToken(user);
      
      res.status(201).json({
        message: 'Usuario registrado exitosamente (en-memory)',
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, phone: user.phone }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar que vengan los datos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    if (getMongoStatus()) {
      // Si MongoDB está disponible, usar Mongoose
      // Buscar usuario
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }
      
      // Verificar contraseña
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }
      
      // Generar token
      const token = generateToken(user);
      
      res.json({
        message: 'Sesión iniciada exitosamente',
        token,
        user: user.toJSON()
      });
    } else {
      // Fallback: usar in-memory store
      const user = inMemoryStore.users.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }
      
      // Verificar contraseña (in-memory usa bcryptjs)
      const bcryptjs = require('bcryptjs');
      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }
      
      const token = generateToken(user);
      
      res.json({
        message: 'Sesión iniciada exitosamente (en-memory)',
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, phone: user.phone }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User - Obtener usuario actual
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (getMongoStatus()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(user.toJSON());
    } else {
      const user = inMemoryStore.users.find(u => u._id === req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, phone: user.phone });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile - Actualizar perfil
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, company, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, company, phone, updated_at: new Date() },
      { new: true }
    );
    
    res.json({
      message: 'Perfil actualizado',
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password - Cambiar contraseña
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }
    
    // Actualizar contraseña
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes - Gestión de usuarios

// List all users (admin only)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (getMongoStatus()) {
      const users = await User.find({}, '-password'); // Exclude password
      res.json(users);
    } else {
      const users = inMemoryStore.users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        company: u.company,
        phone: u.phone,
        created_at: u.created_at || new Date()
      }));
      res.json(users);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user (admin only)
router.post('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, company, phone, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    if (getMongoStatus()) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      
      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        company,
        phone,
        role: role || 'user'
      });
      
      await user.save();
      
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: user.toJSON()
      });
    } else {
      const existingUser = inMemoryStore.users.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      
      const bcryptjs = require('bcryptjs');
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      
      const user = {
        _id: 'user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        company,
        phone,
        role: role || 'user',
        created_at: new Date()
      };
      
      inMemoryStore.users.push(user);
      
      res.status(201).json({
        message: 'Usuario creado exitosamente (en-memory)',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, phone: user.phone, created_at: user.created_at }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user (admin only)
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, company, phone, role } = req.body;
    
    if (getMongoStatus()) {
      const updateData = { name, email: email.toLowerCase(), company, phone, role, updated_at: new Date() };
      if (password) {
        updateData.password = password;
      }
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json({
        message: 'Usuario actualizado',
        user: user.toJSON()
      });
    } else {
      const userIndex = inMemoryStore.users.findIndex(u => u._id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      const user = inMemoryStore.users[userIndex];
      
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email.toLowerCase();
      if (company !== undefined) user.company = company;
      if (phone !== undefined) user.phone = phone;
      if (role !== undefined) user.role = role;
      user.updated_at = new Date();
      
      if (password) {
        const bcryptjs = require('bcryptjs');
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);
      }
      
      res.json({
        message: 'Usuario actualizado (en-memory)',
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, company: user.company, phone: user.phone, updated_at: user.updated_at }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (getMongoStatus()) {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.json({ message: 'Usuario eliminado exitosamente' });
    } else {
      const userIndex = inMemoryStore.users.findIndex(u => u._id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      inMemoryStore.users.splice(userIndex, 1);
      
      res.json({ message: 'Usuario eliminado exitosamente (en-memory)' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
