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
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowForward as ConvertIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Send as SendIcon,
  Edit as EditIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
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
  const [expandedProposal, setExpandedProposal] = useState<Id<"projects"> | null>(null);

  // Fetch projects with status "Proposal"
  const allProjects = useQuery(api.projects.list);
  const proposals = allProjects?.filter((p) => p.status === "Proposal") || [];

  // Fetch line items for value calculation
  const lineItems = useQuery(api.lineItems.list);

  // Filter by status
  const filteredProposals = statusFilter === "All"
    ? proposals
    : proposals.filter((p) => p.proposalStatus === statusFilter);

  // Mutations
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.remove);
  const createWorkOrderFromProposal = useMutation(api.workOrders.createFromProposal);

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
    if (!confirm(`Convert proposal for ${proposal.customerName} to work order?`)) {
      return;
    }

    try {
      const workOrderId = await createWorkOrderFromProposal({
        proposalId: proposal._id,
      });

      router.push(`/dashboard/work-orders/${workOrderId}`);
    } catch (error) {
      console.error("Error converting to work order:", error);
      alert("Failed to convert to work order. Please try again.");
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

  // Calculate proposal value from line items
  const getProposalValue = (proposalId: string) => {
    const proposalLineItems = lineItems?.filter(
      (li) => li.parentDocId === proposalId && li.parentDocType === "Proposal"
    ) || [];
    return proposalLineItems.reduce((sum, li) => sum + (li.totalPrice || 0), 0);
  };

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.proposalStatus === "Draft" || !p.proposalStatus).length,
    sent: proposals.filter((p) => p.proposalStatus === "Sent").length,
    accepted: proposals.filter((p) => p.proposalStatus === "Accepted").length,
    totalValue: proposals.reduce((sum, p) => sum + getProposalValue(p._id), 0),
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
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
            sx={{ mt: 1 }}
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

        {/* Proposal Cards */}
        {filteredProposals.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No proposals found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Convert leads to proposals or create a new proposal directly
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push("/proposals/new")}
            >
              Create First Proposal
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredProposals.map((proposal) => {
              const isExpanded = expandedProposal === proposal._id;
              const proposalValue = getProposalValue(proposal._id);
              const proposalLineItems = lineItems?.filter(
                (li) => li.parentDocId === proposal._id && li.parentDocType === "Proposal"
              ) || [];

              return (
                <Card
                  key={proposal._id}
                  sx={{
                    border: '1px solid',
                    borderColor: isExpanded ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                >
                  <CardContent
                    sx={{
                      cursor: 'pointer',
                      pb: isExpanded ? 2 : 1
                    }}
                    onClick={() => setExpandedProposal(isExpanded ? null : proposal._id)}
                  >
                    {/* Collapsed View */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flex: 1, minWidth: 0 }}>
                        {/* Customer & Status */}
                        <Box sx={{ minWidth: 200, maxWidth: 300 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {proposal.customerName}
                          </Typography>
                          <Chip
                            label={proposal.proposalStatus || "Draft"}
                            color={STATUS_COLORS[proposal.proposalStatus as ProposalStatus] || "default"}
                            size="small"
                          />
                        </Box>

                        {/* Service & Address */}
                        <Box sx={{ minWidth: 250, maxWidth: 400, flex: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {proposal.serviceType}
                          </Typography>
                          <Typography variant="body2">
                            {proposal.propertyAddress?.split(',')[0] || 'No address'}
                          </Typography>
                        </Box>

                        {/* Value & Date */}
                        <Box sx={{ minWidth: 150 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Value
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                            }).format(proposalValue)}
                          </Typography>
                        </Box>

                        {/* Created Date */}
                        <Box sx={{ minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Created
                          </Typography>
                          <Typography variant="body2">
                            {new Date(proposal._creationTime).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right side: Actions & Expand */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        {/* Quick Actions - Only when NOT expanded */}
                        {!isExpanded && proposal.proposalStatus === "Accepted" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<ConvertIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConvertToWorkOrder(proposal);
                            }}
                          >
                            Create Work Order
                          </Button>
                        )}

                        {/* Expand Icon */}
                        <IconButton size="small">
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Expanded View */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Grid container spacing={3}>
                          {/* Proposal Details */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Proposal Information
                            </Typography>
                            <Stack spacing={1}>
                              <Typography variant="body2">
                                <strong>Customer:</strong> {proposal.customerName}
                              </Typography>
                              {proposal.customerEmail && (
                                <Typography variant="body2">
                                  <strong>Email:</strong> {proposal.customerEmail}
                                </Typography>
                              )}
                              {proposal.customerPhone && (
                                <Typography variant="body2">
                                  <strong>Phone:</strong> {proposal.customerPhone}
                                </Typography>
                              )}
                              <Typography variant="body2">
                                <strong>Service:</strong> {proposal.serviceType}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Address:</strong> {proposal.propertyAddress || 'Not provided'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Value:</strong>{" "}
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(proposalValue)}
                              </Typography>
                            </Stack>
                          </Grid>

                          {/* Line Items Summary */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Line Items ({proposalLineItems.length})
                            </Typography>
                            <Stack spacing={1}>
                              {proposalLineItems.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  No line items added yet
                                </Typography>
                              ) : (
                                proposalLineItems.map((li) => (
                                  <Box key={li._id}>
                                    <Typography variant="body2">
                                      <strong>{li.serviceType}:</strong> {li.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {li.totalEstimatedHours.toFixed(1)} hrs • {" "}
                                      {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                      }).format(li.totalPrice)}
                                    </Typography>
                                  </Box>
                                ))
                              )}
                            </Stack>
                          </Grid>

                          {/* Notes */}
                          {proposal.notes && (
                            <Grid item xs={12}>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Notes
                              </Typography>
                              <Typography variant="body2">{proposal.notes}</Typography>
                            </Grid>
                          )}

                          {/* Action Buttons */}
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                              <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/proposals/${proposal._id}`);
                                }}
                              >
                                Edit Proposal
                              </Button>

                              {proposal.proposalStatus === "Draft" && (
                                <Button
                                  variant="contained"
                                  startIcon={<SendIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(proposal._id, "Sent");
                                  }}
                                >
                                  Mark as Sent
                                </Button>
                              )}

                              {(proposal.proposalStatus === "Sent" || proposal.proposalStatus === "Viewed") && (
                                <>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<AcceptIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(proposal._id, "Accepted");
                                    }}
                                  >
                                    Mark as Accepted
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<RejectIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(proposal._id, "Rejected");
                                    }}
                                  >
                                    Mark as Rejected
                                  </Button>
                                </>
                              )}

                              {proposal.proposalStatus === "Accepted" && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  startIcon={<ConvertIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleConvertToWorkOrder(proposal);
                                  }}
                                >
                                  Create Work Order
                                </Button>
                              )}

                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProposal(proposal._id);
                                }}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
