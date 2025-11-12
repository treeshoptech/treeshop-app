import { SwipeableDrawer, Box, Typography, IconButton, Divider, Switch, FormControlLabel } from '@mui/material';
import SquareIcon from '@mui/icons-material/Square';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import PolylineIcon from '@mui/icons-material/Polyline';
import RoomIcon from '@mui/icons-material/Room';
import CloseIcon from '@mui/icons-material/Close';

type DrawingMode = 'polygon' | 'circle' | 'polyline' | 'marker' | null;

interface MobileDrawingToolsProps {
  open: boolean;
  onToggle: () => void;
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  layers: any;
  onLayersChange: (layers: any) => void;
}

export function MobileDrawingTools({
  open,
  onToggle,
  drawingMode,
  onDrawingModeChange,
  layers,
  onLayersChange
}: MobileDrawingToolsProps) {
  const tools = [
    { mode: 'polygon' as const, icon: <SquareIcon />, label: 'Area' },
    { mode: 'circle' as const, icon: <PanoramaFishEyeIcon />, label: 'Circle' },
    { mode: 'polyline' as const, icon: <PolylineIcon />, label: 'Distance' },
    { mode: 'marker' as const, icon: <RoomIcon />, label: 'Marker' }
  ];

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onToggle}
      onOpen={onToggle}
      disableSwipeToOpen={false}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ p: 2, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Drawing Tools</Typography>
          <IconButton onClick={onToggle} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawing Mode Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mb: 3 }}>
          {tools.map((tool) => (
            <Box
              key={tool.mode}
              onClick={() => {
                onDrawingModeChange(drawingMode === tool.mode ? null : tool.mode);
                onToggle(); // Close drawer after selection
              }}
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: drawingMode === tool.mode ? 'primary.main' : 'divider',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                bgcolor: drawingMode === tool.mode ? 'primary.lighter' : 'transparent',
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              {tool.icon}
              <Typography variant="caption">{tool.label}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Layer Toggles */}
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Map Layers
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={layers.serviceArea}
              onChange={(e) => onLayersChange({ ...layers, serviceArea: e.target.checked })}
            />
          }
          label="100-Mile Service Area"
        />
        <FormControlLabel
          control={
            <Switch
              checked={layers.activeJobs}
              onChange={(e) => onLayersChange({ ...layers, activeJobs: e.target.checked })}
            />
          }
          label="Active Jobs"
        />
        <FormControlLabel
          control={
            <Switch
              checked={layers.savedDrawings}
              onChange={(e) => onLayersChange({ ...layers, savedDrawings: e.target.checked })}
            />
          }
          label="Saved Drawings"
        />
      </Box>
    </SwipeableDrawer>
  );
}
