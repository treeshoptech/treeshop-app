"use client";

import { ReactNode, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

export interface CRUDItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  metadata?: Record<string, any>;
}

interface CRUDDirectoryProps<T extends CRUDItem> {
  title: string;
  items: T[];
  loading?: boolean;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  renderItem?: (item: T) => ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: string;
  statusColors?: Record<string, string>;
}

export function CRUDDirectory<T extends CRUDItem>({
  title,
  items,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  renderItem,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  statusColors = {
    active: '#34C759',
    inactive: '#8E8E93',
    pending: '#FF9500',
  },
}: CRUDDirectoryProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const getStatusColor = (status?: string) => {
    if (!status) return statusColors.inactive;
    return statusColors[status.toLowerCase()] || statusColors.inactive;
  };

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          {title}
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8E8E93' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1C1C1E',
              borderRadius: '12px',
              '& fieldset': {
                borderColor: '#2C2C2E',
              },
              '&:hover fieldset': {
                borderColor: '#007AFF',
              },
            },
          }}
        />
      </Box>

      {/* Items List */}
      {loading ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Loading...
        </Typography>
      ) : filteredItems.length === 0 ? (
        <Card sx={{ backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">
              {searchQuery ? 'No results found' : emptyMessage}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ p: 0 }}>
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              sx={{
                mb: 2,
                backgroundColor: '#1C1C1E',
                border: '1px solid #2C2C2E',
                '&:hover': {
                  borderColor: '#007AFF',
                  cursor: 'pointer',
                },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flexGrow: 1 }} onClick={() => onEdit(item)}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        {item.subtitle && (
                          <Typography variant="body2" color="text.secondary">
                            {item.subtitle}
                          </Typography>
                        )}
                        {item.status && (
                          <Chip
                            label={item.status}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor: `${getStatusColor(item.status)}20`,
                              color: getStatusColor(item.status),
                              fontWeight: 600,
                              fontSize: '11px',
                            }}
                          />
                        )}
                      </Box>

                      {/* Action Buttons - Right aligned for thumb */}
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          sx={{
                            color: '#007AFF',
                            '&:hover': {
                              backgroundColor: '#007AFF20',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          sx={{
                            color: '#FF3B30',
                            '&:hover': {
                              backgroundColor: '#FF3B3020',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* FAB - Bottom right for right thumb */}
      <Fab
        color="primary"
        onClick={onAdd}
        sx={{
          position: 'fixed',
          bottom: 90, // Above bottom nav
          right: 20,
          zIndex: 999,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#1C1C1E',
            border: '1px solid #2C2C2E',
          },
        }}
      >
        <DialogTitle>Delete {itemToDelete?.title}?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
