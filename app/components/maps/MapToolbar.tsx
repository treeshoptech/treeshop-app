import { AppBar, Toolbar, Box, IconButton, Button, Tooltip, Chip } from '@mui/material';
import PolylineIcon from '@mui/icons-material/Polyline';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import RoomIcon from '@mui/icons-material/Room';
import SquareIcon from '@mui/icons-material/Square';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import MyLocationIcon from '@mui/icons-material/MyLocation';

type DrawingMode = 'polygon' | 'circle' | 'polyline' | 'marker' | null;

interface MapToolbarProps {
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  onSave: () => void;
  onClear: () => void;
  onGPSClick: () => void;
  hasDrawing: boolean;
  gpsLocation: { lat: number; lng: number } | null;
  isMobile: boolean;
}

export function MapToolbar({
  drawingMode,
  onDrawingModeChange,
  onSave,
  onClear,
  onGPSClick,
  hasDrawing,
  gpsLocation,
  isMobile
}: MapToolbarProps) {
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          {/* Drawing Tools */}
          <Box sx={{ display: 'flex', gap: 0.5, borderRight: '1px solid', borderColor: 'divider', pr: 2 }}>
            <Tooltip title="Draw Polygon (Area)">
              <IconButton
                color={drawingMode === 'polygon' ? 'primary' : 'default'}
                onClick={() => onDrawingModeChange(drawingMode === 'polygon' ? null : 'polygon')}
                size={isMobile ? 'small' : 'medium'}
              >
                <SquareIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Draw Circle">
              <IconButton
                color={drawingMode === 'circle' ? 'primary' : 'default'}
                onClick={() => onDrawingModeChange(drawingMode === 'circle' ? null : 'circle')}
                size={isMobile ? 'small' : 'medium'}
              >
                <PanoramaFishEyeIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Measure Distance">
              <IconButton
                color={drawingMode === 'polyline' ? 'primary' : 'default'}
                onClick={() => onDrawingModeChange(drawingMode === 'polyline' ? null : 'polyline')}
                size={isMobile ? 'small' : 'medium'}
              >
                <PolylineIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Drop Marker">
              <IconButton
                color={drawingMode === 'marker' ? 'primary' : 'default'}
                onClick={() => onDrawingModeChange(drawingMode === 'marker' ? null : 'marker')}
                size={isMobile ? 'small' : 'medium'}
              >
                <RoomIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* GPS Location */}
          <Tooltip title={gpsLocation ? "Go to My Location" : "GPS Not Available"}>
            <span>
              <IconButton
                onClick={onGPSClick}
                disabled={!gpsLocation}
                color={gpsLocation ? 'success' : 'default'}
                size={isMobile ? 'small' : 'medium'}
              >
                <MyLocationIcon />
              </IconButton>
            </span>
          </Tooltip>

          {/* Active Drawing Indicator */}
          {drawingMode && (
            <Chip
              label={`Drawing: ${drawingMode}`}
              color="primary"
              size="small"
              onDelete={() => onDrawingModeChange(null)}
            />
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={!hasDrawing}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? 'Save' : 'Save Drawing'}
          </Button>

          <IconButton onClick={onClear} disabled={!hasDrawing} size={isMobile ? 'small' : 'medium'}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
