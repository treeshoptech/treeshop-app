"use client";

import { useEffect, useState } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
  const syncOrganization = useMutation(api.organizations.sync);
  const [authReady, setAuthReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Wait for both auth and organization to be fully loaded
    if (authLoaded && orgLoaded && isSignedIn && organization && orgId && !authReady && !syncing) {
      // Sync organization to Convex
      const syncAndReady = async () => {
        setSyncing(true);
        try {
          await syncOrganization({
            clerkOrgId: organization.id,
            name: organization.name,
            slug: organization.slug || undefined,
          });
        } catch (error) {
          console.error('Failed to sync organization:', error);
        }
        setSyncing(false);
        setAuthReady(true);
      };

      syncAndReady();
    }
  }, [authLoaded, orgLoaded, isSignedIn, orgId, organization?.id, syncOrganization, authReady, syncing]);

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
  if (!organization || !orgId) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" gutterBottom>
          No Organization Selected
        </Typography>
        <Typography color="text.secondary">
          Please select or create an organization using the switcher above.
        </Typography>
        {organization && !orgId && (
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 2 }}>
            Organization found but orgId missing. Please sign out and sign back in.
          </Typography>
        )}
      </Box>
    );
  }

  // All good - render children
  return <>{children}</>;
}
