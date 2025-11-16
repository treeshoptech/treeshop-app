"use client";

import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { RightSideNav } from '../dashboard/RightSideNav';
import { useUserRole } from '@/app/hooks/useUserRole';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rightNavOpen, setRightNavOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isEmployee, loading } = useUserRole();

  // Route protection: redirect employees away from admin pages
  useEffect(() => {
    if (loading) return;

    if (isEmployee && !isAdmin) {
      const employeeAllowedPaths = [
        '/time',
        '/work-orders',
      ];

      const isAllowed = employeeAllowedPaths.some(path => pathname.startsWith(path));

      if (!isAllowed) {
        router.push('/time');
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
          {/* Logo - Clickable */}
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
            onClick={() => router.push('/')}
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

          {/* Hamburger Menu Button */}
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

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 3 },
          minHeight: 'calc(100vh - 56px)',
        }}
      >
        {children}
      </Container>

      {/* Right Side Navigation */}
      <RightSideNav open={rightNavOpen} onClose={() => setRightNavOpen(false)} />
    </>
  );
}
