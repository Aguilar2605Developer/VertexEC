// In-memory storage fallback cuando MongoDB no está disponible
const inMemoryStore = {
  users: [],
  quotations: []
};

// Simular IDs únicos
let userIdCounter = 1;
let quotationIdCounter = 1;

module.exports = inMemoryStore;
