import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AttachMoney as DollarIcon,
  Schedule as ClockIcon,
  Security as ShieldIcon,
  TrendingUp as TrendUpIcon,
  Groups as TeamIcon,
  Calculate as CalculatorIcon,
  ExpandMore as ExpandMoreIcon,
  ForestOutlined as ForestIcon,
} from '@mui/icons-material';

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
            <ForestIcon sx={{ fontSize: 48, color: 'primary.main', mr: 1.5 }} />
            <Typography variant="h4" component="div" sx={{ fontWeight: 800, color: 'text.primary' }}>
              TreeShop
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <SignInButton mode="modal">
              <Button variant="outlined" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="contained" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Start Free Trial
              </Button>
            </SignUpButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ bgcolor: 'background.default', pt: 12, pb: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 800,
                mb: 3,
                lineHeight: 1.1,
              }}
            >
              Stop Guessing. Start Knowing.
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              color="text.secondary"
              sx={{
                mb: 4,
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 500,
                maxWidth: '900px',
                mx: 'auto',
                lineHeight: 1.4,
              }}
            >
              Turn Every Tree Job Into<br />Mathematical Certainty
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mb: 5,
                maxWidth: '700px',
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
              }}
            >
              Tree care operators lose $47K-$127K annually on bad estimates. You won't.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <SignUpButton mode="modal">
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 6,
                    py: 2,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Start Free Trial
                </Button>
              </SignUpButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Problem Section */}
      <Box sx={{ py: 10, bgcolor: 'grey.900', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            You're Not Bad At Estimating.
            <br />
            The Industry Just Runs On Guesswork.
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.light', mb: 1 }}>
                  63%
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  of tree service jobs are under-bid by $500-$3,000
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.light', mb: 1 }}>
                  4.2 hrs
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  average time wasted per week on re-estimates and change orders
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.light', mb: 1 }}>
                  $0
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.300' }}>
                  what you make on jobs you didn't know were unprofitable
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Solution Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            What You Actually Get
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8 }}>
            (Not what it does. What it means for your business.)
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <DollarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Know Your Real Costs Before You Quote
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  Stop leaving $2,000-$15,000 on the table per job
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Equipment hourly costs + employee burden + complexity scoring = real profit, not just revenue
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <ClockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Cut Estimating Time By 73%
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  What took 45 minutes now takes 12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  TreeScore + AFISS calculate risk in seconds, not hours
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <ShieldIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Never Get Burned On "Simple" Jobs Again
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  119 risk factors scored automatically
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AFISS catches what you miss when you're rushing
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <TrendUpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Track Real Productivity
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  Know if your crew cleared 12 or 3 inch-acres per hour
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proprietary metrics replace "we worked hard today"
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <TeamIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Build Careers, Not Just Crews
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  16 career tracks with clear progression = retention
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your people know exactly what gets them promoted and paid more
                </Typography>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <CalculatorIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Margin vs Markup. Finally.
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                  Know the difference and price accordingly
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Built-in calculators that show profit, not just revenue
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Proof Section */}
      <Box sx={{ py: 10, bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            Built By Someone Who Actually Does This Work
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }}>
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
                  YouTube subscribers learning this system
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h6" align="center" sx={{ mt: 8, fontWeight: 500, lineHeight: 1.6 }}>
            This isn't software built by developers who Googled "tree removal."
            <br />
            It's mathematics built from boots-on-ground mistakes.
          </Typography>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 8 }}>
            Three Steps To Stop Guessing
          </Typography>

          <Stack spacing={6}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                1. Input The Job
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Height, crown, DBH → TreeScore calculates complexity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                (15 seconds vs 15 minutes of "hmm, this looks tricky")
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                2. Select Your Loadout
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Pick crew + equipment → Real costs calculated automatically
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                (Equipment hourly cost, employee burden, everything)
              </Typography>
            </Box>

            <Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                3. See Real Profit
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Quote with confidence. Know your margin. Win profitable work.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                (Not revenue. Not hope. Actual profit.)
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* The Offer */}
      <Box sx={{ py: 12, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
            What It Costs To Keep Guessing
          </Typography>

          <Typography variant="h5" align="center" sx={{ mb: 6, lineHeight: 1.8, fontWeight: 500 }}>
            One under-bid job: -$2,000 to -$15,000
            <br />
            One month of TreeShop: Coming Soon
            <br />
            <br />
            Do the math.
          </Typography>

          <Stack spacing={2} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Start Free For 14 Days
            </Typography>
            <Typography variant="body1" sx={{ color: 'grey.200' }}>
              No credit card. No BS. Just see if it works.
            </Typography>
            <SignUpButton mode="modal">
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 8,
                  py: 2.5,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  mt: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  }
                }}
              >
                Start Free Trial
              </Button>
            </SignUpButton>
            <Typography variant="caption" sx={{ color: 'grey.300', mt: 2 }}>
              Cancel anytime. Keep the knowledge.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 700, mb: 6 }}>
            Common Questions
          </Typography>

          <Stack spacing={2}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Is this for big companies or small operators?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  Both. If you estimate jobs, you need this. 1 truck or 20.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  I'm not tech-savvy. Is this complicated?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  If you can text, you can use this. It's simpler than QuickBooks.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Do you integrate with other software?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  Not yet. We do one thing perfectly: help you price profitably.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  What if I cancel?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  Keep your data. No hard feelings. We want customers who win, not prisoners.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Why should I trust you?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  10 years of mistakes. Thousands of estimates. Math doesn't lie. Try it free.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Container>
      </Box>

      {/* Footer CTA */}
      <Box sx={{ py: 8, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="sm">
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Stop Losing Money On Bad Estimates
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Join tree service professionals who know their numbers.
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <SignUpButton mode="modal">
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Start Free Trial
              </Button>
            </SignUpButton>
          </Box>
        </Container>
      </Box>
    </>
  );
}
