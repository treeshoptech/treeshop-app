"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useRouter } from 'next/navigation';
import {
  Drawer,
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  AutoAwesome as SparkleIcon,
  NavigateNext as NavigateIcon,
} from '@mui/icons-material';
import { useAIContext } from './AIContext';

interface AIAssistantSidebarProps {
  open: boolean;
  onClose: () => void;
  context?: {
    currentPage?: string;
    currentProject?: any;
    currentCustomer?: any;
    recentActions?: string[];
  };
}

export function AIAssistantSidebar({ open, onClose, context: propContext }: AIAssistantSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const { context, addRecentAction } = useAIContext();

  // Merge prop context with global context
  const fullContext = { ...context, ...propContext };

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      context: fullContext,
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Quick action suggestions based on context
  const quickActions = context.quickActions || [];

  const handleQuickAction = (action: string, route?: string) => {
    if (route) {
      router.push(route);
      addRecentAction(`Navigated to ${route}`);
      onClose();
    } else {
      setInputValue(action);
      // Simulate form submission
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent, {
        data: { content: action },
      });
      addRecentAction(action);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          backgroundColor: '#000000',
          borderLeft: '1px solid #2C2C2E',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #2C2C2E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SparkleIcon sx={{ color: '#10B981' }} />
          <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
            TreeShop Assistant
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#FFFFFF' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Welcome Message */}
        {messages.length === 0 && (
          <Box>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#1C1C1E',
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: '#FFFFFF', mb: 1 }}>
                👋 Hi! I'm your TreeShop Assistant. I can help you:
              </Typography>
              <Typography variant="body2" sx={{ color: '#8E8E93', fontSize: '0.875rem' }}>
                • Navigate the platform
                <br />
                • Calculate pricing
                <br />
                • Create proposals
                <br />
                • Answer questions about TreeShop
              </Typography>
            </Paper>

            {/* Quick Actions */}
            <Typography variant="subtitle2" sx={{ color: '#8E8E93', mb: 1 }}>
              Quick Actions:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickActions.map((qa) => (
                <Button
                  key={qa.label}
                  variant="outlined"
                  onClick={() => handleQuickAction(qa.action, qa.route)}
                  endIcon={qa.route ? <NavigateIcon /> : undefined}
                  sx={{
                    justifyContent: 'space-between',
                    borderColor: '#2C2C2E',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#2C2C2E',
                      borderColor: '#3A3A3C',
                    },
                  }}
                >
                  {qa.label}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            {/* Avatar */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: message.role === 'user' ? '#2C2C2E' : '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {message.role === 'user' ? (
                <PersonIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
              ) : (
                <BotIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
              )}
            </Box>

            {/* Message Content */}
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: message.role === 'user' ? '#2C2C2E' : '#1C1C1E',
                borderRadius: 2,
                maxWidth: '80%',
                flex: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#FFFFFF',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.content}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BotIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
            </Box>
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: '#1C1C1E',
                borderRadius: 2,
              }}
            >
              <CircularProgress size={16} sx={{ color: '#10B981' }} />
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderTop: '1px solid #2C2C2E',
          backgroundColor: '#000000',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Ask me anything..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1C1C1E',
                color: '#FFFFFF',
                '& fieldset': {
                  borderColor: '#2C2C2E',
                },
                '&:hover fieldset': {
                  borderColor: '#3A3A3C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#10B981',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#8E8E93',
                opacity: 1,
              },
            }}
            InputProps={{
              sx: { borderRadius: 3 },
            }}
          />
          <IconButton
            type="submit"
            disabled={isLoading || !input.trim()}
            sx={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#059669',
              },
              '&.Mui-disabled': {
                backgroundColor: '#2C2C2E',
                color: '#8E8E93',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
