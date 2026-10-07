require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const Student = require('./models/Student');

const { MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD, CLIENT_ORIGIN, PORT = 3000 } = process.env;
if (!MONGODB_URI || !JWT_SECRET || !ADMIN_PASSWORD) {
  console.error('Missing env vars: MONGODB_URI, JWT_SECRET, ADMIN_PASSWORD are required.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '200kb' }));
app.use(cors({ origin: (CLIENT_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean) }));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many tries. Wait a few minutes.' } });
const wrap = fn => (req, res) => fn(req, res).catch(e => {
  if (e.code === 11000) return res.status(409).json({ error: 'That parent code is already used.' });
  if (e.name === 'ValidationError' || e.name === 'CastError') return res.status(400).json({ error: 'Invalid data.' });
  console.error(e); res.status(500).json({ error: 'Server error.' });
});
const sha = s => crypto.createHash('sha256').update(String(s)).digest();
const sign = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
const auth = role => (req, res, next) => {
  try {
    const p = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), JWT_SECRET);
    if (p.role !== role) throw 0;
    req.user = p; next();
  } catch { res.status(401).json({ error: 'Please log in again.' }); }
};
const FIELDS = ['name', 'age', 'emoji', 'parent', 'code', 'stars', 'streak', 'subjects', 'weak', 'tasks', 'sessions', 'note', 'priv'];
const pick = b => Object.fromEntries(FIELDS.filter(k => b && b[k] !== undefined).map(k => [k, b[k]]));
const newCode = () => 'STAR' + crypto.randomInt(1000, 10000);

app.get('/', (_, res) => res.json({ ok: true }));

// --- Teacher ---
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const ok = crypto.timingSafeEqual(sha(req.body.password || ''), sha(ADMIN_PASSWORD));
  if (!ok) return res.status(401).json({ error: 'Wrong password 🙈' });
  res.json({ token: sign({ role: 'admin' }) });
});
app.get('/api/students', auth('admin'), wrap(async (_, res) => res.json(await Student.find().sort({ createdAt: 1 }).lean())));
app.post('/api/students', auth('admin'), wrap(async (req, res) => {
  const data = pick(req.body);
  data.subjects = data.subjects || [{ n: 'Math', p: 0 }, { n: 'English', p: 0 }];
  for (let i = 0; i < 5; i++) {
    try { return res.status(201).json((await Student.create({ ...data, code: data.code || newCode() })).toObject()); }
    catch (e) { if (e.code !== 11000 || req.body.code) throw e; }
  }
  res.status(500).json({ error: 'Could not make a unique code.' });
}));
app.put('/api/students/:id', auth('admin'), wrap(async (req, res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, { $set: pick(req.body) }, { new: true, runValidators: true }).lean();
  s ? res.json(s) : res.status(404).json({ error: 'Not found.' });
}));
app.delete('/api/students/:id', auth('admin'), wrap(async (req, res) => {
  await Student.findByIdAndDelete(req.params.id); res.json({ ok: true });
}));

// --- Parent: can only ever read their own child, without private notes ---
app.post('/api/parent/login', loginLimiter, wrap(async (req, res) => {
  const s = await Student.findOne({ code: String(req.body.code || '').trim().toUpperCase() }).select('_id').lean();
  if (!s) return res.status(401).json({ error: 'Code not found 🔍' });
  res.json({ token: sign({ role: 'parent', sid: String(s._id) }) });
}));
app.get('/api/me', auth('parent'), wrap(async (req, res) => {
  const s = await Student.findById(req.user.sid).select('-priv -code -__v').lean();
  s ? res.json(s) : res.status(404).json({ error: 'Not found.' });
}));

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log('API running on port ' + PORT));
}).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
