import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
} from '@mui/material';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* App Bar with Organization Switcher */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, mr: 4 }}>
            TreeShop
          </Typography>

          {/* Organization Switcher - Switch between companies */}
          <Box sx={{ flexGrow: 1 }}>
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: {
                    display: "flex",
                    alignItems: "center",
                  },
                  organizationSwitcherTrigger: {
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #2C2C2E",
                    backgroundColor: "#1C1C1E",
                    color: "#FFFFFF",
                    "&:hover": {
                      borderColor: "#007AFF",
                    },
                  },
                },
              }}
            />
          </Box>

          {/* User Button */}
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {children}
      </Container>
    </>
  );
}
