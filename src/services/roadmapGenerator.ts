import { RoadmapData, RoadmapNode, RoadmapEdge, GenerateRoadmapRequest, RoadmapTemplate } from '../types/roadmap';

// Web Development Roadmap Template
export const webDevelopmentTemplate: RoadmapTemplate = {
  id: 'web-development',
  name: 'Web Development',
  description: 'Complete roadmap for becoming a full-stack web developer',
  category: 'Programming',
  difficulty: 'beginner',
  estimatedDuration: '6-12 months',
  generateRoadmap: (customizations: any = {}) => {
    const nodes: RoadmapNode[] = [
      {
        id: 'html-basics',
        type: 'topic',
        position: { x: 250, y: 50 },
        data: {
          label: 'HTML Basics',
          description: 'Learn the fundamentals of HTML markup language',
          content: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of web content using elements and tags.',
          resources: [
            { id: 'html-1', title: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', type: 'documentation', free: true, difficulty: 'beginner' },
            { id: 'html-2', title: 'HTML Crash Course', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE', type: 'video', free: true, difficulty: 'beginner' }
          ],
          status: 'pending',
          difficulty: 'beginner',
          estimatedTime: '2-3 weeks'
        },
        style: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' }
      },
      {
        id: 'css-basics',
        type: 'topic',
        position: { x: 250, y: 200 },
        data: {
          label: 'CSS Basics',
          description: 'Master styling with Cascading Style Sheets',
          content: 'CSS (Cascading Style Sheets) is used to style and layout web pages. Learn selectors, properties, flexbox, and grid.',
          resources: [
            { id: 'css-1', title: 'CSS Complete Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', type: 'documentation', free: true, difficulty: 'beginner' },
            { id: 'css-2', title: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/', type: 'tutorial', free: true, difficulty: 'beginner' }
          ],
          status: 'pending',
          difficulty: 'beginner',
          estimatedTime: '3-4 weeks'
        },
        style: { backgroundColor: '#e8f5e8', borderColor: '#388e3c' }
      },
      {
        id: 'js-basics',
        type: 'topic',
        position: { x: 250, y: 350 },
        data: {
          label: 'JavaScript Fundamentals',
          description: 'Learn programming with JavaScript',
          content: 'JavaScript is a programming language that enables interactive web pages. Learn variables, functions, DOM manipulation, and ES6+ features.',
          resources: [
            { id: 'js-1', title: 'JavaScript.info', url: 'https://javascript.info/', type: 'tutorial', free: true, difficulty: 'beginner' },
            { id: 'js-2', title: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net/', type: 'book', free: true, difficulty: 'intermediate' }
          ],
          status: 'pending',
          difficulty: 'intermediate',
          estimatedTime: '4-6 weeks'
        },
        style: { backgroundColor: '#fff3e0', borderColor: '#f57c00' }
      },
      {
        id: 'react-basics',
        type: 'topic',
        position: { x: 100, y: 500 },
        data: {
          label: 'React Fundamentals',
          description: 'Build dynamic UIs with React',
          content: 'React is a JavaScript library for building user interfaces. Learn components, state, props, and hooks.',
          resources: [
            { id: 'react-1', title: 'React Official Tutorial', url: 'https://react.dev/learn', type: 'tutorial', free: true, difficulty: 'intermediate' },
            { id: 'react-2', title: 'React Crash Course', url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', type: 'video', free: true, difficulty: 'intermediate' }
          ],
          status: 'pending',
          difficulty: 'intermediate',
          estimatedTime: '4-5 weeks'
        },
        style: { backgroundColor: '#e3f2fd', borderColor: '#0277bd' }
      },
      {
        id: 'backend-basics',
        type: 'topic',
        position: { x: 400, y: 500 },
        data: {
          label: 'Backend Development',
          description: 'Server-side programming with Node.js',
          content: 'Learn server-side development with Node.js, Express.js, and database integration.',
          resources: [
            { id: 'node-1', title: 'Node.js Guide', url: 'https://nodejs.org/en/docs/', type: 'documentation', free: true, difficulty: 'intermediate' },
            { id: 'express-1', title: 'Express.js Tutorial', url: 'https://expressjs.com/', type: 'tutorial', free: true, difficulty: 'intermediate' }
          ],
          status: 'pending',
          difficulty: 'intermediate',
          estimatedTime: '5-6 weeks'
        },
        style: { backgroundColor: '#e8f5e8', borderColor: '#388e3c' }
      },
      {
        id: 'database',
        type: 'topic',
        position: { x: 250, y: 650 },
        data: {
          label: 'Database Management',
          description: 'Learn SQL and NoSQL databases',
          content: 'Understand database design, SQL queries, and popular databases like PostgreSQL and MongoDB.',
          resources: [
            { id: 'sql-1', title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'tutorial', free: true, difficulty: 'beginner' },
            { id: 'mongo-1', title: 'MongoDB University', url: 'https://university.mongodb.com/', type: 'course', free: true, difficulty: 'intermediate' }
          ],
          status: 'pending',
          difficulty: 'intermediate',
          estimatedTime: '3-4 weeks'
        },
        style: { backgroundColor: '#fff3e0', borderColor: '#f57c00' }
      },
      {
        id: 'fullstack-project',
        type: 'milestone',
        position: { x: 250, y: 800 },
        data: {
          label: 'Full-Stack Project',
          description: 'Build a complete web application',
          content: 'Create a full-stack web application combining frontend and backend technologies.',
          resources: [
            { id: 'project-1', title: 'Project Ideas', url: 'https://github.com/florinpop17/app-ideas', type: 'article', free: true, difficulty: 'intermediate' }
          ],
          status: 'pending',
          difficulty: 'advanced',
          estimatedTime: '4-8 weeks'
        },
        style: { backgroundColor: '#f3e5f5', borderColor: '#7b1fa2' }
      }
    ];

    const edges: RoadmapEdge[] = [
      { id: 'e1', source: 'html-basics', target: 'css-basics', type: 'smoothstep' },
      { id: 'e2', source: 'css-basics', target: 'js-basics', type: 'smoothstep' },
      { id: 'e3', source: 'js-basics', target: 'react-basics', type: 'smoothstep' },
      { id: 'e4', source: 'js-basics', target: 'backend-basics', type: 'smoothstep' },
      { id: 'e5', source: 'react-basics', target: 'database', type: 'smoothstep' },
      { id: 'e6', source: 'backend-basics', target: 'database', type: 'smoothstep' },
      { id: 'e7', source: 'database', target: 'fullstack-project', type: 'smoothstep' }
    ];

    return {
      id: 'web-dev-roadmap',
      title: 'Web Development Roadmap',
      description: 'A comprehensive guide to becoming a full-stack web developer',
      category: 'Web Development',
      estimatedDuration: '6-12 months',
      nodes,
      edges,
      metadata: {
        author: 'Roadmap Generator',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['web-development', 'javascript', 'react', 'node.js', 'full-stack']
      }
    };
  }
};

// Data Science Roadmap Template
export const dataScienceTemplate: RoadmapTemplate = {
  id: 'data-science',
  name: 'Data Science',
  description: 'Complete roadmap for becoming a data scientist',
  category: 'Data Science',
  difficulty: 'intermediate',
  estimatedDuration: '8-12 months',
  generateRoadmap: () => {
    const nodes: RoadmapNode[] = [
      {
        id: 'python-basics',
        type: 'topic',
        position: { x: 250, y: 50 },
        data: {
          label: 'Python Programming',
          description: 'Learn Python fundamentals for data science',
          content: 'Python is the most popular language for data science. Master syntax, data structures, and libraries.',
          resources: [
            { id: 'py-1', title: 'Python.org Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'tutorial', free: true, difficulty: 'beginner' }
          ],
          status: 'pending',
          difficulty: 'beginner',
          estimatedTime: '3-4 weeks'
        },
        style: { backgroundColor: '#e3f2fd', borderColor: '#1976d2' }
      },
      {
        id: 'statistics',
        type: 'topic',
        position: { x: 250, y: 200 },
        data: {
          label: 'Statistics & Mathematics',
          description: 'Essential mathematical foundations',
          content: 'Learn descriptive statistics, probability, hypothesis testing, and linear algebra.',
          resources: [
            { id: 'stat-1', title: 'Khan Academy Statistics', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course', free: true, difficulty: 'intermediate' }
          ],
          status: 'pending',
          difficulty: 'intermediate',
          estimatedTime: '4-6 weeks'
        },
        style: { backgroundColor: '#e8f5e8', borderColor: '#388e3c' }
      }
    ];

    const edges: RoadmapEdge[] = [
      { id: 'e1', source: 'python-basics', target: 'statistics', type: 'smoothstep' }
    ];

    return {
      id: 'data-science-roadmap',
      title: 'Data Science Roadmap',
      description: 'A comprehensive guide to becoming a data scientist',
      category: 'Data Science',
      estimatedDuration: '8-12 months',
      nodes,
      edges,
      metadata: {
        author: 'Roadmap Generator',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['data-science', 'python', 'machine-learning', 'statistics']
      }
    };
  }
};

// Template registry
export const templates: RoadmapTemplate[] = [
  webDevelopmentTemplate,
  dataScienceTemplate
];

// Roadmap generation service
export class RoadmapGeneratorService {
  
  static getTemplates(): RoadmapTemplate[] {
    return templates;
  }

  static getTemplateById(id: string): RoadmapTemplate | undefined {
    return templates.find(template => template.id === id);
  }

  static generateRoadmap(request: GenerateRoadmapRequest): RoadmapData | null {
    // Find matching template based on topic
    let template: RoadmapTemplate | undefined;
    
    if (request.topic.toLowerCase().includes('web') || request.topic.toLowerCase().includes('frontend') || request.topic.toLowerCase().includes('react')) {
      template = webDevelopmentTemplate;
    } else if (request.topic.toLowerCase().includes('data') || request.topic.toLowerCase().includes('machine learning') || request.topic.toLowerCase().includes('ai')) {
      template = dataScienceTemplate;
    } else {
      // Default to web development for unrecognized topics
      template = webDevelopmentTemplate;
    }

    if (!template) return null;

    // Generate roadmap with customizations
    const roadmap = template.generateRoadmap({
      difficulty: request.difficulty,
      duration: request.duration,
      focus: request.focus,
      customRequirements: request.customRequirements
    });

    return roadmap;
  }

  static createCustomRoadmap(
    title: string, 
    description: string, 
    topics: string[]
  ): RoadmapData {
    const nodes: RoadmapNode[] = topics.map((topic, index) => ({
      id: `topic-${index}`,
      type: 'topic' as const,
      position: { x: 250, y: 50 + (index * 150) },
      data: {
        label: topic,
        description: `Learn about ${topic}`,
        content: `This section covers ${topic}. You'll learn the fundamentals and practical applications.`,
        resources: [],
        status: 'pending' as const,
        difficulty: 'intermediate' as const,
        estimatedTime: '2-3 weeks'
      },
      style: { 
        backgroundColor: `hsl(${index * 60}, 60%, 90%)`, 
        borderColor: `hsl(${index * 60}, 60%, 60%)` 
      }
    }));

    const edges: RoadmapEdge[] = nodes.slice(0, -1).map((_, index) => ({
      id: `e-${index}`,
      source: `topic-${index}`,
      target: `topic-${index + 1}`,
      type: 'smoothstep' as const
    }));

    return {
      id: `custom-${Date.now()}`,
      title,
      description,
      category: 'Custom',
      estimatedDuration: `${topics.length * 2}-${topics.length * 4} weeks`,
      nodes,
      edges,
      metadata: {
        author: 'User',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['custom']
      }
    };
  }
}
