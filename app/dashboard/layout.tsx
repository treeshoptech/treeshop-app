"use client";

import { useState } from 'react';
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  IconButton,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Image from 'next/image';
import { RightSideNav } from './RightSideNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rightNavOpen, setRightNavOpen] = useState(false);

  return (
    <>
      {/* Top App Bar - Compact for mobile */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo */}
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <Image
              src="/images/logo.png"
              alt="TreeShop"
              width={80}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </Box>

          {/* Organization Switcher - Centered */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: {
                    display: "flex",
                    alignItems: "center",
                  },
                  organizationSwitcherTrigger: {
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #2C2C2E",
                    backgroundColor: "#1C1C1E",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    "&:hover": {
                      borderColor: "#007AFF",
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Hamburger Menu Button */}
          <IconButton
            onClick={() => setRightNavOpen(true)}
            sx={{
              mr: 1,
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#1C1C1E',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* User Button - Right aligned */}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: {
                  width: "32px",
                  height: "32px",
                },
              },
            }}
          />
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
