const mongoose = require('mongoose');

const Student = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 80 },
  age:     { type: Number, default: 9, min: 3, max: 18 },
  emoji:   { type: String, default: '🦄', maxlength: 8 },
  parent:  { type: String, default: '', trim: true, maxlength: 80 },
  // Parent login code. Unique, stored uppercase.
  code:    { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 4, maxlength: 20 },
  stars:   { type: Number, default: 0, min: 0 },
  streak:  { type: Number, default: 0, min: 0 },
  subjects: [{ _id: false, n: { type: String, maxlength: 40 }, p: { type: Number, min: 0, max: 100, default: 0 } }],
  weak:     [{ type: String, maxlength: 80 }],
  tasks:    [{ _id: false, t: { type: String, maxlength: 200 }, s: { type: String, maxlength: 40 }, due: String,
               st: { type: String, enum: ['todo', 'prog', 'late', 'done'], default: 'todo' } }],
  sessions: [{ _id: false, d: String, topic: { type: String, maxlength: 120 }, note: { type: String, maxlength: 2000 },
               att: { type: Boolean, default: true } }],
  note: { type: String, default: '', maxlength: 2000 },  // message parents see
  priv: { type: String, default: '', maxlength: 4000 }   // teacher-only, never sent to parents
}, { timestamps: true });

module.exports = mongoose.model('Student', Student);
