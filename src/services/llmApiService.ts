import { RoadmapData, RoadmapEdge, GenerateRoadmapRequest } from '../types/roadmap';

export interface LLMApiConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
}

export interface RoadmapPromptData extends GenerateRoadmapRequest {
  provider: 'gemini' | 'openai' | 'anthropic';
}

class LLMApiService {
  private config: LLMApiConfig | null = null;

  setConfig(config: LLMApiConfig) {
    this.config = config;
  }

  getConfig(): LLMApiConfig | null {
    return this.config;
  }

  clearConfig() {
    this.config = null;
  }

  async generateRoadmapFromLLM(promptData: RoadmapPromptData): Promise<RoadmapData> {
    if (!this.config) {
      throw new Error('LLM API configuration not set. Please provide your API key.');
    }

    const prompt = this.buildRoadmapPrompt(promptData);
    
    try {
      let response: any;
      
      switch (this.config.provider) {
        case 'gemini':
          response = await this.callGeminiAPI(prompt);
          break;
        case 'openai':
          response = await this.callOpenAIAPI(prompt);
          break;
        case 'anthropic':
          response = await this.callAnthropicAPI(prompt);
          break;
        default:
          throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
      }

      return this.parseRoadmapResponse(response, promptData);
    } catch (error) {
      console.error('LLM API Error:', error);
      throw new Error('Failed to generate roadmap from LLM. Please check your API key and try again.');
    }
  }

  private buildRoadmapPrompt(data: RoadmapPromptData): string {
    const focusAreas = data.focus && data.focus.length > 0 ? data.focus.join(', ') : 'general';
    
    return `
Create a comprehensive learning roadmap for "${data.topic}" with the following specifications:
- Difficulty Level: ${data.difficulty}
- Learning Duration: ${data.duration} (short=1-3 months, medium=3-6 months, long=6+ months)
- Focus Areas: ${focusAreas}
- Additional Requirements: ${data.customRequirements || 'None'}

Please return a JSON response with the following structure:
{
  "title": "Learning Roadmap Title",
  "description": "Brief description of the roadmap",
  "nodes": [
    {
      "id": "unique-id",
      "type": "topic|milestone|subtopic|optional|prerequisite",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Topic Name",
        "description": "Brief description",
        "content": "Detailed learning content and explanation",
        "resources": [
          {
            "title": "Resource Title",
            "url": "https://example.com",
            "type": "documentation|tutorial|video|book|course|practice",
            "difficulty": "beginner|intermediate|advanced",
            "free": true
          }
        ],
        "status": "pending",
        "difficulty": "beginner|intermediate|advanced",
        "estimatedTime": "2 weeks"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-unique-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "smoothstep"
    }
  ]
}

Important guidelines:
1. Create 8-15 nodes for a comprehensive roadmap
2. Include a mix of topics, milestones, and subtopics
3. Position nodes in a logical flow (vary x: 50-800, y: 50-600)
4. Create edges to connect nodes in proper learning sequence
5. Each node should connect to its prerequisites and next steps
6. Use "smoothstep" as the edge type for all connections
7. Provide real, working URLs for resources when possible
8. Include diverse resource types (docs, tutorials, videos, books)
9. Make content detailed and educational
10. Adjust complexity based on difficulty level
11. Include practical projects as milestones
12. Ensure nodes are well-spaced (no overlapping)
13. CRITICAL: Create a connected graph - no isolated nodes!
14. Return ONLY valid JSON, no additional text

Focus on creating a practical, step-by-step learning path that guides learners from basics to advanced concepts.
`;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.config!.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  private async callOpenAIAPI(prompt: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a learning roadmap generator. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async callAnthropicAPI(prompt: string): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  private processEdges(edges: any[], nodes: any[]): RoadmapEdge[] {
    if (!edges || !Array.isArray(edges)) {
      // If LLM didn't provide edges, create sequential connections
      console.log('No edges provided by LLM, creating sequential connections');
      return this.generateSequentialEdges(nodes);
    }

    // Validate and process edges from LLM
    const validEdges: RoadmapEdge[] = [];
    const nodeIds = nodes.map(node => node.id || `node-${nodes.indexOf(node)}`);

    edges.forEach((edge, index) => {
      const edgeId = edge.id || `edge-${index}`;
      const sourceId = edge.source;
      const targetId = edge.target;

      // Validate that source and target nodes exist
      if (sourceId && targetId && 
          nodeIds.includes(sourceId) && 
          nodeIds.includes(targetId) &&
          sourceId !== targetId) {
        validEdges.push({
          id: edgeId,
          source: sourceId,
          target: targetId,
          type: edge.type || 'smoothstep'
        });
      }
    });

    // If we have valid edges, use them, otherwise create sequential ones
    if (validEdges.length > 0) {
      return validEdges;
    } else {
      console.log('Invalid edges from LLM, creating sequential connections');
      return this.generateSequentialEdges(nodes);
    }
  }

  private generateSequentialEdges(nodes: any[]): RoadmapEdge[] {
    const edges: RoadmapEdge[] = [];
    
    for (let i = 0; i < nodes.length - 1; i++) {
      const sourceId = nodes[i].id || `node-${i}`;
      const targetId = nodes[i + 1].id || `node-${i + 1}`;
      
      edges.push({
        id: `edge-${i}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep'
      });
    }
    
    return edges;
  }

  private parseRoadmapResponse(response: string, promptData: RoadmapPromptData): RoadmapData {
    try {
      // Clean the response to extract JSON
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const roadmapData = JSON.parse(jsonStr);

      // Validate and ensure required fields exist
      if (!roadmapData.nodes || !Array.isArray(roadmapData.nodes)) {
        throw new Error('Invalid roadmap structure: missing nodes array');
      }

      // Add metadata and ensure proper structure
      const processedRoadmap: RoadmapData = {
        id: `roadmap-${Date.now()}`,
        title: roadmapData.title || `${promptData.topic} Learning Roadmap`,
        description: roadmapData.description || `A comprehensive learning path for ${promptData.topic}`,
        nodes: roadmapData.nodes.map((node: any, index: number) => ({
          id: node.id || `node-${index}`,
          type: node.type || 'topic',
          position: node.position || { x: (index % 3) * 300 + 100, y: Math.floor(index / 3) * 200 + 100 },
          data: {
            label: node.data?.label || `Topic ${index + 1}`,
            description: node.data?.description || 'Learning topic',
            content: node.data?.content || 'Detailed content will be provided here.',
            resources: node.data?.resources || [],
            status: 'pending',
            difficulty: node.data?.difficulty || promptData.difficulty,
            estimatedTime: node.data?.estimatedTime || '1 week'
          },
          style: node.style || {}
        })),
        edges: this.processEdges(roadmapData.edges, roadmapData.nodes),
        metadata: {
          generatedBy: 'llm-api',
          provider: promptData.provider,
          createdAt: new Date().toISOString(),
          difficulty: promptData.difficulty,
          duration: promptData.duration,
          focus: promptData.focus
        }
      };

      return processedRoadmap;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      throw new Error('Failed to parse roadmap data from LLM response. The AI response may be malformed.');
    }
  }
}

export const llmApiService = new LLMApiService();
