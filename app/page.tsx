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
} from '@mui/material';

export default async function Home() {
  // Redirect logged-in users directly to dashboard
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // Show marketing landing page only for logged-out users
  return (
    <>
      {/* Navigation */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Image
              src="/treeshop-logo.png"
              alt="TreeShop"
              width={220}
              height={80}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          <Stack direction="row" spacing={2}>
            <Link
              href="https://treeshop.app/tech"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              <Button variant="outlined" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Apply for Access
              </Button>
            </Link>
            <SignInButton mode="modal">
              <Button variant="contained" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Sign In
              </Button>
            </SignInButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ bgcolor: 'background.default', pt: 16, pb: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                fontWeight: 800,
                mb: 4,
                lineHeight: 1.1,
              }}
            >
              TreeShopOS
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              color="text.secondary"
              sx={{
                mb: 6,
                fontSize: { xs: '1.5rem', md: '2.25rem' },
                fontWeight: 500,
                maxWidth: '1000px',
                mx: 'auto',
                lineHeight: 1.4,
              }}
            >
              Shift Control Back to Business Owners.
              <br />
              Deliver Real Value to Clients.
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 8,
                maxWidth: '800px',
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.35rem' },
                lineHeight: 1.6,
              }}
            >
              Replace overpriced, overleveraged "professionals" with systems that work.
              <br />
              Help everyone operate in their lane of business successfully.
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
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
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
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Sign In
                </Button>
              </SignInButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box sx={{ py: 12, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            The Problem Is Simple
          </Typography>

          <Typography variant="h5" align="center" sx={{ mb: 6, lineHeight: 1.8, fontWeight: 400, color: 'grey.300' }}>
            Tree service business owners are losing control of their operations to expensive consultants,
            complicated software they don't understand, and systems built by people who've never run equipment.
          </Typography>

          <Typography variant="h5" align="center" sx={{ lineHeight: 1.8, fontWeight: 400, color: 'grey.300' }}>
            Clients are paying inflated prices because nobody knows their real costs.
            <br />
            Crews are directionless because there's no clear path forward.
            <br />
            Everyone is guessing.
          </Typography>
        </Container>
      </Box>

      {/* Solution Section */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            TreeShopOS Changes That
          </Typography>

          <Stack spacing={6} sx={{ mt: 6 }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                For Business Owners
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Know your equipment costs down to the hour. See employee burden rates automatically calculated.
                Price jobs with mathematical certainty. Take back control from consultants charging $15K for spreadsheets.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                For Clients
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Get honest pricing based on actual costs, not inflated guesses. Work with operators who know
                their numbers and can explain exactly what you're paying for.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                For Crews
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Clear career paths. Know exactly what it takes to advance. See your productivity measured fairly.
                Work for operators who have their business dialed in.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Credibility Section */}
      <Box sx={{ py: 12, bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            Built By An Operator, For Operators
          </Typography>

          <Stack spacing={4} sx={{ mt: 6 }}>
            <Typography variant="h6" align="center" sx={{ lineHeight: 1.8, color: 'grey.200' }}>
              10+ years running tree care operations
            </Typography>
            <Typography variant="h6" align="center" sx={{ lineHeight: 1.8, color: 'grey.200' }}>
              5+ years specializing in forestry mulching
            </Typography>
            <Typography variant="h6" align="center" sx={{ lineHeight: 1.8, color: 'grey.200' }}>
              10+ hurricane disaster deployments
            </Typography>
            <Typography variant="h6" align="center" sx={{ lineHeight: 1.8, color: 'grey.200' }}>
              17,000+ YouTube subscribers learning these systems
            </Typography>
          </Stack>

          <Typography variant="h5" align="center" sx={{ mt: 8, fontWeight: 500, lineHeight: 1.6 }}>
            This isn't software built by developers who Googled "tree removal."
            <br />
            It's mathematics built from boots-on-ground experience.
          </Typography>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 8 }}>
            What You Get
          </Typography>

          <Stack spacing={6}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Real Equipment Costs
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Ownership cost per hour + operating cost per hour = total cost per hour.
                Know what every piece of equipment actually costs to run.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                True Employee Burden
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Base wage × burden multiplier = real cost per hour.
                Stop guessing at payroll taxes, insurance, and overhead.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Scientific Job Pricing
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                TreeScore complexity × AFISS risk factors × production rate = accurate estimate.
                Price based on mathematics, not hope.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Career Progression Systems
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                16 defined roles with clear advancement paths.
                Your crew knows what it takes to move up and earn more.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                Productivity Tracking
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Measure output in inch-acres, StumpScore, or service-specific metrics.
                Replace "we worked hard" with actual data.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Access Section */}
      <Box sx={{ py: 14, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            This Is Invite-Only
          </Typography>

          <Typography variant="h5" align="center" sx={{ mb: 8, lineHeight: 1.8, fontWeight: 400 }}>
            We're working with serious operators who are tired of being sold expensive nonsense.
            <br /><br />
            If you run equipment, know your business needs help, and are ready to take back control—apply.
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
                  '&:hover': {
                    bgcolor: 'grey.100',
                  }
                }}
              >
                Apply for Access
              </Button>
            </Link>
            <Typography variant="body1" sx={{ color: 'grey.200', mt: 3 }}>
              Already have access?{' '}
              <SignInButton mode="modal">
                <Link component="button" sx={{ color: 'white', fontWeight: 600, cursor: 'pointer' }}>
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
            Built for operators who know there's a better way.
          </Typography>
        </Container>
      </Box>
    </>
  );
}
