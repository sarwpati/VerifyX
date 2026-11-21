const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seed/seedData');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static directory for uploaded/generated certificates & assets
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'VerifyX Cryptographic Verification Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/org', require('./routes/orgRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/verify', require('./routes/verifyRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
async function startServer() {
  try {
    await connectDB();

    // Auto-seed demo data and PKI keys
    console.log('[Server] Seeding verified institutions, PKI keys, and ServiceNow credentials...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 VerifyX Cryptographic Server running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🛡️  PKI Algorithm: Ed25519 (RFC 8032) | Hasher: SHA-256`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server Start Error]', err);
    process.exit(1);
  }
}

startServer();
