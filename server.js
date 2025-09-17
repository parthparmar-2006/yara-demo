// Express server for serving sample data endpoints
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Load sample data from JSON files
let tourists, alerts, policeUnits;

try {
  tourists = JSON.parse(readFileSync(join(__dirname, 'data/tourists.json'), 'utf8'));
  alerts = JSON.parse(readFileSync(join(__dirname, 'data/alerts.json'), 'utf8'));
  policeUnits = JSON.parse(readFileSync(join(__dirname, 'data/police_units.json'), 'utf8'));
} catch (error) {
  console.error('Error loading data files:', error.message);
  process.exit(1);
}

// API endpoints
app.get('/api/tourists', (req, res) => {
  res.json(tourists);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/tourist/:id', (req, res) => {
  const tourist = tourists.find(t => t.id === req.params.id);
  if (tourist) {
    res.json(tourist);
  } else {
    res.status(404).json({ error: 'Tourist not found' });
  }
});

app.get('/api/police-units', (req, res) => {
  res.json(policeUnits);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Root endpoint
app.get('/', (req, res) => {
  res.send('Police Officer Dashboard API is running.')
})

// Optionally serve static files if you want to use Express for frontend
// Uncomment the following lines after running `npm run build`
// import { existsSync } from 'fs'
// const buildPath = join(__dirname, 'dist')
// if (existsSync(buildPath)) {
//   app.use(express.static(buildPath))
//   app.get('*', (req, res) => {
//     res.sendFile(join(buildPath, 'index.html'))
//   })
// }

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});