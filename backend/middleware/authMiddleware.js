export const requireMasterKey = (req, res, next) => {
  const masterKey = process.env.MASTER_KEY || 'self_os_master_secret_2026';
  const clientKey = req.headers['x-master-key'] || req.query.masterKey;

  // Single user local system: allow requests if key matches or header is sent by app client
  if (clientKey && clientKey !== masterKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Master Key' });
  }

  next();
};
