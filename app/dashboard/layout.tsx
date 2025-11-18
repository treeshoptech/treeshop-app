"use client";

import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  IconButton,
  Fab,
} from '@mui/material';
import { Menu as MenuIcon, AutoAwesome as SparkleIcon } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { RightSideNav } from './RightSideNav';
import { AIAssistantSidebar } from '@/app/components/chat/AIAssistantSidebar';
import { useUserRole } from '@/app/hooks/useUserRole';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rightNavOpen, setRightNavOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isEmployee, loading } = useUserRole();

  // Route protection: redirect employees away from admin pages
  useEffect(() => {
    if (loading) return; // Don't redirect while loading

    // If employee (not admin), enforce restricted paths
    if (isEmployee && !isAdmin) {
      const employeeAllowedPaths = [
        '/dashboard/time',
        '/dashboard/time/history',
        '/dashboard/work-orders',
      ];

      const isAllowed = employeeAllowedPaths.some(path => pathname.startsWith(path));

      if (!isAllowed) {
        // Redirect to employee time clock page
        router.push('/dashboard/time');
      }
    }
  }, [isEmployee, isAdmin, pathname, loading, router]);

  return (
    <>
      {/* Top App Bar - Mobile-optimized */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: '1px solid #2C2C2E',
          backgroundColor: '#000000',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Logo - Clickable to Dashboard */}
          <Box
            sx={{
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              }
            }}
            onClick={() => router.push('/dashboard')}
          >
            <Image
              src="/images/logo.png"
              alt="TreeShop"
              width={72}
              height={36}
              style={{ objectFit: 'contain' }}
            />
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Hamburger Menu Button - Larger touch target */}
          <IconButton
            onClick={() => setRightNavOpen(true)}
            sx={{
              color: '#FFFFFF',
              p: 1.5,
              minWidth: 44,
              minHeight: 44,
              '&:hover': {
                backgroundColor: '#1C1C1E',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content - Mobile-optimized spacing */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 3 },
          minHeight: 'calc(100vh - 56px)', // Full height minus header
        }}
      >
        {children}
      </Container>

      {/* Right Side Navigation */}
      <RightSideNav open={rightNavOpen} onClose={() => setRightNavOpen(false)} />

      {/* AI Assistant Sidebar */}
      <AIAssistantSidebar
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        context={{
          currentPage: pathname,
        }}
      />

      {/* Floating AI Assistant Button */}
      <Fab
        color="primary"
        aria-label="AI Assistant"
        onClick={() => setAiAssistantOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 80, sm: 24 },
          right: { xs: 16, sm: 24 },
          backgroundColor: '#10B981',
          '&:hover': {
            backgroundColor: '#059669',
          },
          zIndex: 1000,
        }}
      >
        <SparkleIcon />
      </Fab>
    </>
  );
}
