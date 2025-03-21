import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';

const ChatEcho = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages([]);
        setNewMessage('');
        setError(null);
        window.location.href = '/';
      } else {
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      window.location.href = '/auth/signout';
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await fetch('/api/chat/history', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setMessages([]);
        setError(null);
      } else {
        throw new Error('Failed to clear history');
      }
    } catch (error) {
      console.error('Clear history error:', error);
      setError('Failed to clear chat history. Please try again.');
    } finally {
      setClearDialogOpen(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setError(null);
    setIsLoading(true);

    try {
      // Echo the message back instead of making an API call
      const echoMessage = {
        text: `Echo: ${newMessage}`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      // Simulate a small delay to make it feel more realistic
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(prev => [...prev, echoMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chat Echo Application
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => setClearDialogOpen(true)}
            title="Clear History"
            sx={{ mr: 1 }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flexGrow: 1, py: 4 }}>
        <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Chat Room (Echo Mode)</Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <List>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    flexDirection: 'column',
                    alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                      maxWidth: '70%',
                    }}
                  >
                    <ListItemText
                      primary={message.text}
                      secondary={new Date(message.timestamp).toLocaleTimeString()}
                    />
                  </Paper>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ justifyContent: 'flex-start' }}>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <Typography>Thinking...</Typography>
                  </Paper>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          <Divider />
          
          <Box component="form" onSubmit={handleSend} sx={{ p: 2, backgroundColor: 'background.paper' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                size="small"
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!newMessage.trim() || isLoading}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear Chat History</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear all chat history? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearHistory} color="error" variant="contained">
            Clear History
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatEcho; 