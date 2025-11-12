"use client";

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RightSideNav } from './RightSideNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rightNavOpen, setRightNavOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Top App Bar - Compact for mobile */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo - Clickable to Dashboard */}
          <Box
            sx={{
              mr: 2,
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
              width={80}
              height={40}
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
              '&:hover': {
                backgroundColor: '#1C1C1E',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 2,
          mb: 2,
          px: { xs: 2, sm: 3 }
        }}
      >
        {children}
      </Container>

      {/* Right Side Navigation */}
      <RightSideNav open={rightNavOpen} onClose={() => setRightNavOpen(false)} />
    </>
  );
}
