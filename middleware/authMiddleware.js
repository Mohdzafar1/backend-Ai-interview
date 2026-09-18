const jwt = require('jsonwebtoken');
const User = require('../model/User');

/**
 * Manual authentication middleware
 * Usage: router.get('/route', manualAuth(), handler)
 */
const authMiddleware = () => {
  return async (req, res, next) => {
    try {
      let token;

      // Read token from Authorization header
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
      ) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ message: 'Auth token missing' });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      );

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Invalid token user' });
      }

      // attach user
      req.user = user;

      next(); // ✅ always function
    } catch (err) {
      console.error('MANUAL AUTH ERROR:', err.message);
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

module.exports = authMiddleware;