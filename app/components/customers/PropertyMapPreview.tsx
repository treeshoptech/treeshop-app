"use client";

import { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, ToggleButtonGroup, ToggleButton, Skeleton } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';
import TerrainIcon from '@mui/icons-material/Terrain';

interface PropertyMapPreviewProps {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
}

export function PropertyMapPreview({ address, city, state, zip }: PropertyMapPreviewProps) {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('satellite');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Construct full address
  const fullAddress = useMemo(() => {
    const parts = [address, city, state, zip].filter(Boolean);
    return parts.join(', ');
  }, [address, city, state, zip]);

  // Generate Google Static Maps URL
  const mapUrl = useMemo(() => {
    if (!address) return null;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const encodedAddress = encodeURIComponent(fullAddress);
    const zoom = 18; // Close-up view for property
    const size = '600x400';

    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=${zoom}&size=${size}&maptype=${mapType}&markers=color:red%7C${encodedAddress}&key=${apiKey}`;
  }, [fullAddress, mapType]);

  // Generate Street View URL
  const streetViewUrl = useMemo(() => {
    if (!address) return null;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const encodedAddress = encodeURIComponent(fullAddress);
    const size = '600x300';

    return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${encodedAddress}&key=${apiKey}`;
  }, [fullAddress]);

  if (!address) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No address provided
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!mapUrl) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            Maps API not configured
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Property Map View
            </Typography>
            <ToggleButtonGroup
              value={mapType}
              exclusive
              onChange={(_, newType) => {
                if (newType) {
                  setMapType(newType);
                  setImageLoaded(false);
                }
              }}
              size="small"
            >
              <ToggleButton value="roadmap" aria-label="roadmap">
                <MapIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="satellite" aria-label="satellite">
                <SatelliteIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="hybrid" aria-label="hybrid">
                <TerrainIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '66.67%', // 3:2 aspect ratio
              bgcolor: 'background.default',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {!imageLoaded && (
              <Skeleton
                variant="rectangular"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            )}
            <img
              src={mapUrl}
              alt={`Map of ${fullAddress}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: imageLoaded ? 'block' : 'none',
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {fullAddress}
          </Typography>
        </CardContent>
      </Card>

      {/* Street View */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Street View
          </Typography>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '50%', // 2:1 aspect ratio
              bgcolor: 'background.default',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
            <img
              src={streetViewUrl || ''}
              alt={`Street view of ${fullAddress}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                // Hide image if street view not available
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {streetViewUrl ? 'Street level view (if available)' : 'Street view unavailable for this location'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
