'use client';

import React, { useState, useEffect } from 'react';
import { SignInButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  AppBar,
  Toolbar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom,
  Link,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function Home() {
  const { userId } = useAuth();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [spotsLeft] = useState(17);

  useEffect(() => {
    if (userId) {
      router.push("/dashboard");
    }
    setVisible(true);
  }, [userId, router]);

  if (userId) {
    return null; // Will redirect
  }

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'white' }}>

      {/* HEADER */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 153, 255, 0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/treeshop-logo.png"
              alt="TreeShop Logo"
              width={180}
              height={60}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          <SignInButton mode="modal">
            <Button
              variant="contained"
              sx={{
                bgcolor: '#0099FF',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0077CC',
                },
              }}
            >
              Login
            </Button>
          </SignInButton>
        </Toolbar>
      </AppBar>

      {/* HERO SECTION */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a1a3d 100%)',
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(0, 153, 255, 0.15) 0%, transparent 50%)',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={visible} timeout={1000}>
            <Box textAlign="center">

              {/* Spots Left Badge */}
              <Zoom in={visible} timeout={1200}>
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`${spotsLeft} Founding Member Spots Left`}
                  sx={{
                    bgcolor: '#0099FF',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    py: 2.5,
                    px: 1,
                    mb: 4,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.8 },
                    }
                  }}
                />
              </Zoom>

              {/* Main Headline */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4.5rem' },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 3,
                  background: 'linear-gradient(90deg, #ffffff 0%, #66CCFF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                How many more hours will you waste in the truck...
              </Typography>

              {/* Sub-headline */}
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.75rem' },
                  fontWeight: 400,
                  lineHeight: 1.6,
                  mb: 6,
                  color: '#e0e0e0',
                  maxWidth: '900px',
                  mx: 'auto',
                }}
              >
                ...instead of building the business? Stop being an admin and start being a CEO.
                I built the machine that runs your back-office{' '}
                <Box component="span" sx={{ color: '#66CCFF', fontWeight: 700 }}>
                  for you.
                </Box>
              </Typography>

              {/* CTA Button */}
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
                    bgcolor: '#0099FF',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    py: 2,
                    px: 6,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(0, 153, 255, 0.4)',
                    '&:hover': {
                      bgcolor: '#0077CC',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0, 153, 255, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Apply for Founding Member Access
                </Button>
              </Link>

              <Typography
                variant="body2"
                sx={{
                  mt: 2,
                  color: '#888',
                  fontSize: '0.9rem'
                }}
              >
                Limited to first 20 companies • Lock in this rate forever
              </Typography>

            </Box>
          </Fade>
        </Container>
      </Box>

      {/* PROBLEM AGITATION SECTION */}
      <Box sx={{ bgcolor: '#0f0f0f', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              textAlign: 'center',
              mb: 6,
            }}
          >
            Does This Sound Familiar?
          </Typography>

          <Grid container spacing={4}>
            {/* Problem 1 */}
            <Grid item xs={12} md={4}>
              <Zoom in={visible} timeout={800}>
                <Card
                  sx={{
                    bgcolor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: '#FF4444',
                      boxShadow: '0 12px 40px rgba(255, 68, 68, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#FF4444' }}>
                      15+ Wasted Hours
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                      You're stuck nights and weekends creating invoices, following up on quotes, and managing payroll instead of being with your family.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Problem 2 */}
            <Grid item xs={12} md={4}>
              <Zoom in={visible} timeout={1000}>
                <Card
                  sx={{
                    bgcolor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: '#FF4444',
                      boxShadow: '0 12px 40px rgba(255, 68, 68, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#FF4444' }}>
                      Crew & Job Chaos
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                      Your phone blows up all day. "Where's the next job?" "Did the client pay?" "What's the address?" You're a dispatcher, not an owner.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Problem 3 */}
            <Grid item xs={12} md={4}>
              <Zoom in={visible} timeout={1200}>
                <Card
                  sx={{
                    bgcolor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: '#FF4444',
                      boxShadow: '0 12px 40px rgba(255, 68, 68, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#FF4444' }}>
                      Stalled Growth
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                      You *know* you could scale, but you're trapped. You can't add another crew because your "system" (you) is already at 110% capacity.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SOLUTION BRIDGE SECTION */}
      <Box sx={{ bgcolor: '#0a0a0a', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              textAlign: 'center',
              mb: 2,
            }}
          >
            Introducing TreeShop
          </Typography>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              color: '#0099FF',
              mb: 4,
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            Your "Business-in-a-Box" Operating System
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#888',
              mb: 6,
              fontSize: '1.1rem',
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            This isn't another app. This is a complete, automated machine for running a modern tree company. I took every admin task you hate and automated it—because I was drowning in the same chaos running TREE SHOP LLC in Florida.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  bgcolor: '#1a1a1a',
                  border: '1px solid #0099FF',
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#0099FF' }}>
                    Automated Quoting & Follow-up
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                    Stop letting leads die.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  bgcolor: '#1a1a1a',
                  border: '1px solid #0099FF',
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#0099FF' }}>
                    One-Click Crew Dispatch
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                    Send job details, maps, and notes instantly.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  bgcolor: '#1a1a1a',
                  border: '1px solid #0099FF',
                  borderRadius: 3,
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#0099FF' }}>
                    Invoice & Payment Automation
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                    Get paid faster without lifting a finger.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FOUNDER STORY SECTION */}
      <Box sx={{ bgcolor: '#0f0f0f', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Box
            sx={{
              bgcolor: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 3,
              p: { xs: 4, md: 6 },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 800,
                textAlign: 'center',
                mb: 4,
                color: '#0099FF',
              }}
            >
              Built by a Tree Guy, For Tree Guys
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#e0e0e0',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              I'm Jeremiah Anderson. My wife Lacey and I own TREE SHOP LLC here in Florida.
              I built this system because I was sick of running my business from the truck cab at 9 PM,
              trying to remember if I invoiced the Johnson job or if the crew knew where to go tomorrow morning.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#e0e0e0',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              I spent months building an iOS app to run our operation. Lacey helped me figure out what actually mattered
              (and what was just me being a tech nerd). We got it dialed in for our business.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#e0e0e0',
                fontSize: '1.1rem',
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              Then early users told me they needed web access—not everyone wants to work from their phone.
              So I rebuilt the whole thing in a week. Now I'm shipping it to founding members while still
              running daily ops at TREE SHOP.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#66CCFF',
                fontSize: '1.2rem',
                lineHeight: 1.8,
                fontWeight: 600,
                fontStyle: 'italic',
                textAlign: 'center',
                mt: 4,
              }}
            >
              I'm getting acclimated to running a tech company while still running saws and managing crews.
              Once we get dialed in with the founding members, we'll open it up to the whole industry.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* OFFER STACK SECTION */}
      <Box sx={{ bgcolor: '#0f0f0f', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 800,
              textAlign: 'center',
              mb: 2,
            }}
          >
            The "Founding Member" Offer
          </Typography>
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              color: '#66CCFF',
              mb: 6,
              fontSize: '1.25rem',
              fontWeight: 400,
            }}
          >
            (This is the "Grand Slam" - You get the machine AND the insurance)
          </Typography>

          <Card
            sx={{
              bgcolor: '#1a1a1a',
              border: '2px solid #0099FF',
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              boxShadow: '0 20px 60px rgba(0, 153, 255, 0.3)',
            }}
          >
            <Box textAlign="center">
              <Chip
                label="FOUNDING MEMBER OFFER"
                sx={{
                  bgcolor: '#0099FF',
                  color: 'white',
                  fontWeight: 700,
                  mb: 4,
                  py: 1,
                }}
              />

              {/* Value Stack */}
              <List sx={{ textAlign: 'left', mb: 4 }}>
                <ListItem sx={{ px: 0, py: 2, borderBottom: '1px solid #2a2a2a' }}>
                  <ListItemText
                    primary="TreeShop OS (The Machine)"
                    secondary="Automated quoting, crew dispatch, invoicing, payments"
                    primaryTypographyProps={{
                      sx: { color: '#e0e0e0', fontSize: '1.2rem', fontWeight: 600 }
                    }}
                    secondaryTypographyProps={{
                      sx: { color: '#888', mt: 0.5 }
                    }}
                  />
                  <Typography sx={{ color: '#888', fontSize: '1.1rem', textDecoration: 'line-through' }}>
                    $5,000/mo
                  </Typography>
                </ListItem>

                <ListItem sx={{ px: 0, py: 2, borderBottom: '1px solid #2a2a2a' }}>
                  <ListItemText
                    primary="Weekly Strategy Calls (The Insurance)"
                    secondary="Live coaching to scale your operation"
                    primaryTypographyProps={{
                      sx: { color: '#e0e0e0', fontSize: '1.2rem', fontWeight: 600 }
                    }}
                    secondaryTypographyProps={{
                      sx: { color: '#888', mt: 0.5 }
                    }}
                  />
                  <Typography sx={{ color: '#888', fontSize: '1.1rem', textDecoration: 'line-through' }}>
                    $2,000/mo
                  </Typography>
                </ListItem>

                <ListItem sx={{ px: 0, py: 2, borderBottom: '1px solid #2a2a2a' }}>
                  <ListItemText
                    primary='Priority "Un-Stuck" Text Access'
                    secondary="Direct line when you hit roadblocks"
                    primaryTypographyProps={{
                      sx: { color: '#e0e0e0', fontSize: '1.2rem', fontWeight: 600 }
                    }}
                    secondaryTypographyProps={{
                      sx: { color: '#888', mt: 0.5 }
                    }}
                  />
                  <Typography sx={{ color: '#888', fontSize: '1.1rem', textDecoration: 'line-through' }}>
                    $1,000/mo
                  </Typography>
                </ListItem>

                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemText
                    primary="Founding Member Rate (Locked for Life)"
                    secondary="Never pay more, even when prices go up"
                    primaryTypographyProps={{
                      sx: { color: '#0099FF', fontSize: '1.2rem', fontWeight: 700 }
                    }}
                    secondaryTypographyProps={{
                      sx: { color: '#66CCFF', mt: 0.5 }
                    }}
                  />
                  <Typography sx={{ color: '#0099FF', fontSize: '1.1rem', fontWeight: 700 }}>
                    PRICELESS
                  </Typography>
                </ListItem>
              </List>

              {/* Price Reveal */}
              <Box sx={{ my: 4, p: 3, bgcolor: '#0a0a0a', borderRadius: 2 }}>
                <Typography
                  sx={{
                    color: '#888',
                    fontSize: '1.2rem',
                    textDecoration: 'line-through',
                    mb: 1,
                  }}
                >
                  Total Value: $8,000+/Month
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    fontWeight: 900,
                    color: '#0099FF',
                  }}
                >
                  $2,500
                  <Typography
                    component="span"
                    sx={{ fontSize: '1.5rem', color: '#888', fontWeight: 400 }}
                  >
                    /month
                  </Typography>
                </Typography>
                <Typography
                  sx={{
                    color: '#66CCFF',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mt: 1,
                  }}
                >
                  As a Founding Member
                </Typography>
              </Box>

              <Link
                href="https://treeshop.app/tech"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none' }}
              >
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    bgcolor: '#0099FF',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    py: 2.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(0, 153, 255, 0.4)',
                    '&:hover': {
                      bgcolor: '#0077CC',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0, 153, 255, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Apply for Founding Member Access
                </Button>
              </Link>

              <Typography
                variant="body2"
                sx={{ mt: 3, color: '#888', fontSize: '0.9rem' }}
              >
                Only {spotsLeft} founding member spots remaining
              </Typography>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* FINAL CTA SECTION */}
      <Box sx={{ bgcolor: '#0a0a0a', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 900,
                mb: 3,
              }}
            >
              Stop Guessing. Start Scaling.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#888',
                fontSize: '1.2rem',
                mb: 4,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              This "Founding Member" rate is locked in for life, but it's limited to the first 50 companies who join. After that, the price *will* go up.
            </Typography>

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
                  bgcolor: '#0099FF',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  py: 3,
                  px: 8,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(0, 153, 255, 0.4)',
                  '&:hover': {
                    bgcolor: '#0077CC',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0, 153, 255, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Apply Now
              </Button>
            </Link>

            <Typography
              variant="body2"
              sx={{
                mt: 3,
                color: '#66CCFF',
                fontSize: '1rem',
                fontStyle: 'italic',
              }}
            >
              Would it make sense to see if this is the answer for you?
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          bgcolor: '#000',
          py: 4,
          borderTop: '1px solid #1a1a1a',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" sx={{ color: '#666' }}>
              © 2025 TreeShop LLC. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Link
                href="https://treeshop.app/tech"
                sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#0099FF' } }}
              >
                Apply
              </Link>
              <Link
                href="#"
                sx={{ color: '#666', textDecoration: 'none', '&:hover': { color: '#0099FF' } }}
              >
                Contact
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
