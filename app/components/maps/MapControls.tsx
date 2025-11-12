import { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SquareIcon from '@mui/icons-material/Square';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import PolylineIcon from '@mui/icons-material/Polyline';
import RoomIcon from '@mui/icons-material/Room';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import LayersIcon from '@mui/icons-material/Layers';
import CheckIcon from '@mui/icons-material/Check';

type DrawingMode = 'polygon' | 'circle' | 'polyline' | 'marker' | null;

interface MapControlsProps {
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  onSave: () => void;
  onClear: () => void;
  onGPSClick: () => void;
  hasDrawing: boolean;
  gpsLocation: { lat: number; lng: number } | null;
  layers: {
    serviceArea: boolean;
    activeJobs: boolean;
    savedDrawings: boolean;
  };
  onLayersChange: (layers: any) => void;
}

export function MapControls({
  drawingMode,
  onDrawingModeChange,
  onSave,
  onClear,
  onGPSClick,
  hasDrawing,
  gpsLocation,
  layers,
  onLayersChange
}: MapControlsProps) {
  const [toolsMenuAnchor, setToolsMenuAnchor] = useState<null | HTMLElement>(null);
  const [layersMenuAnchor, setLayersMenuAnchor] = useState<null | HTMLElement>(null);

  const toolsOpen = Boolean(toolsMenuAnchor);
  const layersOpen = Boolean(layersMenuAnchor);

  const handleToolSelect = (mode: DrawingMode) => {
    onDrawingModeChange(mode);
    setToolsMenuAnchor(null);
  };

  const handleLayerToggle = (layer: keyof typeof layers) => {
    onLayersChange({ ...layers, [layer]: !layers[layer] });
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {/* Drawing Tools Menu Button */}
      <Paper
        elevation={3}
        sx={{
          bgcolor: drawingMode ? '#007AFF' : '#1C1C1E',
          border: '1px solid #2C2C2E'
        }}
      >
        <Tooltip title="Drawing Tools" placement="right">
          <IconButton
            onClick={(e) => setToolsMenuAnchor(e.currentTarget)}
            sx={{
              color: drawingMode ? '#FFFFFF' : '#8E8E93',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Layers Menu Button */}
      <Paper elevation={3} sx={{ bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
        <Tooltip title="Map Layers" placement="right">
          <IconButton
            onClick={(e) => setLayersMenuAnchor(e.currentTarget)}
            sx={{
              color: '#8E8E93',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <LayersIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* GPS Location Button */}
      <Paper elevation={3} sx={{ bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
        <Tooltip title={gpsLocation ? "Go to My Location" : "GPS Not Available"} placement="right">
          <span>
            <IconButton
              onClick={onGPSClick}
              disabled={!gpsLocation}
              sx={{
                color: gpsLocation ? '#34C759' : '#3C3C3E',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              <MyLocationIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>

      {/* Drawing Actions (when active) */}
      {hasDrawing && (
        <>
          <Paper elevation={3} sx={{ bgcolor: '#34C759', border: '1px solid #2C2C2E' }}>
            <Tooltip title="Save Drawing" placement="right">
              <IconButton
                onClick={onSave}
                sx={{
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Paper>

          <Paper elevation={3} sx={{ bgcolor: '#FF3B30', border: '1px solid #2C2C2E' }}>
            <Tooltip title="Clear Drawing" placement="right">
              <IconButton
                onClick={onClear}
                sx={{
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        </>
      )}

      {/* Active Drawing Mode Indicator */}
      {drawingMode && (
        <Paper
          elevation={3}
          sx={{
            bgcolor: '#007AFF',
            border: '1px solid #2C2C2E',
            px: 1.5,
            py: 0.5
          }}
        >
          <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.7rem' }}>
            {drawingMode === 'polygon' && 'AREA'}
            {drawingMode === 'circle' && 'CIRCLE'}
            {drawingMode === 'polyline' && 'DISTANCE'}
            {drawingMode === 'marker' && 'MARKER'}
          </Typography>
        </Paper>
      )}

      {/* Drawing Tools Menu */}
      <Menu
        anchorEl={toolsMenuAnchor}
        open={toolsOpen}
        onClose={() => setToolsMenuAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            bgcolor: '#1C1C1E',
            border: '1px solid #2C2C2E',
            minWidth: 220
          }
        }}
      >
        <MenuItem
          onClick={() => handleToolSelect('polygon')}
          selected={drawingMode === 'polygon'}
          sx={{
            bgcolor: drawingMode === 'polygon' ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          <ListItemIcon>
            <SquareIcon sx={{ color: drawingMode === 'polygon' ? '#007AFF' : '#8E8E93' }} />
          </ListItemIcon>
          <ListItemText
            primary="Measure Area"
            secondary="Draw polygon to measure acres"
            primaryTypographyProps={{ sx: { color: drawingMode === 'polygon' ? '#007AFF' : '#FFFFFF', fontWeight: 600 } }}
            secondaryTypographyProps={{ sx: { color: '#8E8E93', fontSize: '0.75rem' } }}
          />
          {drawingMode === 'polygon' && (
            <CheckIcon sx={{ color: '#007AFF', fontSize: 20, ml: 1 }} />
          )}
        </MenuItem>

        <MenuItem
          onClick={() => handleToolSelect('circle')}
          selected={drawingMode === 'circle'}
          sx={{
            bgcolor: drawingMode === 'circle' ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          <ListItemIcon>
            <PanoramaFishEyeIcon sx={{ color: drawingMode === 'circle' ? '#007AFF' : '#8E8E93' }} />
          </ListItemIcon>
          <ListItemText
            primary="Circular Area"
            secondary="Draw circle to measure radius"
            primaryTypographyProps={{ sx: { color: drawingMode === 'circle' ? '#007AFF' : '#FFFFFF', fontWeight: 600 } }}
            secondaryTypographyProps={{ sx: { color: '#8E8E93', fontSize: '0.75rem' } }}
          />
          {drawingMode === 'circle' && (
            <CheckIcon sx={{ color: '#007AFF', fontSize: 20, ml: 1 }} />
          )}
        </MenuItem>

        <MenuItem
          onClick={() => handleToolSelect('polyline')}
          selected={drawingMode === 'polyline'}
          sx={{
            bgcolor: drawingMode === 'polyline' ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          <ListItemIcon>
            <PolylineIcon sx={{ color: drawingMode === 'polyline' ? '#007AFF' : '#8E8E93' }} />
          </ListItemIcon>
          <ListItemText
            primary="Measure Distance"
            secondary="Draw line to measure feet/miles"
            primaryTypographyProps={{ sx: { color: drawingMode === 'polyline' ? '#007AFF' : '#FFFFFF', fontWeight: 600 } }}
            secondaryTypographyProps={{ sx: { color: '#8E8E93', fontSize: '0.75rem' } }}
          />
          {drawingMode === 'polyline' && (
            <CheckIcon sx={{ color: '#007AFF', fontSize: 20, ml: 1 }} />
          )}
        </MenuItem>

        <MenuItem
          onClick={() => handleToolSelect('marker')}
          selected={drawingMode === 'marker'}
          sx={{
            bgcolor: drawingMode === 'marker' ? 'rgba(0, 122, 255, 0.15)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          <ListItemIcon>
            <RoomIcon sx={{ color: drawingMode === 'marker' ? '#007AFF' : '#8E8E93' }} />
          </ListItemIcon>
          <ListItemText
            primary="Drop Pin"
            secondary="Mark a location on the map"
            primaryTypographyProps={{ sx: { color: drawingMode === 'marker' ? '#007AFF' : '#FFFFFF', fontWeight: 600 } }}
            secondaryTypographyProps={{ sx: { color: '#8E8E93', fontSize: '0.75rem' } }}
          />
          {drawingMode === 'marker' && (
            <CheckIcon sx={{ color: '#007AFF', fontSize: 20, ml: 1 }} />
          )}
        </MenuItem>

        {drawingMode && (
          <>
            <Divider sx={{ borderColor: '#2C2C2E', my: 1 }} />
            <MenuItem
              onClick={() => handleToolSelect(null)}
              sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
            >
              <ListItemText
                primary="Exit Drawing Mode"
                primaryTypographyProps={{ sx: { color: '#FF9500', fontWeight: 600 } }}
              />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Layers Menu */}
      <Menu
        anchorEl={layersMenuAnchor}
        open={layersOpen}
        onClose={() => setLayersMenuAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            bgcolor: '#1C1C1E',
            border: '1px solid #2C2C2E',
            minWidth: 220
          }
        }}
      >
        <MenuItem
          onClick={() => handleLayerToggle('serviceArea')}
          sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
        >
          <ListItemIcon>
            {layers.serviceArea && <CheckIcon sx={{ color: '#34C759' }} />}
          </ListItemIcon>
          <ListItemText
            primary="Service Area"
            secondary="100-mile radius"
            primaryTypographyProps={{ sx: { color: '#FFFFFF', fontWeight: 600 } }}
            secondaryTypographyProps={{ sx: { color: '#8E8E93', fontSize: '0.75rem' } }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleLayerToggle('activeJobs')}
          sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
        >
          <ListItemIcon>
            {layers.activeJobs && <CheckIcon sx={{ color: '#34C759' }} />}
          </ListItemIcon>
          <ListItemText
            primary="Active Jobs"
            secondary="Current work orders"
            primaryTypographyProps={{ sx: { color: '#FFFFFF', fontWeight: 600 } }}
            secondaryTypographyProps={{ sx: { color: '#8E8E93', fontSize: '0.75rem' } }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleLayerToggle('savedDrawings')}
          sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
        >
          <ListItemIcon>
            {layers.savedDrawings && <CheckIcon sx={{ color: '#34C759' }} />}
          </ListItemIcon>
          <ListItemText
            primary="Saved Drawings"
            secondary="Company-wide measurements"
            primaryTypographyProps={{ sx: { color: '#FFFFFF', fontWeight: 600 } }}
            secondaryTypographyProps={{ sx: { color: '#8E8E93', fontSize: '0.75rem' } }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}
