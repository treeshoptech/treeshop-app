import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Stack,
  Link,
  Card,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

export default async function Home() {
  // Redirect logged-in users directly to dashboard
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // Landing page for logged-out users
  return (
    <>
      {/* Navigation - Standard login position top-right */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Image
              src="/treeshop-logo.png"
              alt="TreeShop"
              width={240}
              height={80}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          <Stack direction="row" spacing={2}>
            <SignInButton mode="modal">
              <Button
                variant="text"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                Sign In
              </Button>
            </SignInButton>
            <Link
              href="https://treeshop.app/tech"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Button variant="contained" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Apply for Access
              </Button>
            </Link>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section - Outcome-focused headline */}
      <Box sx={{
        bgcolor: 'background.default',
        pt: 18,
        pb: 14,
        background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.05) 0%, rgba(255, 255, 255, 0) 50%, rgba(0, 122, 255, 0.05) 100%)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                fontWeight: 800,
                mb: 3,
                lineHeight: 1.1,
              }}
            >
              Stop Estimating. Start Knowing.
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              color="text.secondary"
              sx={{
                mb: 4,
                fontSize: { xs: '1.35rem', md: '1.75rem' },
                fontWeight: 400,
                maxWidth: '900px',
                mx: 'auto',
                lineHeight: 1.5,
              }}
            >
              Transform project uncertainty into mathematical precision.
              <br />
              Protect profits. Eliminate surprises.
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 6,
                maxWidth: '750px',
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.7,
              }}
            >
              Your experience + Our algorithms = Unbeatable accuracy.
              Know if a project is profitable before you finish it, not after you've lost money.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Link
                href="https://treeshop.app/tech"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none' }}
              >
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 8,
                    py: 2.5,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  Apply for Access
                </Button>
              </Link>
              <SignInButton mode="modal">
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 8,
                    py: 2.5,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Sign In
                </Button>
              </SignInButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Problem-Precision-Power Section */}
      <Box sx={{ py: 14, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'error.light', mb: 3 }}>
                  Problem
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.8, color: 'grey.300' }}>
                  Even the best estimators face uncertainty. Rough cost estimates leave you exposed to losses on profitable-looking jobs.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'info.light', mb: 3 }}>
                  Precision
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.8, color: 'grey.300' }}>
                  TreeShopOS automatically calculates exact equipment and labor costs based on your actual data. No spreadsheets, no guesswork.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.light', mb: 3 }}>
                  Power
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.8, color: 'grey.300' }}>
                  Bill for 100% of your costs—not 85%—and increase margins without raising prices. Reclaim control.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Empowerment Features - Results, not calculations */}
      <Box sx={{ py: 14 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Precision That Empowers
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 10, maxWidth: '800px', mx: 'auto' }}>
            While TreeShopOS handles verification automatically, you reclaim 10 hours per week for business growth.
          </Typography>

          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                p: 4,
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}>
                <CheckIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  Real Equipment Costs
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                  Know what every piece of equipment actually costs to run
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Ownership cost per hour + operating cost per hour = total cost per hour. Built-in safeguards ensure precision—automatically verified so you can focus on winning profitable work.
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                p: 4,
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}>
                <CheckIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  True Employee Burden
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                  Stop guessing at payroll taxes, insurance, and overhead
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Base wage × burden multiplier = real cost per hour. The system learns what's normal for your business, then validates data to protect your margins.
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                p: 4,
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}>
                <CheckIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  24/7 Profit Guardian
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                  Catch profit leaks in real-time, not after the money is gone
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Know your margins before the job is done. Instant alerts when metrics shift—catching errors in milliseconds that would take hours to find manually.
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                p: 4,
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}>
                <CheckIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  Superhuman Capabilities
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 600 }}>
                  Track 50 projects simultaneously—impossible with spreadsheets
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  Productivity tracking in inch-acres, StumpScore, and service-specific metrics. Replace "we worked hard" with actual data that drives fair pay and clear advancement.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Respectful Disruption - Attack the system, not the people */}
      <Box sx={{ py: 14, bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            Built By An Operator, For Operators
          </Typography>

          <Typography variant="h6" align="center" sx={{ mb: 8, lineHeight: 1.8, color: 'grey.200', fontWeight: 400 }}>
            You've built valuable expertise through years of experience.
            <br />
            Now amplify that expertise with mathematical precision.
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                  10+
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  Years in tree care operations
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                  5+
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  Years forestry mulching specialty
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                  10+
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  Hurricane disaster deployments
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                  17K+
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  YouTube subscribers learning these systems
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h5" align="center" sx={{ mt: 10, fontWeight: 500, lineHeight: 1.6 }}>
            This isn't software built by developers who Googled "tree removal."
            <br />
            It's mathematics built from boots-on-ground experience.
          </Typography>
        </Container>
      </Box>

      {/* Evolution Narrative - Respectful framing */}
      <Box sx={{ py: 14 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            The Industry Is Evolving
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            Traditional approaches worked for their era. But market dynamics have shifted—customer expectations, competition, technology have all changed.
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            Companies clinging to fear-based pressure tactics and expensive guesswork are losing trust. The winners build genuine connections, transparent operations, and relationship-based growth.
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            Most teams lack tools to do this at scale. Those who adapt will thrive.
          </Typography>
        </Container>
      </Box>

      {/* CTA Section - Invite-only positioning */}
      <Box sx={{ py: 16, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            This Is Invite-Only
          </Typography>

          <Typography variant="h5" align="center" sx={{ mb: 8, lineHeight: 1.8, fontWeight: 400 }}>
            We're working with serious operators who are tired of expensive nonsense that doesn't work.
            <br /><br />
            If you run equipment, know your business needs help, and are ready to amplify your expertise with precision—apply.
          </Typography>

          <Stack spacing={3} alignItems="center">
            <Link
              href="https://treeshop.app/tech"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 10,
                  py: 3,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: 6,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 8,
                  }
                }}
              >
                Apply for Access
              </Button>
            </Link>
            <Typography variant="body1" sx={{ color: 'grey.200', mt: 3 }}>
              Already have access?{' '}
              <SignInButton mode="modal">
                <Link component="button" sx={{ color: 'white', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Sign in here
                </Link>
              </SignInButton>
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" align="center" color="text.secondary">
            TreeShopOS © 2025
            <br />
            Precision that empowers. Built for operators who know there's a better way.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
