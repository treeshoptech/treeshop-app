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
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

type InvoiceStatus = "Draft" | "Sent" | "Viewed" | "Partial" | "Paid" | "Overdue" | "Void";

const STATUS_COLORS: Record<InvoiceStatus, "default" | "info" | "warning" | "success" | "error"> = {
  "Draft": "default",
  "Sent": "info",
  "Viewed": "warning",
  "Partial": "warning",
  "Paid": "success",
  "Overdue": "error",
  "Void": "default",
};

export default function InvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Check");

  // Fetch projects with status "Invoice"
  const allProjects = useQuery(api.projects.list);
  const invoiceProjects = allProjects?.filter((p) => p.status === "Invoice") || [];

  // Filter by status
  const filteredInvoices = statusFilter === "All"
    ? invoiceProjects
    : invoiceProjects.filter((inv) => inv.invoiceStatus === statusFilter);

  // Mutations
  const updateProject = useMutation(api.projects.update);

  const handleOpenPaymentDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentAmount((invoice.estimatedValue || 0).toString());
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice) return;

    try {
      const amount = parseFloat(paymentAmount);
      const currentPaid = selectedInvoice.amountPaid || 0;
      const newPaid = currentPaid + amount;
      const total = selectedInvoice.estimatedValue || 0;
      const newBalance = total - newPaid;

      let newStatus: InvoiceStatus = "Partial";
      if (newBalance <= 0) {
        newStatus = "Paid";
      }

      await updateProject({
        id: selectedInvoice._id,
        invoiceStatus: newStatus,
        amountPaid: newPaid,
      });

      setPaymentDialogOpen(false);
      setSelectedInvoice(null);
      setPaymentAmount("");
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  };

  const handleSendInvoice = async (invoice: any) => {
    try {
      await updateProject({
        id: invoice._id,
        invoiceStatus: "Sent",
      });
    } catch (error) {
      console.error("Error sending invoice:", error);
    }
  };

  const stats = {
    total: invoiceProjects.length,
    draft: invoiceProjects.filter((inv) => inv.invoiceStatus === "Draft" || !inv.invoiceStatus).length,
    sent: invoiceProjects.filter((inv) => inv.invoiceStatus === "Sent").length,
    paid: invoiceProjects.filter((inv) => inv.invoiceStatus === "Paid").length,
    totalRevenue: invoiceProjects
      .filter((inv) => inv.invoiceStatus === "Paid")
      .reduce((sum, inv) => sum + (inv.estimatedValue || 0), 0),
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h3" gutterBottom>
            Invoices
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage invoices and track payments
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Invoices
                </Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Sent
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.sent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Paid
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.paid}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(stats.totalRevenue)}
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
              <MenuItem value="All">All Invoices</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Sent">Sent</MenuItem>
              <MenuItem value="Viewed">Viewed</MenuItem>
              <MenuItem value="Partial">Partial Payment</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Void">Void</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Invoices Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Property Address</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No invoices found. Convert completed work orders to invoices.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const total = invoice.estimatedValue || 0;
                  const paid = invoice.amountPaid || 0;
                  const balance = total - paid;

                  return (
                    <TableRow key={invoice._id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          INV-{invoice._id.slice(-6).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">{invoice.customerName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{invoice.propertyAddress}</Typography>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(total)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(paid)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={balance > 0 ? "error.main" : "success.main"}
                          fontWeight="medium"
                        >
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(balance)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.invoiceStatus || "Draft"}
                          color={STATUS_COLORS[invoice.invoiceStatus as InvoiceStatus] || "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(invoice._creationTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/invoices/${invoice._id}`)}
                            title="View Invoice"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {(!invoice.invoiceStatus || invoice.invoiceStatus === "Draft") && (
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleSendInvoice(invoice)}
                              title="Send Invoice"
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          )}
                          {balance > 0 && invoice.invoiceStatus !== "Draft" && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenPaymentDialog(invoice)}
                              title="Record Payment"
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Invoice Total
              </Typography>
              <Typography variant="h6">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(selectedInvoice?.estimatedValue || 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Already Paid
              </Typography>
              <Typography variant="h6">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(selectedInvoice?.amountPaid || 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Remaining Balance
              </Typography>
              <Typography variant="h6" color="error.main">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(
                  (selectedInvoice?.estimatedValue || 0) - (selectedInvoice?.amountPaid || 0)
                )}
              </Typography>
            </Box>
            <TextField
              label="Payment Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              fullWidth
              required
              InputProps={{ startAdornment: "$" }}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="Check">Check</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="ACH">ACH</MenuItem>
                <MenuItem value="Wire Transfer">Wire Transfer</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRecordPayment} variant="contained">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
