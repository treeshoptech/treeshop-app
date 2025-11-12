import { Box, Typography, Divider, FormControlLabel, Switch, List, ListItem, ListItemButton, ListItemText, Chip } from '@mui/material';
import SquareIcon from '@mui/icons-material/Square';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import PolylineIcon from '@mui/icons-material/Polyline';
import RoomIcon from '@mui/icons-material/Room';

type DrawingMode = 'polygon' | 'circle' | 'polyline' | 'marker' | null;

interface SavedDrawing {
  _id: string;
  name: string;
  drawingData: any;
  measurements: any;
  tags?: string[];
  createdAt: number;
}

interface MapSidebarProps {
  layers: {
    serviceArea: boolean;
    activeJobs: boolean;
    savedDrawings: boolean;
  };
  onLayersChange: (layers: any) => void;
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  savedDrawings: SavedDrawing[];
  onDrawingSelect: (drawing: SavedDrawing) => void;
}

export function MapSidebar({
  layers,
  onLayersChange,
  drawingMode,
  onDrawingModeChange,
  savedDrawings,
  onDrawingSelect
}: MapSidebarProps) {
  const tools = [
    { mode: 'polygon' as const, icon: <SquareIcon />, label: 'Polygon (Area)' },
    { mode: 'circle' as const, icon: <PanoramaFishEyeIcon />, label: 'Circle' },
    { mode: 'polyline' as const, icon: <PolylineIcon />, label: 'Distance' },
    { mode: 'marker' as const, icon: <RoomIcon />, label: 'Marker' }
  ];

  return (
    <Box
      sx={{
        width: 280,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Drawing Tools Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Drawing Tools
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tools.map((tool) => (
            <Box
              key={tool.mode}
              onClick={() => onDrawingModeChange(drawingMode === tool.mode ? null : tool.mode)}
              sx={{
                p: 1.5,
                border: '2px solid',
                borderColor: drawingMode === tool.mode ? 'primary.main' : 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                bgcolor: drawingMode === tool.mode ? 'primary.lighter' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'all 0.2s'
              }}
            >
              {tool.icon}
              <Typography variant="body2" fontWeight={drawingMode === tool.mode ? 600 : 400}>
                {tool.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Map Layers Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Map Layers
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <FormControlLabel
            control={
              <Switch
                checked={layers.serviceArea}
                onChange={(e) => onLayersChange({ ...layers, serviceArea: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="body2">100-Mile Service Area</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={layers.activeJobs}
                onChange={(e) => onLayersChange({ ...layers, activeJobs: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="body2">Active Jobs</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={layers.savedDrawings}
                onChange={(e) => onLayersChange({ ...layers, savedDrawings: e.target.checked })}
                size="small"
              />
            }
            label={<Typography variant="body2">Saved Drawings</Typography>}
          />
        </Box>
      </Box>

      <Divider />

      {/* Saved Drawings List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Saved Drawings ({savedDrawings.length})
          </Typography>
        </Box>
        <List dense>
          {savedDrawings.length === 0 ? (
            <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No saved drawings yet
              </Typography>
            </Box>
          ) : (
            savedDrawings.map((drawing) => (
              <ListItem key={drawing._id} disablePadding>
                <ListItemButton onClick={() => onDrawingSelect(drawing)}>
                  <ListItemText
                    primary={drawing.name}
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                        {drawing.measurements?.area && (
                          <Typography variant="caption" color="text.secondary">
                            Area: {drawing.measurements.area} acres
                          </Typography>
                        )}
                        {drawing.measurements?.distance && (
                          <Typography variant="caption" color="text.secondary">
                            Distance: {drawing.measurements.distance} ft
                          </Typography>
                        )}
                        {drawing.tags && drawing.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            {drawing.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" sx={{ height: 18, fontSize: '10px' }} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
}
