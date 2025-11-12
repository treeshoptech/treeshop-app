import { OverlayView } from '@react-google-maps/api';
import { Box, Typography, Paper } from '@mui/material';

interface MeasurementLabelsProps {
  drawings: Array<{
    _id: string;
    drawingData: {
      type: string;
      coordinates?: Array<{ lat: number; lng: number }>;
      center?: { lat: number; lng: number };
      radius?: number;
    };
    measurements?: {
      area?: string;
      areaSqFt?: number;
      perimeter?: number;
      perimeterMiles?: string;
      distance?: number;
      distanceMiles?: string;
      radius?: number;
      circumference?: number;
    };
  }>;
  currentDrawing?: {
    type: string;
    coordinates?: Array<{ lat: number; lng: number }>;
    center?: { lat: number; lng: number };
    radius?: number;
  } | null;
  currentMeasurements?: any;
}

export function MeasurementLabels({
  drawings,
  currentDrawing,
  currentMeasurements
}: MeasurementLabelsProps) {

  // Calculate center point of a polygon
  const getPolygonCenter = (coordinates: Array<{ lat: number; lng: number }>) => {
    const latSum = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    return {
      lat: latSum / coordinates.length,
      lng: lngSum / coordinates.length
    };
  };

  // Calculate midpoint of a polyline
  const getPolylineCenter = (coordinates: Array<{ lat: number; lng: number }>) => {
    const midIndex = Math.floor(coordinates.length / 2);
    return coordinates[midIndex];
  };

  // Format distance measurement
  const formatDistance = (distanceFt?: number, distanceMiles?: string) => {
    if (!distanceFt) return '';

    if (distanceFt < 5280) {
      // Less than 1 mile - show feet
      return `${distanceFt.toLocaleString()} ft`;
    } else {
      // 1 mile or more - show miles
      return `${distanceMiles} mi`;
    }
  };

  return (
    <>
      {/* Current Drawing Label */}
      {currentDrawing && currentMeasurements && (
        <>
          {/* Polygon Area Label */}
          {currentDrawing.type === 'polygon' && currentDrawing.coordinates && (
            <OverlayView
              position={getPolygonCenter(currentDrawing.coordinates)}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <Paper
                elevation={4}
                sx={{
                  bgcolor: 'rgba(0, 122, 255, 0.95)',
                  border: '2px solid #FFFFFF',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transform: 'translate(-50%, -50%)',
                  minWidth: 100,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.2 }}>
                  {currentMeasurements.area} acres
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                  {currentMeasurements.perimeter?.toLocaleString()} ft perimeter
                </Typography>
                {currentMeasurements.perimeterMiles && parseFloat(currentMeasurements.perimeterMiles) >= 0.1 && (
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.65rem', display: 'block' }}>
                    ({currentMeasurements.perimeterMiles} mi)
                  </Typography>
                )}
              </Paper>
            </OverlayView>
          )}

          {/* Circle Area Label */}
          {currentDrawing.type === 'circle' && currentDrawing.center && (
            <OverlayView
              position={currentDrawing.center}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <Paper
                elevation={4}
                sx={{
                  bgcolor: 'rgba(76, 175, 80, 0.95)',
                  border: '2px solid #FFFFFF',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transform: 'translate(-50%, -50%)',
                  minWidth: 100,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.2 }}>
                  {currentMeasurements.area} acres
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                  {currentMeasurements.radius?.toLocaleString()} ft radius
                </Typography>
              </Paper>
            </OverlayView>
          )}

          {/* Polyline Distance Label */}
          {currentDrawing.type === 'polyline' && currentDrawing.coordinates && currentDrawing.coordinates.length >= 2 && (
            <OverlayView
              position={getPolylineCenter(currentDrawing.coordinates)}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <Paper
                elevation={4}
                sx={{
                  bgcolor: 'rgba(255, 152, 0, 0.95)',
                  border: '2px solid #FFFFFF',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transform: 'translate(-50%, -50%)',
                  minWidth: 80,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                  {formatDistance(currentMeasurements.distance, currentMeasurements.distanceMiles)}
                </Typography>
              </Paper>
            </OverlayView>
          )}
        </>
      )}

      {/* Saved Drawings Labels */}
      {drawings.map((drawing) => {
        if (!drawing.measurements) return null;

        // Polygon labels
        if (drawing.drawingData.type === 'polygon' && drawing.drawingData.coordinates) {
          return (
            <OverlayView
              key={drawing._id}
              position={getPolygonCenter(drawing.drawingData.coordinates)}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <Paper
                elevation={2}
                sx={{
                  bgcolor: 'rgba(156, 39, 176, 0.9)',
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.75,
                  transform: 'translate(-50%, -50%)',
                  minWidth: 80,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  {drawing.measurements.area} ac
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.65rem', display: 'block' }}>
                  {drawing.measurements.perimeter ? `${(drawing.measurements.perimeter / 1000).toFixed(1)}k ft` : ''}
                </Typography>
              </Paper>
            </OverlayView>
          );
        }

        // Circle labels
        if (drawing.drawingData.type === 'circle' && drawing.drawingData.center) {
          return (
            <OverlayView
              key={drawing._id}
              position={drawing.drawingData.center}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <Paper
                elevation={2}
                sx={{
                  bgcolor: 'rgba(156, 39, 176, 0.9)',
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.75,
                  transform: 'translate(-50%, -50%)',
                  minWidth: 80,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  {drawing.measurements.area} ac
                </Typography>
              </Paper>
            </OverlayView>
          );
        }

        // Polyline labels
        if (drawing.drawingData.type === 'polyline' && drawing.drawingData.coordinates && drawing.drawingData.coordinates.length >= 2) {
          return (
            <OverlayView
              key={drawing._id}
              position={getPolylineCenter(drawing.drawingData.coordinates)}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <Paper
                elevation={2}
                sx={{
                  bgcolor: 'rgba(156, 39, 176, 0.9)',
                  border: '1.5px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.75,
                  transform: 'translate(-50%, -50%)',
                  minWidth: 60,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                  {formatDistance(drawing.measurements.distance, drawing.measurements.distanceMiles)}
                </Typography>
              </Paper>
            </OverlayView>
          );
        }

        return null;
      })}
    </>
  );
}
