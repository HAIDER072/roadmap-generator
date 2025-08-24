const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * Middleware to authenticate user using JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Access denied. No token provided.',
          code: 'NO_TOKEN'
        }
      });
    }

    // Verify the token
    const decoded = verifyToken(token);
    
    // Find the user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Access denied. User not found.',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle different types of JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          message: 'Access denied. Token expired.',
          code: 'TOKEN_EXPIRED'
        }
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          message: 'Access denied. Invalid token.',
          code: 'INVALID_TOKEN'
        }
      });
    }
    
    return res.status(401).json({
      error: {
        message: 'Access denied. Authentication failed.',
        code: 'AUTH_FAILED'
      }
    });
  }
};

/**
 * Middleware to check if user has specific role
 * @param {string|Array} roles - Required role(s)
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: {
          message: 'Access denied. Insufficient permissions.',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: allowedRoles,
          current: userRole
        }
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 */
const checkOwnership = (resourceUserField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        }
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource ? req.resource[resourceUserField] : null;
    
    if (!resourceUserId) {
      return res.status(404).json({
        error: {
          message: 'Resource not found.',
          code: 'RESOURCE_NOT_FOUND'
        }
      });
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: 'Access denied. You can only access your own resources.',
          code: 'OWNERSHIP_REQUIRED'
        }
      });
    }

    next();
  };
};

/**
 * Middleware to validate email verification
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      }
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      error: {
        message: 'Email verification required.',
        code: 'EMAIL_VERIFICATION_REQUIRED'
      }
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkOwnership,
  requireEmailVerification
};
