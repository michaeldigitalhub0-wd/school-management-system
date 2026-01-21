require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);

// lightweight health
app.get('/api/health', (req, res)=> res.json({ok:true, env: process.env.NODE_ENV || 'dev'}));

app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
