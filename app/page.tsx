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
                Stop Losing Money<br />On Every Third Mulching Job
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
                Most forestry mulching companies guess their pricing and wonder where the profit went.
                TreeShop gives you the exact numbers so you stop leaving{' '}
                <Box component="span" sx={{ color: '#66CCFF', fontWeight: 700 }}>
                  $50K+ per year
                </Box>{' '}
                on the table.
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
                $2,500/month • First 20 companies lock in this rate forever
              </Typography>

            </Box>
          </Fade>
        </Container>
      </Box>

      {/* WHAT YOU GET SECTION */}
      <Box sx={{ bgcolor: '#0f0f0f', py: { xs: 8, md: 12 } }}>
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
            What You Get
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#888',
              mb: 6,
              fontSize: '1.1rem',
            }}
          >
            Everything you need to price jobs scientifically and win more profitable work
          </Typography>

          <Grid container spacing={3}>
            {/* Feature 1 */}
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
                      borderColor: '#0099FF',
                      boxShadow: '0 12px 40px rgba(0, 153, 255, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <SpeedIcon sx={{ fontSize: 48, color: '#0099FF', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      Mulching Score Calculator
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                      Know exactly how many hours a job will take based on acreage, DBH, and 119 AFISS complexity factors. CAT 265, ASV, Fecon—all calibrated.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Feature 2 */}
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
                      borderColor: '#0099FF',
                      boxShadow: '0 12px 40px rgba(0, 153, 255, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <AttachMoneyIcon sx={{ fontSize: 48, color: '#0099FF', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      Real Equipment Costs
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                      Track actual hourly costs for each mulcher, truck, and operator. Fuel, maintenance, finance, insurance—everything factored in automatically.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* Feature 3 */}
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
                      borderColor: '#0099FF',
                      boxShadow: '0 12px 40px rgba(0, 153, 255, 0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <BarChartIcon sx={{ fontSize: 48, color: '#0099FF', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      Proposal Generator
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0', lineHeight: 1.7 }}>
                      Turn your calculations into professional proposals in seconds. Show clients exactly what they're getting with scientific precision.
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* PRICING SECTION */}
      <Box sx={{ bgcolor: '#0a0a0a', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
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
                label="FOUNDING MEMBER"
                sx={{
                  bgcolor: '#0099FF',
                  color: 'white',
                  fontWeight: 700,
                  mb: 3,
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '3rem', md: '4rem' },
                  fontWeight: 900,
                  mb: 1,
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
                variant="body1"
                sx={{
                  color: '#66CCFF',
                  fontWeight: 600,
                  mb: 4,
                  fontSize: '1.1rem',
                }}
              >
                Lock in this rate forever as a founding member
              </Typography>

              <List sx={{ textAlign: 'left', mb: 4 }}>
                {[
                  'Complete Mulching Score calculator',
                  'Equipment cost tracking (unlimited machines)',
                  'Crew & employee burden calculator',
                  'AFISS complexity system (119 factors)',
                  'Professional proposal generator',
                  'Job tracking & analytics',
                  'Priority founding member support',
                ].map((item, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon sx={{ color: '#0099FF' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={{
                        sx: { color: '#e0e0e0', fontSize: '1.1rem' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>

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
                  Apply Now
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

          {/* What You'll Achieve */}
          <Box sx={{ mt: 8 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                mb: 4,
              }}
            >
              What You'll Achieve
            </Typography>
            <List>
              {[
                'Price every job with mathematical precision—whether you\'re starting out or seasoned',
                'Win more profitable work by knowing your exact costs down to the penny',
                'Scale your mulching operation confidently with real data, not guesswork',
                'Maximize profit per acre instead of just grinding more hours',
                'Build a business that works for you, not the other way around',
              ].map((item, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: '#0099FF' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{
                      sx: { color: '#e0e0e0', fontSize: '1.1rem' }
                    }}
                  />
                </ListItem>
              ))}
            </List>
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
              © 2025 TreeShop. Built for forestry mulching companies.
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
