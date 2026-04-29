const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const STATE_PATH = path.join(__dirname, '..', 'conf-planner.json');
const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/state', (req, res) => {
  if (!fs.existsSync(STATE_PATH)) return res.json(null);
  res.type('json').send(fs.readFileSync(STATE_PATH, 'utf8'));
});

app.put('/api/state', (req, res) => {
  fs.writeFileSync(STATE_PATH, JSON.stringify(req.body), 'utf8');
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`State file: ${STATE_PATH}`);
});
