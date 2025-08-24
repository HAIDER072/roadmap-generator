export type NodeStatus = 'pending' | 'learning' | 'done' | 'skipped';

export type NodeType = 'topic' | 'subtopic' | 'milestone' | 'optional' | 'prerequisite';

export interface RoadmapNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    content: string;
    resources: ResourceLink[];
    status: NodeStatus;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: string;
  };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    color?: string;
    fontSize?: number;
  };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'smoothstep' | 'straight';
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface ResourceLink {
  id?: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'documentation' | 'book' | 'tutorial' | 'practice';
  free?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface RoadmapData {
  id: string;
  title: string;
  description: string;
  category?: string;
  estimatedDuration?: string;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  metadata?: {
    author?: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    generatedBy?: string;
    provider?: string;
    difficulty?: string;
    duration?: string;
    focus?: string[];
    [key: string]: any;
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  nodeId?: string;
}

export interface ChatSession {
  id: string;
  nodeId: string;
  nodeTitle: string;
  messages: ChatMessage[];
  isActive: boolean;
}

export interface RoadmapTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  generateRoadmap: (customizations?: any) => RoadmapData;
}

export interface GenerateRoadmapRequest {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: 'short' | 'medium' | 'long';
  focus?: string[];
  customRequirements?: string;
}

export interface UserProgress {
  roadmapId: string;
  completedNodes: string[];
  inProgressNodes: string[];
  skippedNodes: string[];
  totalTimeSpent: number;
  lastAccessed: Date;
}
