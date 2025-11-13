"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useOrganization } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface LinkAccountModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: Id<"employees">;
  employeeName: string;
  onSuccess?: () => void;
}

export function LinkAccountModal({
  open,
  onClose,
  employeeId,
  employeeName,
  onSuccess,
}: LinkAccountModalProps) {
  const { organization, membership } = useOrganization();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const linkEmployee = useMutation(api.employees.linkToClerkUser);

  // Get organization members from Clerk
  const orgMembers = organization?.membersCount ? [] : []; // TODO: Fetch from Clerk API

  // For now, we'll use a simplified version that just takes the Clerk user ID
  const [clerkUserId, setClerkUserId] = useState('');

  const handleLink = async (userId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await linkEmployee({
        employeeId,
        clerkUserId: userId,
      });
      setSuccess(`Successfully linked ${employeeName} to user account`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to link account');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clerkUserId.trim()) {
      handleLink(clerkUserId.trim());
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#1C1C1E',
          border: '1px solid #2C2C2E',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Link Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect {employeeName} to a user account
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Info Box */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#007AFF20', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: '#007AFF' }}>
            Link this employee record to a Clerk user account to enable mobile app access and time tracking.
          </Typography>
        </Box>

        {/* Simple Form for Clerk User ID */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Clerk User ID"
            placeholder="user_xxxxxxxxxxxxxxxxxxxxx"
            value={clerkUserId}
            onChange={(e) => setClerkUserId(e.target.value)}
            helperText="Enter the Clerk user ID from the Clerk Dashboard"
            sx={{ mb: 2 }}
          />

          {/* Instructions */}
          <Box sx={{ p: 2, bgcolor: '#0A0A0A', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              <strong>How to find the Clerk User ID:</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" component="ol" sx={{ pl: 2 }}>
              <li>Open Clerk Dashboard</li>
              <li>Navigate to Users section</li>
              <li>Find the user you want to link</li>
              <li>Copy their User ID (starts with "user_")</li>
              <li>Paste it in the field above</li>
            </Typography>
          </Box>
        </form>

        {/* Future: Organization Member List */}
        {/* This would show a searchable list of org members with "Link" buttons */}
        {/*
        <TextField
          fullWidth
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        <List>
          {filteredMembers.map((member) => (
            <ListItem key={member.id}>
              <ListItemText
                primary={member.name}
                secondary={member.email}
              />
              <ListItemSecondaryAction>
                <Chip label={member.role} size="small" sx={{ mr: 1 }} />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleLink(member.userId)}
                  disabled={loading}
                >
                  Link
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        */}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !clerkUserId.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Link Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
