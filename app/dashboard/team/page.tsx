import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OrganizationProfile } from "@clerk/nextjs";
import {
  Typography,
  Box,
} from '@mui/material';

export default async function TeamPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Team Management
      </Typography>

      <Box sx={{
        '& .cl-rootBox': {
          width: '100%',
        },
        '& .cl-card': {
          backgroundColor: '#1C1C1E',
          border: '1px solid #2C2C2E',
        }
      }}>
        <OrganizationProfile
          appearance={{
            elements: {
              rootBox: {
                width: "100%",
              },
              card: {
                backgroundColor: "#1C1C1E",
                border: "1px solid #2C2C2E",
              },
              navbar: {
                backgroundColor: "#1C1C1E",
              },
              navbarButton: {
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#2C2C2E",
                },
              },
              navbarButtonActive: {
                color: "#007AFF",
                borderBottomColor: "#007AFF",
              },
              pageScrollBox: {
                backgroundColor: "#1C1C1E",
              },
              formButtonPrimary: {
                backgroundColor: "#007AFF",
                "&:hover": {
                  backgroundColor: "#0051D5",
                },
              },
            },
          }}
        />
      </Box>
    </>
  );
}
