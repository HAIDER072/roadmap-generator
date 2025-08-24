import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useRoadmapStore } from '../store/roadmapStore';
import { useAuth } from '../contexts/AuthContext';
import { RoadmapNode as CustomRoadmapNode } from '../types/roadmap';
import { Save, Check, X } from 'lucide-react';

// Custom Node Components
interface CustomNodeProps {
  data: CustomRoadmapNode['data'] & {
    onNodeClick: (node: CustomRoadmapNode) => void;
    onStatusChange: (nodeId: string, status: CustomRoadmapNode['data']['status']) => void;
    id: string;
    type: CustomRoadmapNode['type'];
    position: CustomRoadmapNode['position'];
    style?: CustomRoadmapNode['style'];
  };
}

const TopicNode: React.FC<CustomNodeProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 border-green-500 text-green-800';
      case 'learning': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'skipped': return 'bg-gray-100 border-gray-500 text-gray-600';
      default: return 'bg-white border-gray-300 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-50 text-green-700';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700';
      case 'advanced': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const handleClick = () => {
    const nodeData: CustomRoadmapNode = {
      id: data.id,
      type: data.type,
      position: data.position,
      data: {
        label: data.label,
        description: data.description,
        content: data.content,
        resources: data.resources,
        status: data.status,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime
      },
      style: data.style
    };
    data.onNodeClick(nodeData);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newStatus = data.status === 'done' ? 'pending' : 'done';
    data.onStatusChange(data.id, newStatus);
  };

  const handleShiftClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      const newStatus = data.status === 'learning' ? 'pending' : 'learning';
      data.onStatusChange(data.id, newStatus);
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg min-w-[200px] max-w-[280px] ${getStatusColor(data.status)}`}
      style={{ backgroundColor: data.style?.backgroundColor, borderColor: data.style?.borderColor }}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseDown={handleShiftClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{data.label}</h3>
        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(data.difficulty)}`}>
          {data.difficulty}
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
        {data.description}
      </p>
      
      {data.estimatedTime && (
        <div className="text-xs text-gray-500 mb-2">
          ⏱️ {data.estimatedTime}
        </div>
      )}
      
      {data.resources.length > 0 && (
        <div className="text-xs text-gray-500">
          📚 {data.resources.length} resource{data.resources.length !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-400">
        💡 Click: Learn • Right-click: Complete • Shift+click: In Progress
      </div>
    </div>
  );
};

const MilestoneNode: React.FC<CustomNodeProps> = ({ data }) => {
  const handleClick = () => {
    const nodeData: CustomRoadmapNode = {
      id: data.id,
      type: data.type,
      position: data.position,
      data: {
        label: data.label,
        description: data.description,
        content: data.content,
        resources: data.resources,
        status: data.status,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime
      },
      style: data.style
    };
    data.onNodeClick(nodeData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-purple-100 border-purple-500 text-purple-800';
      case 'learning': return 'bg-purple-50 border-purple-400 text-purple-700';
      default: return 'bg-purple-25 border-purple-300 text-purple-700';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 cursor-pointer transition-all hover:shadow-xl min-w-[200px] max-w-[280px] ${getStatusColor(data.status)}`}
      style={{ backgroundColor: data.style?.backgroundColor, borderColor: data.style?.borderColor }}
      onClick={handleClick}
    >
      <div className="flex items-center mb-2">
        <span className="text-lg mr-2">🎯</span>
        <h3 className="font-bold text-sm">{data.label}</h3>
      </div>
      
      <p className="text-xs text-purple-600 mb-2">
        {data.description}
      </p>
      
      {data.estimatedTime && (
        <div className="text-xs text-purple-500">
          ⏱️ {data.estimatedTime}
        </div>
      )}
    </div>
  );
};

const SubtopicNode: React.FC<CustomNodeProps> = ({ data }) => {
  const handleClick = () => {
    const nodeData: CustomRoadmapNode = {
      id: data.id,
      type: data.type,
      position: data.position,
      data: {
        label: data.label,
        description: data.description,
        content: data.content,
        resources: data.resources,
        status: data.status,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime
      },
      style: data.style
    };
    data.onNodeClick(nodeData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-50 border-green-400 text-green-700';
      case 'learning': return 'bg-blue-50 border-blue-400 text-blue-700';
      case 'skipped': return 'bg-gray-50 border-gray-400 text-gray-600';
      default: return 'bg-gray-25 border-gray-200 text-gray-700';
    }
  };

  return (
    <div
      className={`px-3 py-2 shadow rounded-md border cursor-pointer transition-all hover:shadow-md min-w-[150px] max-w-[220px] ${getStatusColor(data.status)}`}
      style={{ backgroundColor: data.style?.backgroundColor, borderColor: data.style?.borderColor }}
      onClick={handleClick}
    >
      <h4 className="font-medium text-sm mb-1">{data.label}</h4>
      <p className="text-xs text-gray-600 line-clamp-1">
        {data.description}
      </p>
    </div>
  );
};

interface RoadmapRendererProps {
  className?: string;
}

const RoadmapRenderer: React.FC<RoadmapRendererProps> = ({ className = '' }) => {
  const {
    currentRoadmap,
    openChat,
    updateNodeStatus,
    isFullscreen,
  } = useRoadmapStore();

  // Convert our custom nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!currentRoadmap) return [];
    
    return currentRoadmap.nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        onNodeClick: openChat,
        onStatusChange: updateNodeStatus,
        id: node.id,
        type: node.type,
        position: node.position,
        style: node.style
      },
      style: {
        ...node.style,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    }));
  }, [currentRoadmap, openChat, updateNodeStatus]);

  // Remove all edges to show nodes separately
  const initialEdges: Edge[] = useMemo(() => {
    return []; // Return empty array to remove all edges
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when roadmap changes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes: NodeTypes = useMemo(() => ({
    topic: TopicNode,
    milestone: MilestoneNode,
    subtopic: SubtopicNode,
    optional: TopicNode,
    prerequisite: TopicNode,
  }), []);

  if (!currentRoadmap) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Roadmap Selected</h2>
          <p className="text-gray-500">Generate or select a roadmap to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default RoadmapRenderer;
