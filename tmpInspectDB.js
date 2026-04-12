const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./server/models/user');
const Quotation = require('./server/models/quotation');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vertexec', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const login = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@vertexec.com', password: 'admin123' })
    });

    const loginData = await login.json();
    console.log('LOGIN', login.status, loginData);
    if (!login.ok) return;

    const token = loginData.token;
    const quotesResp = await fetch('http://localhost:3000/api/quotations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const quotes = await quotesResp.json();
    console.log('QUOTES', quotesResp.status, JSON.stringify(quotes, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
