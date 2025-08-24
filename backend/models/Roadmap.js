const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Step title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'course', 'book', 'documentation', 'tool', 'other'],
      default: 'article'
    }
  }],
  estimatedTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'hours'
    }
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  prerequisites: [String],
  skills: [String],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  order: {
    type: Number,
    required: true
  }
}, {
  _id: false
});

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Roadmap title is required'],
    trim: true,
    maxlength: [200, 'Title must not exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description must not exceed 1000 characters']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedDuration: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'weeks'
    }
  },
  steps: {
    type: [stepSchema],
    validate: {
      validator: function(steps) {
        return steps && steps.length > 0;
      },
      message: 'Roadmap must contain at least one step'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  forks: [{
    originalRoadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap'
    },
    forkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    forkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  progress: {
    completedSteps: {
      type: Number,
      default: 0
    },
    totalSteps: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastUpdated: Date
  },
  metadata: {
    generatedBy: {
      type: String,
      enum: ['ai', 'user', 'template'],
      default: 'ai'
    },
    aiModel: String,
    prompt: String,
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
roadmapSchema.index({ createdBy: 1, createdAt: -1 });
roadmapSchema.index({ topic: 1, isPublic: 1 });
roadmapSchema.index({ tags: 1 });
roadmapSchema.index({ 'likes': 1 });
roadmapSchema.index({ title: 'text', description: 'text', topic: 'text' });

// Virtual for like count
roadmapSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for completion percentage
roadmapSchema.virtual('completionPercentage').get(function() {
  if (!this.steps || this.steps.length === 0) return 0;
  const completedSteps = this.steps.filter(step => step.isCompleted).length;
  return Math.round((completedSteps / this.steps.length) * 100);
});

// Pre-save middleware to update progress
roadmapSchema.pre('save', function(next) {
  if (this.steps) {
    const completedSteps = this.steps.filter(step => step.isCompleted).length;
    this.progress.completedSteps = completedSteps;
    this.progress.totalSteps = this.steps.length;
    this.progress.percentage = this.steps.length > 0 ? Math.round((completedSteps / this.steps.length) * 100) : 0;
    this.progress.lastUpdated = new Date();
  }
  next();
});

// Instance method to update step completion
roadmapSchema.methods.updateStepCompletion = function(stepId, isCompleted) {
  const step = this.steps.find(s => s.id === stepId);
  if (step) {
    step.isCompleted = isCompleted;
    step.completedAt = isCompleted ? new Date() : null;
    return this.save();
  }
  throw new Error('Step not found');
};

// Instance method to add a like
roadmapSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove a like
roadmapSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => !id.equals(userId));
  return this.save();
};

// Static method to find public roadmaps
roadmapSchema.statics.findPublic = function(options = {}) {
  const { topic, difficulty, tags, limit = 20, skip = 0 } = options;
  
  const query = { isPublic: true };
  
  if (topic) {
    query.topic = new RegExp(topic, 'i');
  }
  
  if (difficulty) {
    query.difficulty = difficulty;
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  return this.find(query)
    .populate('createdBy', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Roadmap', roadmapSchema);
