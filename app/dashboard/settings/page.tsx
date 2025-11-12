"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import {
  Box, Card, Typography, Tabs, Tab, TextField, MenuItem, Button, Divider,
  List, ListItem, ListItemText, ListItemIcon, Switch, Grid, Paper, IconButton,
  Accordion, AccordionSummary, AccordionDetails, Chip, Alert, InputAdornment,
} from '@mui/material';
import {
  Business as BusinessIcon, AttachMoney as MoneyIcon, People as PeopleIcon,
  Construction as EquipmentIcon, Assignment as ProjectIcon, Notifications as NotifyIcon,
  Settings as SystemIcon, ExpandMore as ExpandIcon, Save as SaveIcon,
  RestartAlt as ResetIcon, Edit as EditIcon, Add as AddIcon,
} from '@mui/icons-material';

type SettingsTab = 'company' | 'financial' | 'employee' | 'equipment' | 'operations' | 'notifications';

export default function SettingsPage() {
  return (
    <ConvexAuthGuard>
      <SettingsPageContent />
    </ConvexAuthGuard>
  );
}

function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [hasChanges, setHasChanges] = useState(false);

  // Company Settings State
  const [companySettings, setCompanySettings] = useState({
    legalName: 'TreeShop Operations LLC',
    dbaName: 'TreeShop',
    ein: '12-3456789',
    yearEstablished: '2024',
    businessStructure: 'LLC',
    mainPhone: '(555) 123-4567',
    mainEmail: 'info@treeshop.app',
    website: 'https://treeshop.app',
    address: '123 Main St, New Smyrna Beach, FL 32168',
    businessHoursStart: '07:00',
    businessHoursEnd: '18:00',
    emergencyPhone: '(555) 123-TREE',
  });

  // Financial Settings State
  const [financialSettings, setFinancialSettings] = useState({
    burdenMultiplier: 1.7,
    defaultMargin: 50,
    salesTaxRate: 7.0,
    paymentTerms: 'Net 30',
    depositRequirement: 25,
    lateFeePercent: 1.5,
    creditCardFee: 2.9,
    overtimeMultiplier: 1.5,
    weekendMultiplier: 1.25,
    emergencyMultiplier: 1.5,
    monthlyOverhead: 15000,
  });

  // Employee Settings State
  const [employeeSettings, setEmployeeSettings] = useState({
    tierMultipliers: {
      tier1: 1.0,
      tier2: 1.6,
      tier3: 1.8,
      tier4: 2.0,
      tier5: 2.2,
    },
    leadershipPremiums: {
      teamLeader: 2,
      supervisor: 3,
      manager: 5,
      director: 6,
      chief: 7,
    },
    equipmentPremiums: {
      e1: 1,
      e2: 2,
      e3: 4,
      e4: 6,
    },
    driverPremiums: {
      d1: 1,
      d2: 3,
      d3: 5,
      dh: 2,
    },
    certificationPremiums: {
      isa: 3,
      cra: 4,
      tra: 2,
      osh: 2,
      pes: 3,
      cpr: 1,
    },
    ptoAccrualRate: 0.0385, // ~10 days/year
    sickLeaveAccrualRate: 0.0308, // ~8 days/year
    reviewFrequency: 'Annual',
  });

  // Equipment Settings State
  const [equipmentSettings, setEqumentSettings] = useState({
    maintenanceAlertDays: 7,
    fuelPricePerGallon: 3.75,
    defaultUsefulLife: 7,
    defaultAnnualHours: 2000,
    depreciationMethod: 'Straight Line',
    gpsTrackingEnabled: true,
    dailyInspectionRequired: true,
  });

  // Operations Settings State
  const [operationsSettings, setOperationsSettings] = useState({
    minimumJobCharge: 350,
    travelFeePerMile: 2.50,
    travelFeeRadius: 25,
    quoteValidityDays: 30,
    defaultProductionRate: 1.5, // Inch-acres per hour
    stumpGrindingRate: 400, // Points per hour
    leadResponseTimeHours: 4,
    autoConvertApprovedQuotes: true,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    newLeadAlert: true,
    quoteApprovedAlert: true,
    paymentReceivedAlert: true,
    maintenanceDueAlert: true,
    certExpirationDays: 30,
    invoiceOverdueAlert: true,
    dailyDigest: true,
    weeklyReport: true,
  });

  const handleSave = () => {
    console.log('Saving settings...', {
      companySettings,
      financialSettings,
      employeeSettings,
      equipmentSettings,
      operationsSettings,
      notificationSettings,
    });
    // TODO: Save to Convex
    setHasChanges(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      // Reset to defaults
      setHasChanges(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000000', color: '#ffffff', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#ffffff' }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#8e8e93', mt: 0.5 }}>
            Configure your TreeShop system preferences
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            disabled={!hasChanges}
            sx={{
              color: '#8e8e93',
              borderColor: '#2c2c2e',
              '&:hover': { borderColor: '#007AFF', color: '#007AFF' },
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges}
            sx={{
              bgcolor: '#007AFF',
              color: '#ffffff',
              '&:hover': { bgcolor: '#0051D5' },
              '&:disabled': { bgcolor: '#1c1c1e', color: '#8e8e93' },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Unsaved Changes Alert */}
      {hasChanges && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            bgcolor: '#2c2c2e',
            color: '#ffffff',
            border: '1px solid #FF9500',
            '& .MuiAlert-icon': { color: '#FF9500' },
          }}
        >
          You have unsaved changes. Click "Save Changes" to persist your updates.
        </Alert>
      )}

      {/* Tab Navigation */}
      <Paper sx={{ bgcolor: '#1c1c1e', mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': { color: '#8e8e93', textTransform: 'none', fontSize: '0.95rem' },
            '& .Mui-selected': { color: '#007AFF !important' },
            '& .MuiTabs-indicator': { bgcolor: '#007AFF' },
          }}
        >
          <Tab icon={<BusinessIcon />} label="Company" value="company" iconPosition="start" />
          <Tab icon={<MoneyIcon />} label="Financial" value="financial" iconPosition="start" />
          <Tab icon={<PeopleIcon />} label="Employee" value="employee" iconPosition="start" />
          <Tab icon={<EquipmentIcon />} label="Equipment" value="equipment" iconPosition="start" />
          <Tab icon={<ProjectIcon />} label="Operations" value="operations" iconPosition="start" />
          <Tab icon={<NotifyIcon />} label="Notifications" value="notifications" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 'company' && (
          <CompanySettings
            settings={companySettings}
            onChange={(updates) => {
              setCompanySettings({ ...companySettings, ...updates });
              setHasChanges(true);
            }}
          />
        )}
        {activeTab === 'financial' && (
          <FinancialSettings
            settings={financialSettings}
            onChange={(updates) => {
              setFinancialSettings({ ...financialSettings, ...updates });
              setHasChanges(true);
            }}
          />
        )}
        {activeTab === 'employee' && (
          <EmployeeSettings
            settings={employeeSettings}
            onChange={(updates) => {
              setEmployeeSettings({ ...employeeSettings, ...updates });
              setHasChanges(true);
            }}
          />
        )}
        {activeTab === 'equipment' && (
          <EquipmentSettings
            settings={equipmentSettings}
            onChange={(updates) => {
              setEqumentSettings({ ...equipmentSettings, ...updates });
              setHasChanges(true);
            }}
          />
        )}
        {activeTab === 'operations' && (
          <OperationsSettings
            settings={operationsSettings}
            onChange={(updates) => {
              setOperationsSettings({ ...operationsSettings, ...updates });
              setHasChanges(true);
            }}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationSettings
            settings={notificationSettings}
            onChange={(updates) => {
              setNotificationSettings({ ...notificationSettings, ...updates });
              setHasChanges(true);
            }}
          />
        )}
      </Box>
    </Box>
  );
}

// ===================== COMPANY SETTINGS =====================
function CompanySettings({ settings, onChange }: any) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Business Profile</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Legal Name"
                value={settings.legalName}
                onChange={(e) => onChange({ legalName: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="DBA Name"
                value={settings.dbaName}
                onChange={(e) => onChange({ dbaName: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="EIN / Tax ID"
                value={settings.ein}
                onChange={(e) => onChange({ ein: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Year Established"
                value={settings.yearEstablished}
                onChange={(e) => onChange({ yearEstablished: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Business Structure"
                value={settings.businessStructure}
                onChange={(e) => onChange({ businessStructure: e.target.value })}
                sx={textFieldStyle}
              >
                <MenuItem value="Sole Proprietorship">Sole Proprietorship</MenuItem>
                <MenuItem value="Partnership">Partnership</MenuItem>
                <MenuItem value="LLC">LLC</MenuItem>
                <MenuItem value="S-Corp">S-Corp</MenuItem>
                <MenuItem value="C-Corp">C-Corp</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Contact Information</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Phone"
                value={settings.mainPhone}
                onChange={(e) => onChange({ mainPhone: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Phone"
                value={settings.emergencyPhone}
                onChange={(e) => onChange({ emergencyPhone: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Email"
                type="email"
                value={settings.mainEmail}
                onChange={(e) => onChange({ mainEmail: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={settings.website}
                onChange={(e) => onChange({ website: e.target.value })}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BusinessIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Business Hours</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Address"
                value={settings.address}
                onChange={(e) => onChange({ address: e.target.value })}
                sx={textFieldStyle}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Open Time"
                type="time"
                value={settings.businessHoursStart}
                onChange={(e) => onChange({ businessHoursStart: e.target.value })}
                sx={textFieldStyle}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Close Time"
                type="time"
                value={settings.businessHoursEnd}
                onChange={(e) => onChange({ businessHoursEnd: e.target.value })}
                sx={textFieldStyle}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ===================== FINANCIAL SETTINGS =====================
function FinancialSettings({ settings, onChange }: any) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MoneyIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Rates & Multipliers</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee Burden Multiplier"
                type="number"
                value={settings.burdenMultiplier}
                onChange={(e) => onChange({ burdenMultiplier: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">x</InputAdornment>,
                  inputProps: { step: 0.1, min: 1.0, max: 3.0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Profit Margin"
                type="number"
                value={settings.defaultMargin}
                onChange={(e) => onChange({ defaultMargin: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { step: 5, min: 0, max: 100 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Overtime Rate"
                type="number"
                value={settings.overtimeMultiplier}
                onChange={(e) => onChange({ overtimeMultiplier: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">x</InputAdornment>,
                  inputProps: { step: 0.1, min: 1.0, max: 3.0 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weekend Rate"
                type="number"
                value={settings.weekendMultiplier}
                onChange={(e) => onChange({ weekendMultiplier: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">x</InputAdornment>,
                  inputProps: { step: 0.1, min: 1.0, max: 3.0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Response Rate"
                type="number"
                value={settings.emergencyMultiplier}
                onChange={(e) => onChange({ emergencyMultiplier: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">x</InputAdornment>,
                  inputProps: { step: 0.1, min: 1.0, max: 3.0 }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MoneyIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Payment Terms</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Default Payment Terms"
                value={settings.paymentTerms}
                onChange={(e) => onChange({ paymentTerms: e.target.value })}
                sx={textFieldStyle}
              >
                <MenuItem value="Due on Receipt">Due on Receipt</MenuItem>
                <MenuItem value="Net 15">Net 15</MenuItem>
                <MenuItem value="Net 30">Net 30</MenuItem>
                <MenuItem value="Net 60">Net 60</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Deposit Requirement"
                type="number"
                value={settings.depositRequirement}
                onChange={(e) => onChange({ depositRequirement: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { step: 5, min: 0, max: 100 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Late Fee Rate"
                type="number"
                value={settings.lateFeePercent}
                onChange={(e) => onChange({ lateFeePercent: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%/mo</InputAdornment>,
                  inputProps: { step: 0.5, min: 0, max: 10 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Credit Card Fee"
                type="number"
                value={settings.creditCardFee}
                onChange={(e) => onChange({ creditCardFee: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { step: 0.1, min: 0, max: 10 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Sales Tax Rate"
                type="number"
                value={settings.salesTaxRate}
                onChange={(e) => onChange({ salesTaxRate: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { step: 0.1, min: 0, max: 20 }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MoneyIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Overhead Costs</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Fixed Overhead"
                type="number"
                value={settings.monthlyOverhead}
                onChange={(e) => onChange({ monthlyOverhead: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { step: 1000, min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: '#2c2c2e', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#8e8e93', mb: 0.5 }}>
                  Annual Overhead
                </Typography>
                <Typography variant="h5" sx={{ color: '#007AFF' }}>
                  ${(settings.monthlyOverhead * 12).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ===================== EMPLOYEE SETTINGS =====================
function EmployeeSettings({ settings, onChange }: any) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Tier Multipliers</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((tier) => (
              <Grid item xs={12} sm={6} md={2.4} key={tier}>
                <TextField
                  fullWidth
                  label={`Tier ${tier}`}
                  type="number"
                  value={settings.tierMultipliers[`tier${tier}`]}
                  onChange={(e) => onChange({
                    tierMultipliers: {
                      ...settings.tierMultipliers,
                      [`tier${tier}`]: parseFloat(e.target.value)
                    }
                  })}
                  sx={textFieldStyle}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">x</InputAdornment>,
                    inputProps: { step: 0.1, min: 1.0, max: 3.0 }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Leadership Premiums</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Team Leader (+L)"
                type="number"
                value={settings.leadershipPremiums.teamLeader}
                onChange={(e) => onChange({
                  leadershipPremiums: { ...settings.leadershipPremiums, teamLeader: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Supervisor (+S)"
                type="number"
                value={settings.leadershipPremiums.supervisor}
                onChange={(e) => onChange({
                  leadershipPremiums: { ...settings.leadershipPremiums, supervisor: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manager (+M)"
                type="number"
                value={settings.leadershipPremiums.manager}
                onChange={(e) => onChange({
                  leadershipPremiums: { ...settings.leadershipPremiums, manager: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Equipment Premiums</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Basic (+E1)"
                type="number"
                value={settings.equipmentPremiums.e1}
                onChange={(e) => onChange({
                  equipmentPremiums: { ...settings.equipmentPremiums, e1: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Intermediate (+E2)"
                type="number"
                value={settings.equipmentPremiums.e2}
                onChange={(e) => onChange({
                  equipmentPremiums: { ...settings.equipmentPremiums, e2: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Advanced (+E3)"
                type="number"
                value={settings.equipmentPremiums.e3}
                onChange={(e) => onChange({
                  equipmentPremiums: { ...settings.equipmentPremiums, e3: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Specialized (+E4)"
                type="number"
                value={settings.equipmentPremiums.e4}
                onChange={(e) => onChange({
                  equipmentPremiums: { ...settings.equipmentPremiums, e4: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Certification Premiums</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="ISA Arborist"
                type="number"
                value={settings.certificationPremiums.isa}
                onChange={(e) => onChange({
                  certificationPremiums: { ...settings.certificationPremiums, isa: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Crane Certified"
                type="number"
                value={settings.certificationPremiums.cra}
                onChange={(e) => onChange({
                  certificationPremiums: { ...settings.certificationPremiums, cra: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="OSHA Safety"
                type="number"
                value={settings.certificationPremiums.osh}
                onChange={(e) => onChange({
                  certificationPremiums: { ...settings.certificationPremiums, osh: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CPR/First Aid"
                type="number"
                value={settings.certificationPremiums.cpr}
                onChange={(e) => onChange({
                  certificationPremiums: { ...settings.certificationPremiums, cpr: parseFloat(e.target.value) }
                })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Benefits & Time Off</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="PTO Accrual Rate"
                type="number"
                value={settings.ptoAccrualRate}
                onChange={(e) => onChange({ ptoAccrualRate: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  inputProps: { step: 0.001, min: 0, max: 0.1 }
                }}
                helperText={`~${(settings.ptoAccrualRate * 2080).toFixed(1)} days per year`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sick Leave Accrual Rate"
                type="number"
                value={settings.sickLeaveAccrualRate}
                onChange={(e) => onChange({ sickLeaveAccrualRate: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  inputProps: { step: 0.001, min: 0, max: 0.1 }
                }}
                helperText={`~${(settings.sickLeaveAccrualRate * 2080).toFixed(1)} days per year`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Review Frequency"
                value={settings.reviewFrequency}
                onChange={(e) => onChange({ reviewFrequency: e.target.value })}
                sx={textFieldStyle}
              >
                <MenuItem value="Quarterly">Quarterly</MenuItem>
                <MenuItem value="Semi-Annual">Semi-Annual</MenuItem>
                <MenuItem value="Annual">Annual</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ===================== EQUIPMENT SETTINGS =====================
function EquipmentSettings({ settings, onChange }: any) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EquipmentIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Equipment Defaults</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Useful Life"
                type="number"
                value={settings.defaultUsefulLife}
                onChange={(e) => onChange({ defaultUsefulLife: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">years</InputAdornment>,
                  inputProps: { step: 1, min: 1, max: 20 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Annual Hours"
                type="number"
                value={settings.defaultAnnualHours}
                onChange={(e) => onChange({ defaultAnnualHours: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                  inputProps: { step: 100, min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Depreciation Method"
                value={settings.depreciationMethod}
                onChange={(e) => onChange({ depreciationMethod: e.target.value })}
                sx={textFieldStyle}
              >
                <MenuItem value="Straight Line">Straight Line</MenuItem>
                <MenuItem value="Declining Balance">Declining Balance</MenuItem>
                <MenuItem value="Units of Production">Units of Production</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fuel Price per Gallon"
                type="number"
                value={settings.fuelPricePerGallon}
                onChange={(e) => onChange({ fuelPricePerGallon: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { step: 0.1, min: 0 }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EquipmentIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Maintenance & Tracking</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Maintenance Alert Lead Time"
                type="number"
                value={settings.maintenanceAlertDays}
                onChange={(e) => onChange({ maintenanceAlertDays: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  inputProps: { step: 1, min: 1, max: 30 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="GPS Tracking Enabled"
                    secondary="Track equipment location in real-time"
                    primaryTypographyProps={{ color: '#ffffff' }}
                    secondaryTypographyProps={{ color: '#8e8e93' }}
                  />
                  <Switch
                    checked={settings.gpsTrackingEnabled}
                    onChange={(e) => onChange({ gpsTrackingEnabled: e.target.checked })}
                    sx={switchStyle}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Daily Inspection Required"
                    secondary="Require pre-use inspection before operation"
                    primaryTypographyProps={{ color: '#ffffff' }}
                    secondaryTypographyProps={{ color: '#8e8e93' }}
                  />
                  <Switch
                    checked={settings.dailyInspectionRequired}
                    onChange={(e) => onChange({ dailyInspectionRequired: e.target.checked })}
                    sx={switchStyle}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ===================== OPERATIONS SETTINGS =====================
function OperationsSettings({ settings, onChange }: any) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ProjectIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Pricing & Fees</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Minimum Job Charge"
                type="number"
                value={settings.minimumJobCharge}
                onChange={(e) => onChange({ minimumJobCharge: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { step: 50, min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Travel Fee per Mile"
                type="number"
                value={settings.travelFeePerMile}
                onChange={(e) => onChange({ travelFeePerMile: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { step: 0.5, min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Free Travel Radius"
                type="number"
                value={settings.travelFeeRadius}
                onChange={(e) => onChange({ travelFeeRadius: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">miles</InputAdornment>,
                  inputProps: { step: 5, min: 0 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quote Validity Period"
                type="number"
                value={settings.quoteValidityDays}
                onChange={(e) => onChange({ quoteValidityDays: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  inputProps: { step: 5, min: 1 }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ProjectIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Production Rates</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Forestry Mulching Rate"
                type="number"
                value={settings.defaultProductionRate}
                onChange={(e) => onChange({ defaultProductionRate: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">IA/hr</InputAdornment>,
                  inputProps: { step: 0.1, min: 0 }
                }}
                helperText="Inch-Acres per Hour"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stump Grinding Rate"
                type="number"
                value={settings.stumpGrindingRate}
                onChange={(e) => onChange({ stumpGrindingRate: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">pts/hr</InputAdornment>,
                  inputProps: { step: 50, min: 0 }
                }}
                helperText="StumpScore Points per Hour"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lead Response Time Target"
                type="number"
                value={settings.leadResponseTimeHours}
                onChange={(e) => onChange({ leadResponseTimeHours: parseFloat(e.target.value) })}
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                  inputProps: { step: 1, min: 1 }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ProjectIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Workflow Automation</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Auto-Convert Approved Quotes"
                secondary="Automatically convert approved quotes to work orders"
                primaryTypographyProps={{ color: '#ffffff' }}
                secondaryTypographyProps={{ color: '#8e8e93' }}
              />
              <Switch
                checked={settings.autoConvertApprovedQuotes}
                onChange={(e) => onChange({ autoConvertApprovedQuotes: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ===================== NOTIFICATION SETTINGS =====================
function NotificationSettings({ settings, onChange }: any) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotifyIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Delivery Methods</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Email Notifications"
                secondary="Receive alerts via email"
                primaryTypographyProps={{ color: '#ffffff' }}
                secondaryTypographyProps={{ color: '#8e8e93' }}
              />
              <Switch
                checked={settings.emailEnabled}
                onChange={(e) => onChange({ emailEnabled: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="SMS Notifications"
                secondary="Receive alerts via text message"
                primaryTypographyProps={{ color: '#ffffff' }}
                secondaryTypographyProps={{ color: '#8e8e93' }}
              />
              <Switch
                checked={settings.smsEnabled}
                onChange={(e) => onChange({ smsEnabled: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotifyIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Business Alerts</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="New Lead Alerts"
                primaryTypographyProps={{ color: '#ffffff' }}
              />
              <Switch
                checked={settings.newLeadAlert}
                onChange={(e) => onChange({ newLeadAlert: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Quote Approved Alerts"
                primaryTypographyProps={{ color: '#ffffff' }}
              />
              <Switch
                checked={settings.quoteApprovedAlert}
                onChange={(e) => onChange({ quoteApprovedAlert: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Payment Received Alerts"
                primaryTypographyProps={{ color: '#ffffff' }}
              />
              <Switch
                checked={settings.paymentReceivedAlert}
                onChange={(e) => onChange({ paymentReceivedAlert: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Invoice Overdue Alerts"
                primaryTypographyProps={{ color: '#ffffff' }}
              />
              <Switch
                checked={settings.invoiceOverdueAlert}
                onChange={(e) => onChange({ invoiceOverdueAlert: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotifyIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Equipment Alerts</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Maintenance Due Alerts"
                primaryTypographyProps={{ color: '#ffffff' }}
              />
              <Switch
                checked={settings.maintenanceDueAlert}
                onChange={(e) => onChange({ maintenanceDueAlert: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
          </List>
          <TextField
            fullWidth
            label="Certification Expiration Alert"
            type="number"
            value={settings.certExpirationDays}
            onChange={(e) => onChange({ certExpirationDays: parseFloat(e.target.value) })}
            sx={textFieldStyle}
            InputProps={{
              endAdornment: <InputAdornment position="end">days before</InputAdornment>,
              inputProps: { step: 5, min: 1 }
            }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, bgcolor: '#1c1c1e', border: '1px solid #2c2c2e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotifyIcon sx={{ mr: 1, color: '#007AFF' }} />
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Digest Reports</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: '#2c2c2e' }} />
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Daily Digest"
                secondary="Summary of today's activity"
                primaryTypographyProps={{ color: '#ffffff' }}
                secondaryTypographyProps={{ color: '#8e8e93' }}
              />
              <Switch
                checked={settings.dailyDigest}
                onChange={(e) => onChange({ dailyDigest: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemText
                primary="Weekly Report"
                secondary="Summary of this week's performance"
                primaryTypographyProps={{ color: '#ffffff' }}
                secondaryTypographyProps={{ color: '#8e8e93' }}
              />
              <Switch
                checked={settings.weeklyReport}
                onChange={(e) => onChange({ weeklyReport: e.target.checked })}
                sx={switchStyle}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ===================== STYLES =====================
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: '#ffffff',
    bgcolor: '#000000',
    '& fieldset': { borderColor: '#2c2c2e' },
    '&:hover fieldset': { borderColor: '#007AFF' },
    '&.Mui-focused fieldset': { borderColor: '#007AFF' },
  },
  '& .MuiInputLabel-root': { color: '#8e8e93' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#007AFF' },
  '& .MuiFormHelperText-root': { color: '#8e8e93' },
};

const switchStyle = {
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#007AFF',
    '& + .MuiSwitch-track': { bgcolor: '#007AFF' },
  },
  '& .MuiSwitch-track': { bgcolor: '#2c2c2e' },
};
