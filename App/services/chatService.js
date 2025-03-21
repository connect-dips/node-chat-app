const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const client = new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);

class ChatService {
    constructor() {
        this.conversations = new Map();
    }

    async getChatHistory(userId) {
        return this.conversations.get(userId) || [];
    }

    async addMessage(userId, role, content) {
        const history = await this.getChatHistory(userId);
        history.push({ role, content });
        this.conversations.set(userId, history);
    }

    async generateResponse(userId, message) {
        try {
            // Add user message to history
            await this.addMessage(userId, 'user', message);

            // Get conversation history
            const history = await this.getChatHistory(userId);

            // Create messages array for Azure OpenAI
            const messages = [
                {
                    role: 'system',
                    content: 'You are a helpful and friendly AI assistant. Keep your responses concise and engaging. If you don\'t know something, be honest about it.'
                },
                ...history
            ];

            // Generate response from Azure OpenAI
            const completion = await client.getChatCompletions(
                process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
                messages,
                {
                    maxTokens: 150,
                    temperature: 0.7,
                }
            );

            const response = completion.choices[0].message.content;

            // Add AI response to history
            await this.addMessage(userId, 'assistant', response);

            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    clearHistory(userId) {
        this.conversations.delete(userId);
    }
}

module.exports = new ChatService(); 