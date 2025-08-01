// Gemini API client for task generation
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface GeminiTask {
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'High' | 'Medium' | 'Low';
  dependencies?: string[];
}

export interface GeminiResponse {
  tasks: GeminiTask[];
  totalEstimatedHours: number;
  recommendations: string[];
}

export class GeminiClient {
  private apiKey: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }
  }

  async generateTasksFromAssignment(
    assignmentText: string,
    teamSize: number,
    projectTitle: string
  ): Promise<GeminiResponse> {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    const prompt = this.buildTaskGenerationPrompt(assignmentText, teamSize, projectTitle);

    // Try different models in order of preference
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Model ${model} failed: ${response.status} ${response.statusText}`);
          continue; // Try next model
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          console.warn(`Model ${model} returned invalid response`);
          continue; // Try next model
        }

        const responseText = data.candidates[0].content.parts[0].text;
        console.log(`Successfully used model: ${model}`);
        return this.parseGeminiResponse(responseText);
      } catch (error) {
        console.warn(`Model ${model} failed:`, error);
        continue; // Try next model
      }
    }

    // If all models fail
    throw new Error('All Gemini models failed. Please check your API key and try again.');
  }

  private buildTaskGenerationPrompt(
    assignmentText: string,
    teamSize: number,
    projectTitle: string
  ): string {
    return `You are a project management expert. Based on the following assignment, create a detailed task breakdown for a team of ${teamSize} people.

PROJECT: ${projectTitle}
TEAM SIZE: ${teamSize} people
ASSIGNMENT:
${assignmentText}

Please analyze this assignment and break it down into specific, actionable tasks that can be distributed among ${teamSize} team members. Consider:

1. Task dependencies and logical order
2. Equal workload distribution
3. Different skill requirements
4. Realistic time estimates
5. Priority levels

Respond with a JSON object in this exact format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed task description",
      "estimatedHours": 4,
      "priority": "High|Medium|Low",
      "dependencies": ["task1", "task2"]
    }
  ],
  "totalEstimatedHours": 24,
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}

Make sure the response is valid JSON and includes all required fields.`;
  }

  private parseGeminiResponse(responseText: string): GeminiResponse {
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid tasks array in response');
      }

      return {
        tasks: parsed.tasks.map((task: any) => ({
          title: task.title || 'Untitled Task',
          description: task.description || '',
          estimatedHours: task.estimatedHours || 1,
          priority: task.priority || 'Medium',
          dependencies: task.dependencies || []
        })),
        totalEstimatedHours: parsed.totalEstimatedHours || 0,
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse Gemini API response');
    }
  }
}

export const geminiClient = new GeminiClient(); 