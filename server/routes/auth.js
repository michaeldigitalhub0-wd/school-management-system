const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.post('/login', (req, res)=>{
  const { identifier, password, role } = req.body || {};
  if(!identifier || !password) return res.status(400).json({ error: 'missing' });
  const sql = `SELECT * FROM users WHERE (lower(email)=? OR lower(name)=?)`;
  db.get(sql, [ (identifier||'').toLowerCase(), (identifier||'').toLowerCase() ], (err, row)=>{
    if(err) return res.status(500).json({ error: 'db' });
    if(!row) return res.status(401).json({ error: 'invalid' });
    // optional role check
    if(role && row.role && row.role.toLowerCase() !== role.toLowerCase()){
      return res.status(403).json({ error: 'role_mismatch' });
    }
    bcrypt.compare(password, row.password_hash || '', (e, match)=>{
      if(e) return res.status(500).json({ error: 'compare' });
      if(!match) return res.status(401).json({ error: 'invalid' });
      const payload = { id: row.id, role: row.role, name: row.name, email: row.email };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
      res.json({ token, user: payload });
    });
  });
});

module.exports = router;
