"use client";

import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  TextField,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';

interface ToDo {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export function ToDoList() {
  const [todos, setTodos] = useState<ToDo[]>([
    { id: '1', text: 'Review proposal for Johnson property', completed: false, priority: 'high' },
    { id: '2', text: 'Schedule equipment maintenance', completed: false, priority: 'medium' },
    { id: '3', text: 'Follow up with lead from yesterday', completed: false, priority: 'high' },
    { id: '4', text: 'Update stump grinding pricing', completed: true, priority: 'low' },
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: ToDo = {
        id: Date.now().toString(),
        text: newTodoText,
        completed: false,
        priority: 'medium',
      };
      setTodos([newTodo, ...todos]);
      setNewTodoText('');
      setShowAddForm(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <Paper sx={{
      p: 3,
      bgcolor: '#1C1C1E',
      border: '1px solid #2C2C2E',
      height: '100%',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            To-Do List
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {incompleteTodos.length} tasks remaining
          </Typography>
        </Box>
        {!showAddForm && (
          <IconButton
            size="small"
            onClick={() => setShowAddForm(true)}
            sx={{
              bgcolor: '#007AFF',
              color: '#FFF',
              '&:hover': { bgcolor: '#0051D5' },
              width: 32,
              height: 32,
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Add New Todo Form */}
      {showAddForm && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#0A0A0A', borderRadius: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="What needs to be done?"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddTodo();
              }
            }}
            autoFocus
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#1C1C1E',
              }
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={handleAddTodo}
              disabled={!newTodoText.trim()}
            >
              Add Task
            </Button>
            <Button
              size="small"
              onClick={() => {
                setShowAddForm(false);
                setNewTodoText('');
              }}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      )}

      {/* Todo List */}
      <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {/* Incomplete Todos */}
        {incompleteTodos.map((todo) => (
          <ListItem
            key={todo.id}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => handleDeleteTodo(todo.id)}
                sx={{ color: '#8E8E93', '&:hover': { color: '#FF3B30' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
            sx={{ mb: 0.5 }}
          >
            <ListItemButton
              onClick={() => handleToggleTodo(todo.id)}
              sx={{
                borderRadius: 1,
                '&:hover': { bgcolor: '#0A0A0A' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  checked={todo.completed}
                  tabIndex={-1}
                  disableRipple
                  icon={<UncheckedIcon />}
                  checkedIcon={<CheckCircleIcon />}
                  sx={{
                    color: getPriorityColor(todo.priority),
                    '&.Mui-checked': {
                      color: '#34C759',
                    },
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={todo.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  sx: {
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#8E8E93' : '#FFF',
                  }
                }}
              />
              {todo.priority && !todo.completed && (
                <Chip
                  label={todo.priority}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 11,
                    bgcolor: `${getPriorityColor(todo.priority)}20`,
                    color: getPriorityColor(todo.priority),
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    ml: 1,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}

        {/* Completed Todos */}
        {completedTodos.length > 0 && (
          <>
            <Box sx={{ mt: 2, mb: 1, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                Completed ({completedTodos.length})
              </Typography>
            </Box>
            {completedTodos.map((todo) => (
              <ListItem
                key={todo.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteTodo(todo.id)}
                    sx={{ color: '#8E8E93', '&:hover': { color: '#FF3B30' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  onClick={() => handleToggleTodo(todo.id)}
                  sx={{
                    borderRadius: 1,
                    '&:hover': { bgcolor: '#0A0A0A' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      edge="start"
                      checked={todo.completed}
                      tabIndex={-1}
                      disableRipple
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      sx={{
                        color: '#34C759',
                        '&.Mui-checked': {
                          color: '#34C759',
                        },
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={todo.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      sx: {
                        textDecoration: 'line-through',
                        color: '#8E8E93',
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>

      {todos.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No tasks yet. Click + to add one.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
