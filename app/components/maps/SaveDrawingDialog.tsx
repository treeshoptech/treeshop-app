import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Autocomplete
} from '@mui/material';

interface SaveDrawingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; tags?: string[] }) => void;
  measurements: any;
}

export function SaveDrawingDialog({ open, onClose, onSave, measurements }: SaveDrawingDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleSave = () => {
    onSave({
      name,
      description,
      tags
    });

    // Reset form
    setName('');
    setDescription('');
    setTags([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Drawing</DialogTitle>

      <DialogContent>
        {/* Measurements Summary */}
        {measurements && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Measurements
            </Typography>
            {measurements.area && (
              <Typography variant="body2">
                <strong>Area:</strong> {measurements.area} acres ({Math.round(measurements.areaSqFt).toLocaleString()} sq ft)
              </Typography>
            )}
            {measurements.distance && (
              <Typography variant="body2">
                <strong>Distance:</strong> {measurements.distance.toLocaleString()} ft ({measurements.distanceMiles} mi)
              </Typography>
            )}
            {measurements.radius && (
              <Typography variant="body2">
                <strong>Radius:</strong> {measurements.radius.toLocaleString()} ft
              </Typography>
            )}
          </Box>
        )}

        <TextField
          label="Drawing Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Mulching Area - North Section"
          sx={{ mb: 2 }}
          autoFocus
        />

        <TextField
          label="Description (Optional)"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes about this area..."
          sx={{ mb: 2 }}
        />

        <Autocomplete
          multiple
          freeSolo
          options={['Mulching', 'Land Clearing', 'Tree Removal', 'Service Area', 'Measurement', 'Property Line']}
          value={tags}
          onChange={(_, newValue) => setTags(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tags (Optional)"
              placeholder="Add tags..."
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option} {...getTagProps({ index })} size="small" key={option} />
            ))
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name}>
          Save Drawing
        </Button>
      </DialogActions>
    </Dialog>
  );
}
