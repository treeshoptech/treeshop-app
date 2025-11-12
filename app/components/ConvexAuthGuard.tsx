"use client";

import { useEffect, useState } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ConvexAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that ensures Clerk auth is fully loaded
 * before rendering children that depend on Convex queries.
 * This prevents authentication race conditions.
 */
export function ConvexAuthGuard({ children }: ConvexAuthGuardProps) {
  const { isLoaded: authLoaded, isSignedIn, orgId } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Wait for both auth and organization to be fully loaded
    if (authLoaded && orgLoaded) {
      // Small delay to ensure JWT token has propagated
      const timer = setTimeout(() => {
        setAuthReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [authLoaded, orgLoaded, isSignedIn, orgId]);

  // Still loading auth state
  if (!authLoaded || !orgLoaded || !authReady) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" gutterBottom>
          Please Sign In
        </Typography>
        <Typography color="text.secondary">
          You need to be signed in to access this page.
        </Typography>
      </Box>
    );
  }

  // No organization selected
  if (!organization) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" gutterBottom>
          No Organization Selected
        </Typography>
        <Typography color="text.secondary">
          Please select or create an organization using the switcher above.
        </Typography>
      </Box>
    );
  }

  // All good - render children
  return <>{children}</>;
}
