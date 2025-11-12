"use client";

import { usePathname, useRouter } from 'next/navigation';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Construction as ConstructionIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Leads', icon: <DescriptionIcon />, path: '/dashboard/leads' },
    { label: 'Customers', icon: <PeopleIcon />, path: '/dashboard/customers' },
    { label: 'Equipment', icon: <ConstructionIcon />, path: '/dashboard/equipment' },
  ];

  // Find current value based on pathname
  const currentValue = navItems.findIndex(item => pathname === item.path);

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue >= 0 ? currentValue : 0}
        onChange={(event, newValue) => {
          router.push(navItems[newValue].path);
        }}
        showLabels
        sx={{
          backgroundColor: '#1C1C1E',
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            color: '#8E8E93',
            minWidth: 'auto',
            padding: '6px 12px',
            '&.Mui-selected': {
              color: '#007AFF',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '11px',
            '&.Mui-selected': {
              fontSize: '12px',
              fontWeight: 600,
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
