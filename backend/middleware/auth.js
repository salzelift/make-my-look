const { verifyToken } = require('../utils/auth');
const prisma = require('../utils/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        owner: true,
        customer: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = decoded.userId;
    req.userType = decoded.userType;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireOwner = (req, res, next) => {
  if (req.userType !== 'OWNER') {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
};

const requireCustomer = (req, res, next) => {
  if (req.userType !== 'CUSTOMER') {
    return res.status(403).json({ error: 'Customer access required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireOwner,
  requireCustomer,
  requireAdmin
};