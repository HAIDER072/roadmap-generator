import { create } from 'zustand';
import { RoadmapData, RoadmapNode, ChatSession, ChatMessage, UserProgress, NodeStatus } from '../types/roadmap';

interface RoadmapState {
  // Current roadmap data
  currentRoadmap: RoadmapData | null;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Selected node for chat
  selectedNode: RoadmapNode | null;
  
  // Chat sessions
  chatSessions: ChatSession[];
  activeChatSession: ChatSession | null;
  
  // User progress
  userProgress: UserProgress | null;
  
  // UI states
  isChatOpen: boolean;
  isFullscreen: boolean;
  
  // Actions
  setCurrentRoadmap: (roadmap: RoadmapData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Node actions
  selectNode: (node: RoadmapNode) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  
  // Chat actions
  openChat: (node: RoadmapNode) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  addAssistantMessage: (content: string, nodeId?: string) => void;
  
  // Progress actions
  updateProgress: (progress: Partial<UserProgress>) => void;
  
  // UI actions
  toggleFullscreen: () => void;
}

export const useRoadmapStore = create<RoadmapState>((set, get) => ({
  // Initial state
  currentRoadmap: null,
  isLoading: false,
  error: null,
  selectedNode: null,
  chatSessions: [],
  activeChatSession: null,
  userProgress: null,
  isChatOpen: false,
  isFullscreen: false,
  
  // Basic setters
  setCurrentRoadmap: (roadmap) => set({ currentRoadmap: roadmap }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Node actions
  selectNode: (node) => set({ selectedNode: node }),
  
  updateNodeStatus: (nodeId, status) => set((state) => {
    if (!state.currentRoadmap) return state;
    
    const updatedNodes = state.currentRoadmap.nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, status } } : node
    );
    
    const updatedRoadmap = {
      ...state.currentRoadmap,
      nodes: updatedNodes
    };
    
    // Update selected node if it's the same one
    const updatedSelectedNode = state.selectedNode?.id === nodeId
      ? updatedNodes.find(n => n.id === nodeId) || null
      : state.selectedNode;
    
    return {
      ...state,
      currentRoadmap: updatedRoadmap,
      selectedNode: updatedSelectedNode
    };
  }),
  
  // Chat actions
  openChat: (node) => {
    const state = get();
    let chatSession = state.chatSessions.find(session => session.nodeId === node.id);
    
    if (!chatSession) {
      const newChatSession: ChatSession = {
        id: `chat-${node.id}-${Date.now()}`,
        nodeId: node.id,
        nodeTitle: node.data.label,
        messages: [
          {
            id: `msg-${Date.now()}`,
            type: 'assistant',
            content: `Hi! I'm here to help you learn about **${node.data.label}**.

${node.data.content}

Here are some key points to get you started:
- **Description**: ${node.data.description}
- **Difficulty**: ${node.data.difficulty}
- **Estimated Time**: ${node.data.estimatedTime || 'Not specified'}

Feel free to ask me any questions about this topic!`,
            timestamp: new Date(),
            nodeId: node.id
          }
        ],
        isActive: true
      };
      
      set((state) => ({
        ...state,
        chatSessions: [...state.chatSessions, newChatSession],
        activeChatSession: newChatSession,
        selectedNode: node,
        isChatOpen: true
      }));
    } else {
      set((state) => ({
        ...state,
        activeChatSession: chatSession,
        selectedNode: node,
        isChatOpen: true
      }));
    }
  },
  
  closeChat: () => set({ isChatOpen: false, activeChatSession: null }),
  
  sendMessage: (content) => {
    const state = get();
    if (!state.activeChatSession) return;
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
      nodeId: state.activeChatSession.nodeId
    };
    
    set((currentState) => ({
      ...currentState,
      chatSessions: currentState.chatSessions.map(session =>
        session.id === currentState.activeChatSession?.id
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      ),
      activeChatSession: currentState.activeChatSession
        ? { ...currentState.activeChatSession, messages: [...currentState.activeChatSession.messages, userMessage] }
        : null
    }));
    
    // Simulate AI response (in real app, this would call an API)
    setTimeout(() => {
      get().addAssistantMessage(generateAIResponse(content, state.selectedNode), state.activeChatSession?.nodeId);
    }, 1000);
  },
  
  addAssistantMessage: (content, nodeId) => {
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content,
      timestamp: new Date(),
      nodeId
    };
    
    set((state) => ({
      ...state,
      chatSessions: state.chatSessions.map(session =>
        session.id === state.activeChatSession?.id
          ? { ...session, messages: [...session.messages, assistantMessage] }
          : session
      ),
      activeChatSession: state.activeChatSession
        ? { ...state.activeChatSession, messages: [...state.activeChatSession.messages, assistantMessage] }
        : null
    }));
  },
  
  // Progress actions
  updateProgress: (progress) => set((state) => ({
    ...state,
    userProgress: state.userProgress ? { ...state.userProgress, ...progress } : null
  })),
  
  // UI actions
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
}));

// Simulate AI response generation
function generateAIResponse(userMessage: string, selectedNode: RoadmapNode | null): string {
  const lowercaseMessage = userMessage.toLowerCase();
  
  if (!selectedNode) {
    return "I'm here to help! Please select a topic from the roadmap to get specific guidance.";
  }
  
  if (lowercaseMessage.includes('how') || lowercaseMessage.includes('start') || lowercaseMessage.includes('begin')) {
    return `Great question! To get started with **${selectedNode.data.label}**, I recommend:

1. **Begin with the basics** - Make sure you understand the fundamental concepts
2. **Practice hands-on** - Theory is important, but practical experience is key
3. **Use the resources** - I've included some great learning materials for this topic

${selectedNode.data.resources.length > 0 ? 
`Here are the top resources I recommend:
${selectedNode.data.resources.slice(0, 2).map(r => `- [${r.title}](${r.url}) (${r.type})`).join('\n')}` 
: 'Let me know if you need specific resource recommendations!'}

What specific aspect would you like to focus on first?`;
  }
  
  if (lowercaseMessage.includes('resource') || lowercaseMessage.includes('learn') || lowercaseMessage.includes('study')) {
    if (selectedNode.data.resources.length > 0) {
      return `Here are all the learning resources for **${selectedNode.data.label}**:

${selectedNode.data.resources.map(r => 
  `**${r.title}** - ${r.type} ${r.free ? '(Free)' : '(Paid)'}
  - Difficulty: ${r.difficulty}
  - Link: [${r.url}](${r.url})
`).join('\n')}

Which type of resource do you prefer to start with?`;
    } else {
      return `I don't have specific resources loaded for **${selectedNode.data.label}** right now, but I can suggest some general approaches:

1. **Official Documentation** - Always start with official docs
2. **Interactive Tutorials** - Hands-on learning is very effective
3. **Video Courses** - Great for visual learners
4. **Practice Projects** - Build something real!

Would you like me to recommend some specific resources for this topic?`;
    }
  }
  
  if (lowercaseMessage.includes('difficult') || lowercaseMessage.includes('hard') || lowercaseMessage.includes('challenge')) {
    return `Don't worry! **${selectedNode.data.label}** is rated as **${selectedNode.data.difficulty}** level, and with the right approach, you can master it.

Here are some tips to make it easier:
- **Break it down** - Focus on one concept at a time
- **Practice regularly** - Consistency beats intensity
- **Join communities** - Learning with others helps a lot
- **Don't rush** - Take your time to really understand each concept

The estimated time for this topic is **${selectedNode.data.estimatedTime || '2-3 weeks'}**. Remember, everyone learns at their own pace!

What specific part are you finding most challenging?`;
  }
  
  if (lowercaseMessage.includes('next') || lowercaseMessage.includes('after') || lowercaseMessage.includes('done')) {
    return `Excellent progress on **${selectedNode.data.label}**! 🎉

Once you've mastered this topic, you can move on to the next steps in your roadmap. Based on the learning path, the connected topics will become available.

Don't forget to:
- ✅ Mark this topic as complete when you're confident
- 🔄 Review the key concepts periodically
- 🚀 Apply what you've learned in a practical project

Is there anything specific about this topic you'd like to review before moving on?`;
  }
  
  // Generic response
  return `That's a great question about **${selectedNode.data.label}**! 

${selectedNode.data.content}

This topic is important because it ${selectedNode.data.description.toLowerCase()}. 

Feel free to ask me more specific questions about:
- Key concepts and fundamentals
- Best practices and common patterns
- Learning resources and next steps
- Common challenges and how to overcome them

What would you like to explore further?`;
}
