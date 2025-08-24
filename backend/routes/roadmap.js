const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Roadmap = require('../models/Roadmap');
const { authenticate, optionalAuth, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Middleware to fetch roadmap and add to request
const fetchRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({
        error: {
          message: 'Roadmap not found',
          code: 'ROADMAP_NOT_FOUND'
        }
      });
    }
    req.resource = roadmap;
    next();
  } catch (error) {
    return res.status(400).json({
      error: {
        message: 'Invalid roadmap ID',
        code: 'INVALID_ID'
      }
    });
  }
};

// Validation rules
const createRoadmapValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required'),
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  body('steps')
    .isArray({ min: 1 })
    .withMessage('At least one step is required'),
  body('steps.*.title')
    .trim()
    .notEmpty()
    .withMessage('Step title is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

// @route   GET /api/roadmaps
// @desc    Get roadmaps (user's own or public)
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().trim(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('tags').optional(),
  query('public').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, difficulty, tags, public: isPublic } = req.query;

    let query = {};
    
    // If public=true, show public roadmaps, otherwise show user's own roadmaps
    if (isPublic === 'true') {
      query.isPublic = true;
    } else {
      query.createdBy = req.user._id;
    }

    // Add filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    const [roadmaps, total] = await Promise.all([
      Roadmap.find(query)
        .populate('createdBy', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Roadmap.countDocuments(query)
    ]);

    res.json({
      roadmaps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'GET_ROADMAPS_ERROR'
      }
    });
  }
});

// @route   GET /api/roadmaps/public
// @desc    Get public roadmaps (for non-authenticated users)
// @access  Public
router.get('/public', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().trim(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('tags').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, difficulty, tags } = req.query;

    const options = {
      limit,
      skip,
      search,
      difficulty,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined
    };

    const [roadmaps, total] = await Promise.all([
      Roadmap.findPublic(options),
      Roadmap.countDocuments({
        isPublic: true,
        ...(difficulty && { difficulty }),
        ...(tags && { tags: { $in: Array.isArray(tags) ? tags : tags.split(',') } }),
        ...(search && {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { topic: { $regex: search, $options: 'i' } }
          ]
        })
      })
    ]);

    res.json({
      roadmaps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get public roadmaps error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'GET_PUBLIC_ROADMAPS_ERROR'
      }
    });
  }
});

// @route   GET /api/roadmaps/:id
// @desc    Get single roadmap
// @access  Private
router.get('/:id', optionalAuth, fetchRoadmap, async (req, res) => {
  try {
    const roadmap = req.resource;

    // Check if user has access to this roadmap
    const isOwner = req.user && roadmap.createdBy.toString() === req.user._id.toString();
    const isPublic = roadmap.isPublic;
    const isSharedWith = req.user && roadmap.sharedWith.some(
      share => share.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isPublic && !isSharedWith) {
      return res.status(403).json({
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Populate creator info
    await roadmap.populate('createdBy', 'username avatar');

    res.json({
      roadmap
    });

  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'GET_ROADMAP_ERROR'
      }
    });
  }
});

// @route   POST /api/roadmaps
// @desc    Create new roadmap
// @access  Private
router.post('/', authenticate, createRoadmapValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { title, description, topic, difficulty, steps, tags, isPublic, estimatedDuration, metadata } = req.body;

    // Process steps to ensure they have proper structure
    const processedSteps = steps.map((step, index) => ({
      id: step.id || `step-${index + 1}`,
      title: step.title,
      description: step.description || '',
      resources: step.resources || [],
      estimatedTime: step.estimatedTime || { value: 1, unit: 'hours' },
      difficulty: step.difficulty || 'intermediate',
      prerequisites: step.prerequisites || [],
      skills: step.skills || [],
      isCompleted: false,
      order: index + 1
    }));

    const roadmap = new Roadmap({
      title,
      description,
      topic,
      difficulty: difficulty || 'intermediate',
      estimatedDuration: estimatedDuration || { value: 1, unit: 'weeks' },
      steps: processedSteps,
      tags: tags || [],
      isPublic: isPublic || false,
      createdBy: req.user._id,
      metadata: {
        generatedBy: metadata?.generatedBy || 'user',
        aiModel: metadata?.aiModel,
        prompt: metadata?.prompt,
        version: 1
      }
    });

    await roadmap.save();
    await roadmap.populate('createdBy', 'username avatar');

    res.status(201).json({
      message: 'Roadmap created successfully',
      roadmap
    });

  } catch (error) {
    console.error('Create roadmap error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during roadmap creation',
        code: 'CREATE_ROADMAP_ERROR'
      }
    });
  }
});

// @route   PUT /api/roadmaps/:id
// @desc    Update roadmap
// @access  Private
router.put('/:id', authenticate, fetchRoadmap, checkOwnership(), createRoadmapValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const roadmap = req.resource;
    const { title, description, topic, difficulty, steps, tags, isPublic, estimatedDuration } = req.body;

    // Process steps
    const processedSteps = steps.map((step, index) => ({
      id: step.id || `step-${index + 1}`,
      title: step.title,
      description: step.description || '',
      resources: step.resources || [],
      estimatedTime: step.estimatedTime || { value: 1, unit: 'hours' },
      difficulty: step.difficulty || 'intermediate',
      prerequisites: step.prerequisites || [],
      skills: step.skills || [],
      isCompleted: step.isCompleted || false,
      completedAt: step.completedAt || null,
      order: index + 1
    }));

    // Update roadmap
    roadmap.title = title;
    roadmap.description = description;
    roadmap.topic = topic;
    roadmap.difficulty = difficulty || roadmap.difficulty;
    roadmap.estimatedDuration = estimatedDuration || roadmap.estimatedDuration;
    roadmap.steps = processedSteps;
    roadmap.tags = tags || [];
    roadmap.isPublic = isPublic !== undefined ? isPublic : roadmap.isPublic;
    roadmap.metadata.version = (roadmap.metadata.version || 1) + 1;

    await roadmap.save();
    await roadmap.populate('createdBy', 'username avatar');

    res.json({
      message: 'Roadmap updated successfully',
      roadmap
    });

  } catch (error) {
    console.error('Update roadmap error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during roadmap update',
        code: 'UPDATE_ROADMAP_ERROR'
      }
    });
  }
});

// @route   DELETE /api/roadmaps/:id
// @desc    Delete roadmap
// @access  Private
router.delete('/:id', authenticate, fetchRoadmap, checkOwnership(), async (req, res) => {
  try {
    await Roadmap.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Roadmap deleted successfully'
    });

  } catch (error) {
    console.error('Delete roadmap error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error during roadmap deletion',
        code: 'DELETE_ROADMAP_ERROR'
      }
    });
  }
});

// @route   POST /api/roadmaps/:id/steps/:stepId/complete
// @desc    Mark step as complete/incomplete
// @access  Private
router.post('/:id/steps/:stepId/complete', authenticate, fetchRoadmap, checkOwnership(), [
  body('isCompleted').isBoolean().withMessage('isCompleted must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const roadmap = req.resource;
    const { stepId } = req.params;
    const { isCompleted } = req.body;

    await roadmap.updateStepCompletion(stepId, isCompleted);

    res.json({
      message: `Step ${isCompleted ? 'completed' : 'marked as incomplete'}`,
      progress: roadmap.progress
    });

  } catch (error) {
    console.error('Update step completion error:', error);
    
    if (error.message === 'Step not found') {
      return res.status(404).json({
        error: {
          message: 'Step not found',
          code: 'STEP_NOT_FOUND'
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Internal server error during step update',
        code: 'UPDATE_STEP_ERROR'
      }
    });
  }
});

// @route   POST /api/roadmaps/:id/like
// @desc    Like/unlike roadmap
// @access  Private
router.post('/:id/like', authenticate, fetchRoadmap, async (req, res) => {
  try {
    const roadmap = req.resource;
    const userId = req.user._id;

    const isLiked = roadmap.likes.includes(userId);
    
    if (isLiked) {
      await roadmap.removeLike(userId);
    } else {
      await roadmap.addLike(userId);
    }

    res.json({
      message: isLiked ? 'Roadmap unliked' : 'Roadmap liked',
      liked: !isLiked,
      likeCount: roadmap.likeCount
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'TOGGLE_LIKE_ERROR'
      }
    });
  }
});

module.exports = router;
