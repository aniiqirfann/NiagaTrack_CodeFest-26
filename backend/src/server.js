require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error('Missing JWT_SECRET or DATABASE_URL. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/data'));
app.use('/api', require('./routes/reports'));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message, code: err.code });
  console.error(err); // real details only in the server log, never sent to the user
  res.status(500).json({ error: 'Server error', code: 'SERVER' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`NiagaTrack API running on http://localhost:${port}`));
