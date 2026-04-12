const express = require('express');
const router = express.Router();
const Material = require('../models/material');
const Project = require('../models/project');
const Comment = require('../models/comment');

// Calculate budget
router.post('/calculate', async (req, res) => {
  const { materials, labor, specs } = req.body;
  let total = 0;

  // Calculate materials
  materials.forEach(item => {
    total += item.quantity * item.cost;
  });

  // Calculate labor
  labor.forEach(item => {
    total += item.hours * item.rate;
  });

  res.json({ total });
});

// Get all materials
router.get('/materials', async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 });
    res.json(materials);
  } catch (err) {
    // Si hay error, retornar materiales de ejemplo
    const fallbackMaterials = [
      { _id: '1', name: 'Cemento', cost_per_unit: 25.50, unit: 'kg' },
      { _id: '2', name: 'Arena', cost_per_unit: 15.00, unit: 'm3' },
      { _id: '3', name: 'Grava', cost_per_unit: 35.00, unit: 'm3' },
      { _id: '4', name: 'Acero', cost_per_unit: 85.00, unit: 'kg' },
      { _id: '5', name: 'Ladrillo', cost_per_unit: 8.50, unit: 'unidad' }
    ];
    res.json(fallbackMaterials);
  }
});

// Create new material
router.post('/materials', async (req, res) => {
  const { name, cost_per_unit, unit } = req.body;
  try {
    const material = new Material({ name, cost_per_unit, unit });
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update material cost
router.put('/materials/:id', async (req, res) => {
  const { id } = req.params;
  const { cost_per_unit } = req.body;
  try {
    const material = await Material.findByIdAndUpdate(id, { cost_per_unit }, { new: true });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete material
router.delete('/materials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Material.findByIdAndDelete(id);
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ created_at: -1 });
    res.json(projects);
  } catch (err) {
    // Si hay error (ej: MongoDB no conectado), retornar array vacío
    res.json([]);
  }
});

// Create new project
router.post('/projects', async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = new Project({ name, description });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { name, description, status, updated_at: new Date() },
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Project.findByIdAndDelete(id);
    // Also delete associated comments
    await Comment.deleteMany({ project_id: id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a project
router.get('/comments/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const comments = await Comment.find({ project_id: projectId }).sort({ timestamp: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to project
router.post('/comments', async (req, res) => {
  const { project_id, user_id, comment } = req.body;
  try {
    const newComment = new Comment({ project_id, user_id, comment });
    await newComment.save();
    res.json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Comment.findByIdAndDelete(id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;