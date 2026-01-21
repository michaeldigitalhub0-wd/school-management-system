const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// simple endpoint to send email via configured SMTP
router.post('/send', async (req, res)=>{
  const { to, subject, body } = req.body || {};
  if(!to || !subject || !body) return res.status(400).json({ error: 'missing' });
  try{
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
    const info = await transport.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to, subject, text: body });
    res.json({ ok:true, info });
  }catch(e){
    console.error('send error', e && e.stack || e);
    res.status(500).json({ error: 'send_failed', detail: e && e.message });
  }
});

module.exports = router;
