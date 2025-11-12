"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

type ProposalStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected";

const STATUS_COLORS: Record<ProposalStatus, "default" | "info" | "warning" | "success" | "error"> = {
  "Draft": "default",
  "Sent": "info",
  "Viewed": "warning",
  "Accepted": "success",
  "Rejected": "error",
};

export default function ProposalsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "All">("All");

  // Fetch projects with status "Proposal"
  const allProjects = useQuery(api.projects.list);
  const proposals = allProjects?.filter((p) => p.status === "Proposal") || [];

  // Filter by status
  const filteredProposals = statusFilter === "All"
    ? proposals
    : proposals.filter((p) => p.proposalStatus === statusFilter);

  // Mutations
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.remove);

  const handleDeleteProposal = async (id: Id<"projects">) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      try {
        await deleteProject({ id });
      } catch (error) {
        console.error("Error deleting proposal:", error);
      }
    }
  };

  const handleConvertToWorkOrder = async (proposal: any) => {
    try {
      await updateProject({
        id: proposal._id,
        status: "Work Order",
      });
    } catch (error) {
      console.error("Error converting to work order:", error);
    }
  };

  const handleStatusChange = async (proposalId: Id<"projects">, newStatus: ProposalStatus) => {
    try {
      await updateProject({
        id: proposalId,
        proposalStatus: newStatus,
      });
    } catch (error) {
      console.error("Error updating proposal status:", error);
    }
  };

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.proposalStatus === "Draft" || !p.proposalStatus).length,
    sent: proposals.filter((p) => p.proposalStatus === "Sent").length,
    accepted: proposals.filter((p) => p.proposalStatus === "Accepted").length,
    totalValue: proposals.reduce((sum, p) => sum + (p.estimatedValue || 0), 0),
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              Proposals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Build and manage proposals with line item pricing
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/proposals/new")}
            size="large"
          >
            New Proposal
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Proposals
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Draft
                </Typography>
                <Typography variant="h4" color="text.secondary">
                  {stats.draft}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Accepted
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.accepted}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
                <Typography variant="h4">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(stats.totalValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter */}
        <Paper sx={{ p: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="All">All Proposals</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Sent">Sent</MenuItem>
              <MenuItem value="Viewed">Viewed</MenuItem>
              <MenuItem value="Accepted">Accepted</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Proposals Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Property Address</TableCell>
                <TableCell>Service Type</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No proposals found. Convert leads or create a new proposal.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((proposal) => (
                  <TableRow key={proposal._id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {proposal.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{proposal.propertyAddress}</Typography>
                    </TableCell>
                    <TableCell>{proposal.serviceType}</TableCell>
                    <TableCell>
                      {proposal.estimatedValue
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                          }).format(proposal.estimatedValue)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={proposal.proposalStatus || "Draft"}
                          onChange={(e) =>
                            handleStatusChange(proposal._id, e.target.value as ProposalStatus)
                          }
                          size="small"
                        >
                          <MenuItem value="Draft">Draft</MenuItem>
                          <MenuItem value="Sent">Sent</MenuItem>
                          <MenuItem value="Viewed">Viewed</MenuItem>
                          <MenuItem value="Accepted">Accepted</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      {new Date(proposal._creationTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/proposals/${proposal._id}`)}
                          title="View/Edit Proposal"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {proposal.proposalStatus === "Accepted" && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleConvertToWorkOrder(proposal)}
                            title="Convert to Work Order"
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProposal(proposal._id)}
                          title="Delete Proposal"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );
}
