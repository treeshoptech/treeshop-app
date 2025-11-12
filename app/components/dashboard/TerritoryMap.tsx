"use client";

import { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButtonGroup, ToggleButton, Chip } from '@mui/material';
import { GoogleMap, LoadScript, HeatmapLayer, Polygon, Marker, Circle } from '@react-google-maps/api';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
  ],
};

const libraries = ['visualization'];

export function TerritoryMap() {
  const mapData = useQuery(api.analytics.getMapData);
  const [layers, setLayers] = useState<string[]>(['heatmap', 'jobs', 'areas']);
  const [mapError, setMapError] = useState<boolean>(false);

  if (!mapData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Loading map...</Typography>
        </CardContent>
      </Card>
    );
  }

  const handleLayerToggle = (_event: React.MouseEvent<HTMLElement>, newLayers: string[]) => {
    setLayers(newLayers);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Check if API key is configured
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            Google Maps API Key Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            To enable the Territory Map, please configure your Google Maps API key:
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            1. Add API key to .env.local:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', p: 1, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_key_here
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            2. Enable these APIs in Google Cloud Console:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            <li><Typography variant="body2">Maps JavaScript API</Typography></li>
            <li><Typography variant="body2">Places API (for address search)</Typography></li>
            <li><Typography variant="body2">Geocoding API (for coordinates)</Typography></li>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Visit: <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener" style={{ color: '#667eea' }}>
              Google Cloud Console
            </a>
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Show error state if Google Maps failed to load
  if (mapError) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="warning.main" gutterBottom>
            Google Maps Configuration Issue
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The Google Maps API key may need additional configuration.
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Required APIs (enable in Google Cloud Console):
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1, mb: 2 }}>
            <li><Typography variant="body2">Maps JavaScript API</Typography></li>
            <li><Typography variant="body2">Places API</Typography></li>
            <li><Typography variant="body2">Geocoding API</Typography></li>
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            API Key Restrictions:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1 }}>
            <li><Typography variant="body2">Remove HTTP referrer restrictions (or add localhost:3000)</Typography></li>
            <li><Typography variant="body2">Ensure API key has permissions for all required APIs</Typography></li>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Visit: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" style={{ color: '#667eea' }}>
              API Credentials
            </a> to configure your key
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Territory Intelligence
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Service coverage and opportunity analysis
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={layers}
            onChange={handleLayerToggle}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          >
            <ToggleButton value="heatmap">Heat Map</ToggleButton>
            <ToggleButton value="jobs">Active Jobs</ToggleButton>
            <ToggleButton value="areas">Service Areas</ToggleButton>
            <ToggleButton value="opportunities">Opportunities</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 2 }}>
          <LoadScript
            googleMapsApiKey={apiKey}
            libraries={libraries as any}
            onError={() => setMapError(true)}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapData.center}
              zoom={11}
              options={mapOptions}
            >
              {/* Revenue Heat Map */}
              {layers.includes('heatmap') && typeof google !== 'undefined' && (
                <HeatmapLayer
                  data={mapData.revenueHeatmap.map(point => ({
                    location: new google.maps.LatLng(point.lat, point.lng),
                    weight: point.revenue / 10000,
                  }))}
                  options={{
                    radius: 30,
                    opacity: 0.6,
                    gradient: [
                      'rgba(0, 255, 255, 0)',
                      'rgba(0, 255, 255, 1)',
                      'rgba(0, 191, 255, 1)',
                      'rgba(0, 127, 255, 1)',
                      'rgba(0, 63, 255, 1)',
                      'rgba(0, 0, 255, 1)',
                      'rgba(0, 0, 223, 1)',
                      'rgba(0, 0, 191, 1)',
                      'rgba(0, 0, 159, 1)',
                      'rgba(0, 0, 127, 1)',
                      'rgba(63, 0, 91, 1)',
                      'rgba(127, 0, 63, 1)',
                      'rgba(191, 0, 31, 1)',
                      'rgba(255, 0, 0, 1)',
                    ],
                  }}
                />
              )}

              {/* Service Area Circle (100-mile radius) */}
              {layers.includes('areas') && (
                <Circle
                  center={mapData.center}
                  radius={mapData.serviceAreaRadius}
                  options={{
                    fillColor: '#667eea',
                    fillOpacity: 0.08,
                    strokeColor: '#667eea',
                    strokeOpacity: 0.5,
                    strokeWeight: 2,
                  }}
                />
              )}

              {/* Active Job Markers */}
              {layers.includes('jobs') && mapData.activeJobs.map(job => (
                <Marker
                  key={job.id}
                  position={{ lat: job.lat, lng: job.lng }}
                  title={`${job.customerName} - $${(job.revenue / 1000).toFixed(1)}K`}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="12" fill="#4caf50" stroke="white" stroke-width="2"/>
                        <text x="16" y="20" font-size="16" text-anchor="middle" fill="white">$</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32),
                  }}
                />
              ))}

              {/* Opportunity Zones - only show if data exists */}
              {layers.includes('opportunities') && mapData.opportunityZones.map(zone => (
                <Circle
                  key={zone.id}
                  center={{ lat: zone.lat, lng: zone.lng }}
                  radius={zone.radius}
                  options={{
                    fillColor: '#ff9800',
                    fillOpacity: 0.2,
                    strokeColor: '#ff9800',
                    strokeOpacity: 0.6,
                    strokeWeight: 2,
                  }}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </Box>

        {/* Map Stats */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${mapData.stats.completedJobs} Completed Jobs`}
            sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}
          />
          <Chip
            label={`${mapData.stats.activeJobs} Active Jobs`}
            sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}
          />
          <Chip
            label={`${mapData.stats.opportunityZones} Opportunity Zones`}
            sx={{ bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
