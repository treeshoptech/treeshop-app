import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Stack
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Terrain as TerrainIcon,
  LocalFlorist as LocalFloristIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

export default function Home() {
  return (
    <>
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            TreeShop
          </Typography>
          <SignedOut>
            <Stack direction="row" spacing={2}>
              <SignInButton mode="modal">
                <Button variant="outlined" color="primary">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="contained" color="primary">
                  Sign Up
                </Button>
              </SignUpButton>
            </Stack>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg">
        <Box sx={{ mt: 8, mb: 8 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                mb: 2
              }}
            >
              Professional Tree Service
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              color="text.secondary"
              sx={{
                mb: 4,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Scientific pricing and project management platform built for tree service professionals
            </Typography>

            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Button
                variant="contained"
                size="large"
                href="/dashboard"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                Go to Dashboard
              </Button>
            </SignedIn>
          </Box>

          {/* Features Grid */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CalculateIcon
                    sx={{
                      fontSize: 60,
                      color: 'primary.main',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Scientific Pricing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Calculate accurate quotes using the TreeShop Score system with AFISS complexity factors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <TerrainIcon
                    sx={{
                      fontSize: 60,
                      color: 'primary.main',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Multiple Services
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Forestry mulching, land clearing, stump grinding, tree removal, and more
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <LocalFloristIcon
                    sx={{
                      fontSize: 60,
                      color: 'primary.main',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Project Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track projects from lead to invoice with professional proposals and digital signatures
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <AssessmentIcon
                    sx={{
                      fontSize: 60,
                      color: 'primary.main',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Analytics & Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track equipment costs, employee productivity, and profit margins in real-time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Call to Action */}
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Card sx={{ py: 6, px: 4, backgroundColor: 'background.paper' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Ready to transform your tree service business?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Join professional tree service companies using TreeShop to increase margins and close more deals
              </Typography>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    Start Free Trial
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button
                  variant="contained"
                  size="large"
                  href="/dashboard"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  Go to Dashboard
                </Button>
              </SignedIn>
            </Card>
          </Box>
        </Box>
      </Container>
    </>
  );
}
