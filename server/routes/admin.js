const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function requireAdmin(req, res, next){
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if(!m) return res.status(401).json({ error: 'no_token' });
  try{
    const payload = jwt.verify(m[1], JWT_SECRET);
    if(!payload || (payload.role||'').toLowerCase() !== 'admin') return res.status(403).json({ error: 'not_admin' });
    req.user = payload; next();
  }catch(e){ return res.status(401).json({ error: 'invalid_token' }); }
}

// create user (admin only)
router.post('/users', requireAdmin, async (req, res)=>{
  const { role, name, email, password, phone, class: klass, subject } = req.body || {};
  if(!role || !email || !password) return res.status(400).json({ error: 'missing' });
  const hash = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO users (role,name,email,password_hash,phone,class,subject,created_at) VALUES (?,?,?,?,?,?,?,datetime('now'))`;
  db.run(sql, [role, name||'', (email||'').toLowerCase(), hash, phone||'', klass||'', subject||''], function(err){
    if(err) return res.status(500).json({ error: 'db', detail: err.message });
    res.json({ id: this.lastID });
  });
});

// list users by role (admin only)
router.get('/users', requireAdmin, (req, res)=>{
  const role = req.query.role || '';
  const sql = role ? `SELECT id,role,name,email,phone,class,subject,created_at FROM users WHERE lower(role)=? ORDER BY id DESC` : `SELECT id,role,name,email,phone,class,subject,created_at FROM users ORDER BY id DESC`;
  const params = role ? [role.toLowerCase()] : [];
  db.all(sql, params, (err, rows)=>{
    if(err) return res.status(500).json({ error: 'db' });
    res.json(rows);
  });
});

module.exports = router;
