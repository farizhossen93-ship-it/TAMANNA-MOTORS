/**
 * TAMANNA MOTORS Backend Architecture Entry Point
 * Provides RESTful API endpoints and serves client assets
 */

import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Backend Schema route for DBA and developers
app.get('/api/database/schema', (_req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), 'server', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      return res.send(sql);
    }
    res.status(404).json({ error: 'Schema file not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'TAMANNA MOTORS Enterprise Cloud',
    timestamp: new Date().toISOString()
  });
});

export default app;
