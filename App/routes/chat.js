const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session.isAuthenticated) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

// Chat endpoint
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.session.user?.id || req.session.id; // Use user ID or session ID as fallback

        const response = await chatService.generateResponse(userId, message);
        
        res.json({
            message: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            message: error.message 
        });
    }
});

// Clear chat history endpoint
router.delete('/history', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user?.id || req.session.id;
        chatService.clearHistory(userId);
        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

module.exports = router; 