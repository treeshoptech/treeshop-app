"use client";

import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Construction as EquipmentIcon,
  People as EmployeeIcon,
  ViewModule as LoadoutIcon,
  Business as OrganizationIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  AccountBalance as BillingIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';

interface RightSideNavProps {
  open: boolean;
  onClose: () => void;
}

const settingsMenuItems = [
  {
    title: 'Equipment Library',
    icon: <EquipmentIcon />,
    path: '/dashboard/settings/equipment',
    description: 'Manage equipment costs',
  },
  {
    title: 'Employee Management',
    icon: <EmployeeIcon />,
    path: '/dashboard/settings/employees',
    description: 'Crew and labor costs',
  },
  {
    title: 'Loadout Configuration',
    icon: <LoadoutIcon />,
    path: '/dashboard/settings/loadouts',
    description: 'Service configurations',
  },
  {
    title: 'Organization Settings',
    icon: <OrganizationIcon />,
    path: '/dashboard/settings/organization',
    description: 'Company information',
  },
  {
    title: 'Account & Billing',
    icon: <BillingIcon />,
    path: '/dashboard/settings/billing',
    description: 'Subscription and payments',
  },
];

export function RightSideNav({ open, onClose }: RightSideNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          backgroundColor: '#000000',
          borderLeft: '1px solid #2C2C2E',
          pt: 2,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon sx={{ color: '#007AFF' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Settings
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#8E8E93',
            '&:hover': { color: '#FFFFFF' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: '#2C2C2E' }} />

      {/* Menu Items */}
      <List sx={{ px: 1, pt: 2 }}>
        {settingsMenuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  minHeight: 64,
                  backgroundColor: isActive ? '#1C1C1E' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#1C1C1E',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#007AFF' : '#8E8E93',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: 15,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#FFFFFF' : '#FFFFFF',
                  }}
                  secondaryTypographyProps={{
                    fontSize: 12,
                    color: '#8E8E93',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #2C2C2E' }}>
        <Typography variant="caption" color="#8E8E93" sx={{ display: 'block', mb: 0.5 }}>
          TreeShop v1.0.0
        </Typography>
        <Typography variant="caption" color="#8E8E93">
          Multi-tenant tree service management
        </Typography>
      </Box>
    </Drawer>
  );
}
