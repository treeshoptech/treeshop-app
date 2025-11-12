"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Box, useMediaQuery, useTheme, Typography } from '@mui/material';
import { GoogleMap, useLoadScript, DrawingManager, Polygon, Marker, Circle, Polyline } from '@react-google-maps/api';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MapToolbar } from '@/app/components/maps/MapToolbar';
import { MapSidebar } from '@/app/components/maps/MapSidebar';
import { MeasurementCard } from '@/app/components/maps/MeasurementCard';
import { SaveDrawingDialog } from '@/app/components/maps/SaveDrawingDialog';
import { MobileDrawingTools } from '@/app/components/maps/MobileDrawingTools';

type DrawingMode = 'polygon' | 'circle' | 'polyline' | 'marker' | null;

interface DrawingData {
  type: string;
  coordinates?: Array<{ lat: number; lng: number }>;
  center?: { lat: number; lng: number };
  radius?: number;
  position?: { lat: number; lng: number };
}

export default function MapsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Memoize libraries to prevent re-creating the array on every render
  const libraries = useMemo(() => ['drawing', 'geometry', 'places'] as const, []);

  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries as any,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>(null);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingData | null>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Convex queries
  const savedDrawings = useQuery(api.maps.getSavedDrawings);
  const activeJobs = useQuery(api.maps.getActiveJobLocations);

  // Convex mutations
  const saveDrawing = useMutation(api.maps.saveDrawing);

  // Layer visibility state
  const [layers, setLayers] = useState({
    serviceArea: true,
    activeJobs: true,
    savedDrawings: true
  });

  // Map center (default to New Smyrna Beach, FL)
  const [mapCenter, setMapCenter] = useState({ lat: 29.0258, lng: -80.9270 });

  // Get GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setGpsLocation(location);
          // Center map on GPS location if it's the first load
          if (!mapRef.current) {
            setMapCenter(location);
          }
        },
        (error) => {
          // Silently handle GPS errors - user can still use map without GPS
          // Common errors: PERMISSION_DENIED (1), POSITION_UNAVAILABLE (2), TIMEOUT (3)
          if (error.code === 1) {
            // Permission denied - user chose not to share location, that's fine
          } else {
            // Other errors - log for debugging but don't show to user
            console.warn('GPS not available:', error.code);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  }, []);

  // Calculate measurements from drawing
  const calculateMeasurements = useCallback((shape: DrawingData) => {
    if (!shape || typeof google === 'undefined') return null;

    if (shape.type === 'polygon' && shape.coordinates) {
      const path = shape.coordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
      const area = google.maps.geometry.spherical.computeArea(path);
      const perimeter = google.maps.geometry.spherical.computeLength(path);

      return {
        area: (area * 0.000247105).toFixed(2), // Convert sq meters to acres
        areaSqFt: Math.round(area * 10.7639),
        perimeter: Math.round(perimeter * 3.28084), // Convert meters to feet
        perimeterMiles: (perimeter * 0.000621371).toFixed(2)
      };
    }

    if (shape.type === 'circle' && shape.radius) {
      const area = Math.PI * Math.pow(shape.radius, 2);
      const circumference = 2 * Math.PI * shape.radius;

      return {
        area: (area * 0.000247105).toFixed(2),
        areaSqFt: Math.round(area * 10.7639),
        radius: Math.round(shape.radius * 3.28084),
        circumference: Math.round(circumference * 3.28084)
      };
    }

    if (shape.type === 'polyline' && shape.coordinates) {
      const path = shape.coordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
      const distance = google.maps.geometry.spherical.computeLength(path);

      return {
        distance: Math.round(distance * 3.28084), // feet
        distanceMiles: (distance * 0.000621371).toFixed(2)
      };
    }

    return null;
  }, []);

  // Handle drawing complete
  const onDrawingComplete = useCallback((overlay: any) => {
    if (typeof google === 'undefined' || !google.maps || !overlay) return;

    let drawingData: DrawingData = { type: '' };

    if (overlay.type === google.maps.drawing.OverlayType.POLYGON) {
      const path = overlay.getPath();
      const coordinates = path.getArray().map((latLng: google.maps.LatLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng()
      }));
      drawingData = { type: 'polygon', coordinates };
    }

    if (overlay.type === google.maps.drawing.OverlayType.CIRCLE) {
      drawingData = {
        type: 'circle',
        center: { lat: overlay.getCenter().lat(), lng: overlay.getCenter().lng() },
        radius: overlay.getRadius()
      };
    }

    if (overlay.type === google.maps.drawing.OverlayType.POLYLINE) {
      const path = overlay.getPath();
      const coordinates = path.getArray().map((latLng: google.maps.LatLng) => ({
        lat: latLng.lat(),
        lng: latLng.lng()
      }));
      drawingData = { type: 'polyline', coordinates };
    }

    if (overlay.type === google.maps.drawing.OverlayType.MARKER) {
      drawingData = {
        type: 'marker',
        position: { lat: overlay.getPosition().lat(), lng: overlay.getPosition().lng() }
      };
    }

    // Remove the overlay from the map after extracting data
    // We'll render it ourselves with our own styling
    try {
      if (overlay.setMap) {
        overlay.setMap(null);
      }
    } catch (e) {
      // If setMap fails, that's okay - we have the data
      console.warn('Could not remove overlay:', e);
    }

    setCurrentDrawing(drawingData);
    setMeasurements(calculateMeasurements(drawingData));
    setDrawingMode(null); // Exit drawing mode
  }, [calculateMeasurements]);

  const handleSaveDrawing = async (data: { name: string; description: string; tags?: string[] }) => {
    if (!currentDrawing) return;

    await saveDrawing({
      ...data,
      drawingData: currentDrawing,
      measurements,
      createdAt: Date.now()
    });

    setSaveDialogOpen(false);
    setCurrentDrawing(null);
    setMeasurements(null);
  };

  const handleClearDrawing = () => {
    setCurrentDrawing(null);
    setMeasurements(null);
  };

  const getDrawingMode = () => {
    if (!drawingMode || typeof google === 'undefined') return null;

    switch (drawingMode) {
      case 'polygon': return google.maps.drawing.OverlayType.POLYGON;
      case 'circle': return google.maps.drawing.OverlayType.CIRCLE;
      case 'polyline': return google.maps.drawing.OverlayType.POLYLINE;
      case 'marker': return google.maps.drawing.OverlayType.MARKER;
      default: return null;
    }
  };

  const drawingOptions = {
    drawingMode: getDrawingMode(),
    drawingControl: false, // We use custom controls
    polygonOptions: {
      fillColor: '#667eea',
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeColor: '#667eea',
      clickable: true,
      editable: true,
      zIndex: 1
    },
    circleOptions: {
      fillColor: '#4caf50',
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeColor: '#4caf50',
      clickable: true,
      editable: true,
      zIndex: 1
    },
    polylineOptions: {
      strokeColor: '#ff9800',
      strokeWeight: 3,
      clickable: true,
      editable: true,
      zIndex: 1
    }
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Loading Map...</Typography>
          <Typography variant="body2" color="text.secondary">
            Initializing Google Maps API
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Map Loading Error
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Failed to load Google Maps. Please check your API key configuration.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Make sure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set in your .env.local file
            and the Maps JavaScript API and Drawing library are enabled in Google Cloud Console.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Toolbar */}
      <MapToolbar
        drawingMode={drawingMode}
        onDrawingModeChange={setDrawingMode}
        onSave={() => setSaveDialogOpen(true)}
        onClear={handleClearDrawing}
        onGPSClick={() => {
          if (gpsLocation && mapRef.current) {
            mapRef.current.panTo(gpsLocation);
            mapRef.current.setZoom(18);
          }
        }}
        hasDrawing={!!currentDrawing}
        gpsLocation={gpsLocation}
        isMobile={isMobile}
      />

      <Box sx={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <MapSidebar
            layers={layers}
            onLayersChange={setLayers}
            drawingMode={drawingMode}
            onDrawingModeChange={setDrawingMode}
            savedDrawings={savedDrawings || []}
            onDrawingSelect={(drawing) => {
              setCurrentDrawing(drawing.drawingData);
              setMeasurements(drawing.measurements);
              // Pan to drawing
              if (mapRef.current && drawing.drawingData.coordinates?.[0]) {
                mapRef.current.panTo(drawing.drawingData.coordinates[0]);
              }
            }}
          />
        )}

        {/* Map Container */}
        <Box sx={{ flex: 1, position: 'relative' }}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={13}
              onLoad={(map) => { mapRef.current = map; }}
              options={{
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
                styles: [
                  { featureType: 'poi', stylers: [{ visibility: 'off' }] }
                ]
              }}
            >
              {/* Drawing Manager */}
              <DrawingManager
                onOverlayComplete={onDrawingComplete}
                options={drawingOptions}
              />

              {/* GPS Location Marker */}
              {gpsLocation && typeof google !== 'undefined' && (
                <Marker
                  position={gpsLocation}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#4285F4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                  }}
                  title="Your Location"
                />
              )}

              {/* 100-mile Service Area Circle */}
              {layers.serviceArea && (
                <Circle
                  center={mapCenter}
                  radius={160934} // 100 miles in meters
                  options={{
                    fillColor: '#667eea',
                    fillOpacity: 0.08,
                    strokeColor: '#667eea',
                    strokeOpacity: 0.5,
                    strokeWeight: 2,
                  }}
                />
              )}

              {/* Current Drawing */}
              {currentDrawing?.type === 'polygon' && currentDrawing.coordinates && (
                <Polygon
                  paths={currentDrawing.coordinates}
                  options={{
                    fillColor: '#667eea',
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: '#667eea',
                    editable: true
                  }}
                />
              )}

              {currentDrawing?.type === 'circle' && currentDrawing.center && currentDrawing.radius && (
                <Circle
                  center={currentDrawing.center}
                  radius={currentDrawing.radius}
                  options={{
                    fillColor: '#4caf50',
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: '#4caf50',
                    editable: true
                  }}
                />
              )}

              {currentDrawing?.type === 'polyline' && currentDrawing.coordinates && (
                <Polyline
                  path={currentDrawing.coordinates}
                  options={{
                    strokeColor: '#ff9800',
                    strokeWeight: 3,
                    editable: true
                  }}
                />
              )}

              {currentDrawing?.type === 'marker' && currentDrawing.position && (
                <Marker
                  position={currentDrawing.position}
                  draggable
                />
              )}

              {/* Layer: Active Jobs */}
              {layers.activeJobs && typeof google !== 'undefined' && activeJobs?.map(job => (
                <Marker
                  key={job._id}
                  position={{ lat: job.latitude, lng: job.longitude }}
                  title={job.customerName}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#4caf50',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                  }}
                />
              ))}

              {/* Layer: Saved Drawings */}
              {layers.savedDrawings && savedDrawings?.map(drawing => {
                if (drawing.drawingData.type === 'polygon' && drawing.drawingData.coordinates) {
                  return (
                    <Polygon
                      key={drawing._id}
                      paths={drawing.drawingData.coordinates}
                      options={{
                        fillColor: '#9c27b0',
                        fillOpacity: 0.2,
                        strokeWeight: 2,
                        strokeColor: '#9c27b0'
                      }}
                    />
                  );
                }
                return null;
              })}
            </GoogleMap>

          {/* Measurement Card Overlay */}
          {measurements && (
            <MeasurementCard
              measurements={measurements}
              drawingType={currentDrawing?.type || ''}
              onClose={() => setMeasurements(null)}
            />
          )}
        </Box>
      </Box>

      {/* Mobile Bottom Drawer */}
      {isMobile && (
        <MobileDrawingTools
          open={mobileDrawerOpen}
          onToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          drawingMode={drawingMode}
          onDrawingModeChange={setDrawingMode}
          layers={layers}
          onLayersChange={setLayers}
        />
      )}

      {/* Save Drawing Dialog */}
      <SaveDrawingDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveDrawing}
        measurements={measurements}
      />
    </Box>
  );
}
