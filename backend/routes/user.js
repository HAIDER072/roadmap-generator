const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

const updatePreferencesValidation = [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('notifications.roadmapUpdates')
    .optional()
    .isBoolean()
    .withMessage('Roadmap update notifications must be a boolean')
];

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user.toAuthJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'GET_PROFILE_ERROR'
      }
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, updateProfileValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { username, email, firstName, lastName, avatar } = req.body;
    const userId = req.user._id;

    // Check if username or email is being changed and already exists
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(409).json({
          error: {
            message: 'Username is already taken',
            code: 'USERNAME_EXISTS'
          }
        });
      }
    }

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(409).json({
          error: {
            message: 'Email is already taken',
            code: 'EMAIL_EXISTS'
          }
        });
      }
    }

    // Update user profile
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (avatar !== undefined) updateData.avatar = avatar;

    // If email is being changed, set email verification to false
    if (email && email !== req.user.email) {
      updateData.isEmailVerified = false;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toAuthJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        error: {
          message: `${field} is already taken`,
          code: 'DUPLICATE_FIELD',
          field
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Internal server error during profile update',
        code: 'UPDATE_PROFILE_ERROR'
      }
    });
  }
});

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticate, updatePreferencesValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { theme, notifications } = req.body;
    const userId = req.user._id;

    const updateData = {};
    
    if (theme !== undefined) {
      updateData['preferences.theme'] = theme;
    }

    if (notifications) {
      if (notifications.email !== undefined) {
        updateData['preferences.notifications.email'] = notifications.email;
      }
      if (notifications.roadmapUpdates !== undefined) {
        updateData['preferences.notifications.roadmapUpdates'] = notifications.roadmapUpdates;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during preferences update',
        code: 'UPDATE_PREFERENCES_ERROR'
      }
    });
  }
});

// @route   POST /api/user/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        }
      });
    }

    // Update password
    user.password = newPassword;
    
    // Clear all refresh tokens to force re-login on all devices
    user.refreshTokens = [];
    
    await user.save();

    res.json({
      message: 'Password changed successfully. Please login again on all devices.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during password change',
        code: 'CHANGE_PASSWORD_ERROR'
      }
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticate, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Password is incorrect',
          code: 'INVALID_PASSWORD'
        }
      });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    // Note: In a production app, you might want to:
    // 1. Soft delete instead of hard delete
    // 2. Delete or anonymize related data (roadmaps, etc.)
    // 3. Send confirmation email

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during account deletion',
        code: 'DELETE_ACCOUNT_ERROR'
      }
    });
  }
});

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const Roadmap = require('../models/Roadmap');
    
    const userId = req.user._id;
    
    // Get various statistics
    const [
      totalRoadmaps,
      publicRoadmaps,
      completedRoadmaps,
      inProgressRoadmaps
    ] = await Promise.all([
      Roadmap.countDocuments({ createdBy: userId }),
      Roadmap.countDocuments({ createdBy: userId, isPublic: true }),
      Roadmap.countDocuments({ createdBy: userId, 'progress.percentage': 100 }),
      Roadmap.countDocuments({ 
        createdBy: userId, 
        'progress.percentage': { $gt: 0, $lt: 100 } 
      })
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRoadmaps = await Roadmap.countDocuments({
      createdBy: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      stats: {
        totalRoadmaps,
        publicRoadmaps,
        completedRoadmaps,
        inProgressRoadmaps,
        recentRoadmaps,
        memberSince: req.user.createdAt,
        lastLogin: req.user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'GET_STATS_ERROR'
      }
    });
  }
});

module.exports = router;
