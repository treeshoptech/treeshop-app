import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Button
} from '@mui/material';
import { UserButton } from "@clerk/nextjs";
import {
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <>
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            TreeShop
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" href="/">
              Home
            </Button>
            <UserButton afterSignOutUrl="/" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dashboard Content */}
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
            Dashboard
          </Typography>

          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        $0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Projects
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customers
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoneyIcon sx={{ color: 'primary.main', fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        0%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Profit Margin
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <AssignmentIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    New Project
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start a new project and generate a quote
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Manage Customers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and manage your customer list
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <TrendingUpIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    View Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track your business performance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
