import { Card, CardContent, Typography, Box, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import StraightenIcon from '@mui/icons-material/Straighten';

interface MeasurementCardProps {
  measurements: any;
  drawingType: string;
  onClose: () => void;
}

export function MeasurementCard({ measurements, drawingType, onClose }: MeasurementCardProps) {
  return (
    <Card
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        minWidth: 250,
        boxShadow: 3,
        zIndex: 1000
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Measurements</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {drawingType === 'polygon' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SquareFootIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {measurements.area}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  acres
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Square Feet:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {Math.round(measurements.areaSqFt).toLocaleString()} sq ft
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Perimeter:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {measurements.perimeter.toLocaleString()} ft
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Perimeter (miles):</Typography>
              <Typography variant="body2" fontWeight={600}>
                {measurements.perimeterMiles} mi
              </Typography>
            </Box>
          </>
        )}

        {drawingType === 'circle' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SquareFootIcon sx={{ mr: 1, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {measurements.area}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  acres
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Square Feet:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {Math.round(measurements.areaSqFt).toLocaleString()} sq ft
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Radius:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {measurements.radius.toLocaleString()} ft
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Circumference:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {measurements.circumference.toLocaleString()} ft
              </Typography>
            </Box>
          </>
        )}

        {drawingType === 'polyline' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StraightenIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {measurements.distance.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  feet
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Distance (miles):</Typography>
              <Typography variant="body2" fontWeight={600}>
                {measurements.distanceMiles} mi
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
