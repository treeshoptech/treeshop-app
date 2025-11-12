"use client";

import { Card, CardContent, Box, Typography, Stack } from '@mui/material';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import LeadIcon from '@mui/icons-material/ContactPage';
import ProposalIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Build';
import InvoiceIcon from '@mui/icons-material/Receipt';

export function PipelineWidget() {
  const metrics = useQuery(api.dashboard.getMetrics);

  if (!metrics) {
    return (
      <Card sx={{ height: '100%', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
        <CardContent>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  const stages = [
    {
      name: 'Leads',
      count: metrics.totalLeads,
      icon: <LeadIcon />,
      color: '#8E8E93',
      conversion: null
    },
    {
      name: 'Proposals',
      count: metrics.totalProposals,
      icon: <ProposalIcon />,
      color: '#007AFF',
      conversion: metrics.leadToProposal
    },
    {
      name: 'Work Orders',
      count: metrics.totalWorkOrders,
      icon: <WorkIcon />,
      color: '#FF9500',
      conversion: metrics.proposalToClose
    },
    {
      name: 'Invoiced',
      count: metrics.totalInvoices,
      icon: <InvoiceIcon />,
      color: '#34C759',
      conversion: null
    }
  ];

  return (
    <Card sx={{ height: '100%', bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: '#007AFF' }} />

      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Sales Pipeline
          </Typography>
          <Typography variant="body2" sx={{ color: '#8E8E93' }}>
            Active opportunities: {metrics.totalLeads + metrics.totalProposals + metrics.totalWorkOrders}
          </Typography>
        </Box>

        <Stack spacing={2}>
          {stages.map((stage, index) => (
            <Box key={stage.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${stage.color}20`,
                      color: stage.color,
                      display: 'flex'
                    }}
                  >
                    {stage.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stage.name}
                    </Typography>
                    {stage.conversion !== null && (
                      <Typography variant="caption" sx={{ color: '#8E8E93' }}>
                        {stage.conversion.toFixed(0)}% conversion
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: stage.color }}>
                  {stage.count}
                </Typography>
              </Box>

              {index < stages.length - 1 && (
                <Box
                  sx={{
                    ml: 3,
                    pl: 2.5,
                    borderLeft: '2px dashed #2C2C2E',
                    height: 16
                  }}
                />
              )}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#2C2C2E', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#8E8E93' }}>
              Pipeline Value
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#007AFF' }}>
              ${(metrics.pipelineValue / 1000).toFixed(0)}k
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
