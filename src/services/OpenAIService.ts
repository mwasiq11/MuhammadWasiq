export interface MockOpenAIResponse {
  answer: string;
  tokensUsed: number;
}

export class OpenAIService {
  private readonly mockDelay: number;

  constructor() {
    this.mockDelay = parseInt(process.env.OPENAI_MOCK_DELAY || '1000');
  }

  async generateResponse(question: string): Promise<MockOpenAIResponse> {
    // Simulate API delay
    await this.delay(this.mockDelay);

    // Generate mock response based on question
    const answer = this.generateMockAnswer(question);
    const tokensUsed = this.calculateMockTokens(question, answer);

    return { answer, tokensUsed };
  }

  private generateMockAnswer(question: string): string {
    const responses = [
      `Based on your question about "${question.substring(0, 50)}...", here's a comprehensive answer: This is a mocked OpenAI response that simulates AI-generated content. In a production environment, this would be replaced with actual OpenAI API calls.`,
      `Thank you for asking about "${question.substring(0, 50)}...". The answer to your question involves multiple factors. This is a simulated response for testing purposes.`,
      `Regarding "${question.substring(0, 50)}...", here's what you need to know: This mock response demonstrates the chat functionality. In production, this would use the real OpenAI API.`,
      `Your question "${question.substring(0, 50)}..." is interesting. Here's my analysis: This is a test response that mimics how an AI assistant would respond to your query.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private calculateMockTokens(question: string, answer: string): number {
    // Simple mock token calculation (roughly 1 token per 4 characters)
    const totalChars = question.length + answer.length;
    return Math.ceil(totalChars / 4);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
