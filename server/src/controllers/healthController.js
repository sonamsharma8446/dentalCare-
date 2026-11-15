import mongoose from 'mongoose';

const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// GET /api/v1/health: used to confirm the API and database are up
export function getHealth(req, res) {
  res.json({
    success: true,
    status: 'ok',
    database: dbStates[mongoose.connection.readyState],
    timestamp: new Date().toISOString(),
  });
}
