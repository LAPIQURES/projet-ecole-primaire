const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const eleveRoutes = require('./routes/eleves');
const classRoutes = require('./routes/classes');
const enseignantRoutes = require('./routes/enseignants');
const statsRoutes = require('./routes/stats');
const coursRoutes = require('./routes/cours');
const evaluationsRoutes = require('./routes/evaluations');
const evaluationsProgrammesRoutes = require('./routes/evaluationsProgrammes');
const paiementsRoutes = require('./routes/paiements');
const config = require('./config');
const salleRoutes = require('./routes/salles');
const parentRoutes = require('./routes/parents');
const inscriptionRoutes = require('./routes/inscriptions');
const busRoutes = require('./routes/bus');
const yearRoutes = require('./routes/years');
const trancheRoutes = require('./routes/tranches');
const messageRoutes = require('./routes/messages');
const auditRoutes = require('./routes/audit');
const emploiRoutes = require('./routes/emploi');
const rapportsRoutes = require('./routes/rapports');
const parametresRoutes = require('./routes/parametres');
const debugRoutes = require('./routes/debug');
const bulletinsRoutes = require('./routes/bulletins');
const disciplineRoutes = require('./routes/discipline');

const http = require('http');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple request logger for debugging / stability
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/eleves', eleveRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/evaluations-programmes', evaluationsProgrammesRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/inscriptions', inscriptionRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/tranches', trancheRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/emploi', emploiRoutes);
app.use('/api/emploi-temps', emploiRoutes);
app.use('/api/rapports', rapportsRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/bulletins', bulletinsRoutes);
app.use('/api/discipline', disciplineRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API école 🎓");
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = http.createServer(app);

// Initialize socket.io
const socketHelper = require('./socket');
socketHelper.init(server);

server.listen(config.port, () => {
  console.log(`✅ Backend lancé sur http://localhost:${config.port}`);
  console.log(`📊 BD: ${config.db.host}:${config.db.port}`);
});

// Process-level handlers to log crashes and rejections
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});
