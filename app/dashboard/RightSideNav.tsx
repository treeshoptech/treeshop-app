"use client";

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
  ListSubheader,
} from '@mui/material';
import {
  Construction as EquipmentIcon,
  People as EmployeeIcon,
  ViewModule as LoadoutIcon,
  Business as OrganizationIcon,
  Close as CloseIcon,
  Description as LeadIcon,
  Assignment as ProposalIcon,
  Engineering as WorkOrderIcon,
  Receipt as InvoiceIcon,
  Groups as CustomerIcon,
  Assessment as ReportsIcon,
  Map as MapIcon,
  Nature as TreeInventoryIcon,
  Dashboard as DashboardIcon,
  AccessTime as TimeClockIcon,
  History as TimeHistoryIcon,
  CheckCircle as ApproveIcon,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { UserButton, OrganizationSwitcher } from '@clerk/nextjs';
import { useUserRole } from '@/app/hooks/useUserRole';

interface RightSideNavProps {
  open: boolean;
  onClose: () => void;
}

const menuSections = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
    ],
  },
  {
    title: 'Workflow',
    items: [
      {
        title: 'Leads',
        icon: <LeadIcon />,
        path: '/dashboard/leads',
      },
      {
        title: 'Proposals',
        icon: <ProposalIcon />,
        path: '/proposals',
      },
      {
        title: 'Work Orders',
        icon: <WorkOrderIcon />,
        path: '/dashboard/work-orders',
      },
      {
        title: 'Invoices',
        icon: <InvoiceIcon />,
        path: '/dashboard/invoices',
      },
    ],
  },
  {
    title: 'Resources',
    items: [
      {
        title: 'Equipment',
        icon: <EquipmentIcon />,
        path: '/dashboard/equipment',
      },
      {
        title: 'Employees',
        icon: <EmployeeIcon />,
        path: '/dashboard/employees',
      },
      {
        title: 'Loadouts',
        icon: <LoadoutIcon />,
        path: '/dashboard/loadouts',
      },
      {
        title: 'Customers',
        icon: <CustomerIcon />,
        path: '/dashboard/customers',
      },
    ],
  },
  {
    title: 'Time Management',
    items: [
      {
        title: 'Approve Time',
        icon: <ApproveIcon />,
        path: '/dashboard/time/approve',
      },
      {
        title: 'Time Reports',
        icon: <TimeHistoryIcon />,
        path: '/dashboard/time/reports',
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        title: 'Maps',
        icon: <MapIcon />,
        path: '/dashboard/maps',
      },
      {
        title: 'Tree Inventory',
        icon: <TreeInventoryIcon />,
        path: '/dashboard/tree-inventory',
      },
      {
        title: 'Reports',
        icon: <ReportsIcon />,
        path: '/dashboard/reports',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Organization',
        icon: <OrganizationIcon />,
        path: '/dashboard/settings/organization',
      },
      {
        title: 'Line Items Library',
        icon: <LeadIcon />,
        path: '/dashboard/settings/line-items',
      },
    ],
  },
];

export function RightSideNav({ open, onClose }: RightSideNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isEmployee, loading } = useUserRole();

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  // Employee-only menu sections
  const employeeMenuSections = [
    {
      title: 'My Time',
      items: [
        {
          title: 'Clock In/Out',
          icon: <TimeClockIcon />,
          path: '/dashboard/time',
        },
        {
          title: 'Time History',
          icon: <TimeHistoryIcon />,
          path: '/dashboard/time/history',
        },
      ],
    },
    {
      title: 'My Work',
      items: [
        {
          title: 'My Work Orders',
          icon: <WorkOrderIcon />,
          path: '/dashboard/work-orders',
        },
      ],
    },
  ];

  // Determine which menu to show
  const displaySections = isAdmin ? menuSections : isEmployee ? employeeMenuSections : [];

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
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header with Close Button */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menu
          </Typography>
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
      </Box>

      <Divider sx={{ borderColor: '#2C2C2E' }} />

      {/* Scrollable Menu Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {displaySections.map((section) => (
          <List
            key={section.title}
            subheader={
              <ListSubheader
                sx={{
                  backgroundColor: 'transparent',
                  color: '#8E8E93',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: '32px',
                  px: 2,
                }}
              >
                {section.title}
              </ListSubheader>
            }
            sx={{ px: 1, py: 0 }}
          >
            {section.items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 44,
                      backgroundColor: isActive ? '#1C1C1E' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#1C1C1E',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? '#007AFF' : '#8E8E93',
                        minWidth: 36,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: 15,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#FFFFFF' : '#FFFFFF',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#2C2C2E' }} />

      {/* Footer with Organization Switcher and User Profile */}
      <Box sx={{ p: 2 }}>
        {/* Organization Switcher */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="#8E8E93" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Organization
          </Typography>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: {
                  display: "flex",
                  width: "100%",
                },
                organizationSwitcherTrigger: {
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #2C2C2E",
                  backgroundColor: "#1C1C1E",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  justifyContent: "flex-start",
                  "&:hover": {
                    borderColor: "#007AFF",
                  },
                },
              },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: '#2C2C2E', mb: 2 }} />

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: "40px",
                  height: "40px",
                },
              },
            }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
              Your Account
            </Typography>
            <Typography variant="caption" color="#8E8E93">
              Profile & Settings
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="#8E8E93" sx={{ display: 'block' }}>
          TreeShop v1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
}
