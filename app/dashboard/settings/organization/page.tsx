"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function OrganizationSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch settings
  const settings = useQuery(api.organizationSettings.get);

  // Mutations
  const upsertSettings = useMutation(api.organizationSettings.upsert);

  // Form state
  const [formData, setFormData] = useState({
    // Terms & Conditions
    proposalTerms: "",
    workOrderTerms: "",
    invoiceTerms: "",
    paymentTerms: "Net 30",

    // Proposal Settings
    proposalValidityDays: 30,
    proposalFooter: "",
    proposalHeader: "",
    showDetailedBreakdown: false,

    // Invoice Settings
    invoicePrefix: "INV-",
    invoiceStartNumber: 1000,
    invoiceFooter: "",
    lateFeePercentage: 1.5,
    lateFeeDaysAfterDue: 30,

    // Work Order Settings
    requireCustomerSignature: true,
    requirePhotoDocumentation: true,
    minimumPhotos: 3,

    // Business Info
    companyLegalName: "",
    companyTagline: "",
    licenseNumber: "",
    insuranceCertificate: "",
    taxId: "",
    website: "",
    phone: "",
    email: "",

    // Liability & Insurance
    liabilityDisclaimer: "",
    insuranceInfo: "",
    warrantyInfo: "",
  });

  // Update form data when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        proposalTerms: settings.proposalTerms || "",
        workOrderTerms: settings.workOrderTerms || "",
        invoiceTerms: settings.invoiceTerms || "",
        paymentTerms: settings.paymentTerms || "Net 30",
        proposalValidityDays: settings.proposalValidityDays || 30,
        proposalFooter: settings.proposalFooter || "",
        proposalHeader: settings.proposalHeader || "",
        showDetailedBreakdown: settings.showDetailedBreakdown || false,
        invoicePrefix: settings.invoicePrefix || "INV-",
        invoiceStartNumber: settings.invoiceStartNumber || 1000,
        invoiceFooter: settings.invoiceFooter || "",
        lateFeePercentage: settings.lateFeePercentage || 1.5,
        lateFeeDaysAfterDue: settings.lateFeeDaysAfterDue || 30,
        requireCustomerSignature: settings.requireCustomerSignature ?? true,
        requirePhotoDocumentation: settings.requirePhotoDocumentation ?? true,
        minimumPhotos: settings.minimumPhotos || 3,
        companyLegalName: settings.companyLegalName || "",
        companyTagline: settings.companyTagline || "",
        licenseNumber: settings.licenseNumber || "",
        insuranceCertificate: settings.insuranceCertificate || "",
        taxId: settings.taxId || "",
        website: settings.website || "",
        phone: settings.phone || "",
        email: settings.email || "",
        liabilityDisclaimer: settings.liabilityDisclaimer || "",
        insuranceInfo: settings.insuranceInfo || "",
        warrantyInfo: settings.warrantyInfo || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await upsertSettings(formData);
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Error saving settings");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              Organization Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure terms, conditions, and business information
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            size="large"
          >
            Save Changes
          </Button>
        </Box>

        {saveMessage && (
          <Paper sx={{ p: 2, bgcolor: saveMessage.includes("Error") ? "error.dark" : "success.dark" }}>
            <Typography color={saveMessage.includes("Error") ? "error.contrastText" : "success.contrastText"}>
              {saveMessage}
            </Typography>
          </Paper>
        )}

        {/* Tabs */}
        <Paper>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<DescriptionIcon />} label="Terms & Conditions" />
            <Tab icon={<BusinessIcon />} label="Business Information" />
            <Tab icon={<ReceiptIcon />} label="Document Settings" />
            <Tab icon={<ShieldIcon />} label="Liability & Insurance" />
          </Tabs>

          {/* Tab 0: Terms & Conditions */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={3} sx={{ px: 3 }}>
              <TextField
                fullWidth
                label="Proposal Terms & Conditions"
                multiline
                rows={6}
                value={formData.proposalTerms}
                onChange={(e) => setFormData({ ...formData, proposalTerms: e.target.value })}
                helperText="Terms displayed on proposals sent to customers"
              />

              <TextField
                fullWidth
                label="Work Order Terms & Conditions"
                multiline
                rows={6}
                value={formData.workOrderTerms}
                onChange={(e) => setFormData({ ...formData, workOrderTerms: e.target.value })}
                helperText="Terms displayed on work orders"
              />

              <TextField
                fullWidth
                label="Invoice Terms & Conditions"
                multiline
                rows={6}
                value={formData.invoiceTerms}
                onChange={(e) => setFormData({ ...formData, invoiceTerms: e.target.value })}
                helperText="Terms displayed on invoices"
              />

              <TextField
                fullWidth
                label="Payment Terms"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                helperText='e.g., "Net 30", "Due on Receipt", "50% deposit required"'
              />
            </Stack>
          </TabPanel>

          {/* Tab 1: Business Information */}
          <TabPanel value={activeTab} index={1}>
            <Stack spacing={3} sx={{ px: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Legal Name"
                    value={formData.companyLegalName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyLegalName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company Tagline"
                    value={formData.companyTagline}
                    onChange={(e) =>
                      setFormData({ ...formData, companyTagline: e.target.value })
                    }
                    helperText="Displayed on documents and proposals"
                  />
                </Grid>
              </Grid>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Insurance Certificate #"
                    value={formData.insuranceCertificate}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceCertificate: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tax ID / EIN"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://treeshop.app"
                  />
                </Grid>
              </Grid>
            </Stack>
          </TabPanel>

          {/* Tab 2: Document Settings */}
          <TabPanel value={activeTab} index={2}>
            <Stack spacing={4} sx={{ px: 3 }}>
              {/* Proposal Settings */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Proposal Settings
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Proposal Header"
                    multiline
                    rows={3}
                    value={formData.proposalHeader}
                    onChange={(e) =>
                      setFormData({ ...formData, proposalHeader: e.target.value })
                    }
                    helperText="Text displayed at the top of proposals"
                  />
                  <TextField
                    fullWidth
                    label="Proposal Footer"
                    multiline
                    rows={3}
                    value={formData.proposalFooter}
                    onChange={(e) =>
                      setFormData({ ...formData, proposalFooter: e.target.value })
                    }
                    helperText="Text displayed at the bottom of proposals"
                  />
                  <TextField
                    type="number"
                    label="Proposal Validity (Days)"
                    value={formData.proposalValidityDays}
                    onChange={(e) =>
                      setFormData({ ...formData, proposalValidityDays: parseInt(e.target.value) })
                    }
                    sx={{ maxWidth: 300 }}
                    helperText="How many days until proposal expires"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.showDetailedBreakdown}
                        onChange={(e) =>
                          setFormData({ ...formData, showDetailedBreakdown: e.target.checked })
                        }
                      />
                    }
                    label="Show detailed cost breakdown to customers"
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Invoice Settings */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Invoice Settings
                </Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Invoice Prefix"
                        value={formData.invoicePrefix}
                        onChange={(e) =>
                          setFormData({ ...formData, invoicePrefix: e.target.value })
                        }
                        helperText='e.g., "INV-", "TS-"'
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Starting Invoice Number"
                        value={formData.invoiceStartNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, invoiceStartNumber: parseInt(e.target.value) })
                        }
                        helperText="Next invoice will start from this number"
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Invoice Footer"
                    multiline
                    rows={2}
                    value={formData.invoiceFooter}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceFooter: e.target.value })
                    }
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Late Fee Percentage"
                        value={formData.lateFeePercentage}
                        onChange={(e) =>
                          setFormData({ ...formData, lateFeePercentage: parseFloat(e.target.value) })
                        }
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Late Fee After (Days)"
                        value={formData.lateFeeDaysAfterDue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lateFeeDaysAfterDue: parseInt(e.target.value),
                          })
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>

              <Divider />

              {/* Work Order Settings */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Work Order Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.requireCustomerSignature}
                        onChange={(e) =>
                          setFormData({ ...formData, requireCustomerSignature: e.target.checked })
                        }
                      />
                    }
                    label="Require customer signature on work orders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.requirePhotoDocumentation}
                        onChange={(e) =>
                          setFormData({ ...formData, requirePhotoDocumentation: e.target.checked })
                        }
                      />
                    }
                    label="Require photo documentation for completed work"
                  />
                  {formData.requirePhotoDocumentation && (
                    <TextField
                      type="number"
                      label="Minimum Photos Required"
                      value={formData.minimumPhotos}
                      onChange={(e) =>
                        setFormData({ ...formData, minimumPhotos: parseInt(e.target.value) })
                      }
                      sx={{ maxWidth: 300 }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </TabPanel>

          {/* Tab 3: Liability & Insurance */}
          <TabPanel value={activeTab} index={3}>
            <Stack spacing={3} sx={{ px: 3 }}>
              <TextField
                fullWidth
                label="Liability Disclaimer"
                multiline
                rows={6}
                value={formData.liabilityDisclaimer}
                onChange={(e) =>
                  setFormData({ ...formData, liabilityDisclaimer: e.target.value })
                }
                helperText="Disclaimer displayed on proposals and work orders"
              />

              <TextField
                fullWidth
                label="Insurance Information"
                multiline
                rows={6}
                value={formData.insuranceInfo}
                onChange={(e) => setFormData({ ...formData, insuranceInfo: e.target.value })}
                helperText="Insurance coverage details shown to customers"
              />

              <TextField
                fullWidth
                label="Warranty Information"
                multiline
                rows={6}
                value={formData.warrantyInfo}
                onChange={(e) => setFormData({ ...formData, warrantyInfo: e.target.value })}
                helperText="Warranty terms for completed work"
              />
            </Stack>
          </TabPanel>
        </Paper>

        {/* Bottom Save Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            size="large"
          >
            Save Changes
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
