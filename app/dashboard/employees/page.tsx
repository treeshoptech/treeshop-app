"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box, Card, CardContent, CardActions, Typography, Button, IconButton, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Fab,
  InputAdornment, Tabs, Tab, Divider, List, ListItem, ListItemText, Avatar, Paper,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemIcon, Slider, Alert,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon,
  Search as SearchIcon, Close as CloseIcon, Badge as BadgeIcon, School as SchoolIcon,
  DirectionsCar as CarIcon, Build as EquipmentIcon, EmojiEvents as AwardIcon,
  TrendingUp as ProgressIcon, Assignment as AssignmentIcon, AttachMoney as MoneyIcon,
} from '@mui/icons-material';

const CAREER_TRACKS = {
  'Field Operations': ['ATC', 'TRS', 'FOR', 'LCL', 'MUL', 'STG', 'ESR', 'LSC'],
  'Equipment & Maintenance': ['EQO', 'MNT'],
  'Business Operations': ['SAL', 'PMC', 'ADM', 'FIN', 'SAF', 'TEC'],
};

const TRACK_NAMES = {
  ATC: 'Arboriculture & Tree Care', TRS: 'Tree Removal & Rigging', FOR: 'Forestry & Land Management',
  LCL: 'Land Clearing & Excavation', MUL: 'Mulching & Material Processing', STG: 'Stump Grinding & Site Restoration',
  ESR: 'Emergency & Storm Response', LSC: 'Landscaping & Grounds', EQO: 'Equipment Operations',
  MNT: 'Maintenance & Repair', SAL: 'Sales & Business Development', PMC: 'Project Management & Coordination',
  ADM: 'Administrative & Office Operations', FIN: 'Financial & Accounting', SAF: 'Safety & Compliance',
  TEC: 'Technology & Systems',
};

const TIER_LEVELS = [
  { value: 1, label: 'Tier 1 - Entry Level', multiplier: 1.0, exp: '0-6 months' },
  { value: 2, label: 'Tier 2 - Developing', multiplier: 1.6, exp: '6-18 months' },
  { value: 3, label: 'Tier 3 - Competent', multiplier: 1.8, exp: '18 months-3 years' },
  { value: 4, label: 'Tier 4 - Advanced', multiplier: 2.0, exp: '3-5 years' },
  { value: 5, label: 'Tier 5 - Master', multiplier: 2.2, exp: '5+ years' },
];

const LEADERSHIP_LEVELS = [
  { code: 'L', label: 'Team Leader', premium: 2 },
  { code: 'S', label: 'Supervisor', premium: 3 },
  { code: 'M', label: 'Manager', premium: 5 },
  { code: 'D', label: 'Director', premium: 6 },
  { code: 'C', label: 'Chief/Executive', premium: 7 },
];

const EQUIPMENT_LEVELS = [
  { code: 'E1', label: 'Basic Equipment', premium: 0.5, desc: 'Hand tools, chainsaws' },
  { code: 'E2', label: 'Intermediate Machinery', premium: 2, desc: 'Chippers, stump grinders' },
  { code: 'E3', label: 'Advanced Equipment', premium: 4, desc: 'Cranes, bucket trucks' },
  { code: 'E4', label: 'Specialized Equipment', premium: 7, desc: 'Forestry mulchers' },
];

const DRIVER_LICENSES = [
  { code: 'D1', label: 'Standard License', premium: 0.5 },
  { code: 'D2', label: 'CDL Class B', premium: 2 },
  { code: 'D3', label: 'CDL Class A', premium: 3 },
  { code: 'DH', label: 'Hazmat Endorsement', premium: 1 },
];

const CERTIFICATIONS = [
  { code: 'ISA', label: 'ISA Certified Arborist', premium: 4 },
  { code: 'CRA', label: 'Crane Certified', premium: 3 },
  { code: 'TRA', label: 'Trainer Certified', premium: 2 },
  { code: 'OSH', label: 'OSHA Safety', premium: 1 },
  { code: 'PES', label: 'Pesticide License', premium: 2 },
  { code: 'CPR', label: 'First Aid/CPR', premium: 0.5 },
];

const EMPLOYMENT_STATUS = [
  { value: 'Active', color: '#34C759' },
  { value: 'On Leave', color: '#FF9500' },
  { value: 'Inactive', color: '#8E8E93' },
];

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return <div role="tabpanel" hidden={value !== index} {...other}>{value === index && <Box sx={{ py: 2 }}>{children}</Box>}</div>;
}

function EmployeesPageContent() {
  const employees = useQuery(api.employees.list);
  const createEmployee = useMutation(api.employees.create);
  const updateEmployee = useMutation(api.employees.update);
  const deleteEmployee = useMutation(api.employees.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"employees"> | null>(null);
  const [selectedId, setSelectedId] = useState<Id<"employees"> | null>(null);
  const [formTab, setFormTab] = useState(0);
  const [detailTab, setDetailTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    // Personal
    firstName: '', lastName: '', preferredName: '', email: '', phone: '', phoneSecondary: '',
    dateOfBirth: Date.now(), address: '', emergencyContactName: '', emergencyContactPhone: '',
    // Employment
    hireDate: Date.now(), employeeId: '', employmentType: 'Full-Time', employmentStatus: 'Active',
    homeBranch: '', reportsTo: '',
    // Career Track
    primaryTrack: 'ATC', tier: 1, yearsExperience: 0,
    // Add-ons
    leadership: '', equipmentCerts: [] as string[], driverLicenses: [] as string[], certifications: [] as string[],
    // Compensation
    baseHourlyRate: 0,
    // Skills
    notes: '',
  });

  const selectedEmployee = employees?.find(e => e._id === selectedId);

  const calculateCompensation = (data: typeof formData) => {
    const tierMultiplier = TIER_LEVELS.find(t => t.value === data.tier)?.multiplier || 1.0;
    const baseTiered = data.baseHourlyRate * tierMultiplier;
    const leadershipPremium = LEADERSHIP_LEVELS.find(l => l.code === data.leadership)?.premium || 0;
    const equipmentPremium = data.equipmentCerts.reduce((sum, code) => 
      sum + (EQUIPMENT_LEVELS.find(e => e.code === code)?.premium || 0), 0);
    const driverPremium = data.driverLicenses.reduce((sum, code) =>
      sum + (DRIVER_LICENSES.find(d => d.code === code)?.premium || 0), 0);
    const certPremium = data.certifications.reduce((sum, code) =>
      sum + (CERTIFICATIONS.find(c => c.code === code)?.premium || 0), 0);
    const totalHourly = baseTiered + leadershipPremium + equipmentPremium + driverPremium + certPremium;
    const trueCost = totalHourly * 1.7; // Burden multiplier
    return { baseTiered, leadershipPremium, equipmentPremium, driverPremium, certPremium, totalHourly, trueCost };
  };

  const generateEmployeeCode = (data: typeof formData) => {
    let code = `${data.primaryTrack}${data.tier}`;
    if (data.leadership) code += `+${data.leadership}`;
    data.equipmentCerts.forEach(c => code += `+${c}`);
    data.driverLicenses.forEach(c => code += `+${c}`);
    data.certifications.forEach(c => code += `+${c}`);
    return code;
  };

  const filteredEmployees = employees?.filter(emp => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return fullName.includes(search) || (emp.email || '').toLowerCase().includes(search) ||
           (emp.employeeId || '').toLowerCase().includes(search) || (emp.primaryTrack || '').toLowerCase().includes(search);
  }) || [];

  const getInitials = (firstName: string, lastName: string) => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[name.charCodeAt(0) % colors.length];
  };
  const getStatusColor = (status: string) => EMPLOYMENT_STATUS.find(s => s.value === status)?.color || '#8E8E93';

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      firstName: '', lastName: '', preferredName: '', email: '', phone: '', phoneSecondary: '',
      dateOfBirth: Date.now(), address: '', emergencyContactName: '', emergencyContactPhone: '',
      hireDate: Date.now(), employeeId: '', employmentType: 'Full-Time', employmentStatus: 'Active',
      homeBranch: '', reportsTo: '', primaryTrack: 'ATC', tier: 1, yearsExperience: 0,
      leadership: '', equipmentCerts: [], driverLicenses: [], certifications: [], baseHourlyRate: 0, notes: '',
    });
    setFormTab(0);
    setFormOpen(true);
  };

  const handleEdit = (id: Id<"employees">) => {
    const emp = employees?.find(e => e._id === id);
    if (emp) {
      setEditingId(id);
      setFormData({
        firstName: emp.firstName, lastName: emp.lastName, preferredName: emp.preferredName || '',
        email: emp.email || '', phone: emp.phone || '', phoneSecondary: emp.phoneSecondary || '',
        dateOfBirth: emp.dateOfBirth || Date.now(), address: emp.address || '',
        emergencyContactName: emp.emergencyContactName || '', emergencyContactPhone: emp.emergencyContactPhone || '',
        hireDate: emp.hireDate || Date.now(), employeeId: emp.employeeId || '',
        employmentType: emp.employmentType || 'Full-Time', employmentStatus: emp.employmentStatus || 'Active',
        homeBranch: emp.homeBranch || '', reportsTo: emp.reportsTo || '',
        primaryTrack: emp.primaryTrack || 'ATC', tier: emp.tier || 1, yearsExperience: emp.yearsExperience || 0,
        leadership: emp.leadership || '', equipmentCerts: emp.equipmentCerts || [],
        driverLicenses: emp.driverLicenses || [], certifications: emp.certifications || [],
        baseHourlyRate: emp.baseHourlyRate || 0, notes: emp.notes || '',
      });
      setFormTab(0);
      setFormOpen(true);
    }
  };

  const handleDelete = async (id: Id<"employees">) => {
    if (confirm('Delete this employee?')) {
      await deleteEmployee({ id });
      if (selectedId === id) { setDetailOpen(false); setSelectedId(null); }
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.baseHourlyRate) {
      alert('Please fill required fields (Name and Base Rate)');
      return;
    }
    if (editingId) {
      await updateEmployee({ id: editingId, ...formData });
    } else {
      await createEmployee(formData);
    }
    setFormOpen(false);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}><Typography variant="h4" sx={{ fontWeight: 600 }}>Employees</Typography></Box>

      <TextField fullWidth placeholder="Search employees by name, email, ID, or track..." value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          endAdornment: searchQuery && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><CloseIcon /></IconButton></InputAdornment>,
        }} />

      {employees === undefined ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">Loading...</Typography></Box>
      ) : filteredEmployees.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>{searchQuery ? 'No employees found' : 'No employees yet'}</Typography>
          {!searchQuery && <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Employee</Button>}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredEmployees.map((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            const comp = calculateCompensation(emp);
            const code = generateEmployeeCode(emp);
            return (
              <Grid item xs={12} sm={6} md={4} key={emp._id}>
                <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
                  onClick={() => { setSelectedId(emp._id); setDetailOpen(true); setDetailTab(0); }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Avatar sx={{ bgcolor: getAvatarColor(fullName), mr: 2, width: 56, height: 56, fontSize: '1.25rem', fontWeight: 600 }}>
                        {getInitials(emp.firstName, emp.lastName)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>{fullName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{TRACK_NAMES[emp.primaryTrack as keyof typeof TRACK_NAMES]}</Typography>
                        <Chip label={emp.employmentStatus} size="small" sx={{ bgcolor: getStatusColor(emp.employmentStatus), color: '#FFF', fontWeight: 500, height: 20, fontSize: '0.7rem' }} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Code</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{code}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Tier</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Tier {emp.tier}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Hourly Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#007AFF' }}>${comp.totalHourly.toFixed(2)}/hr</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">True Cost</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>${comp.trueCost.toFixed(2)}/hr</Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(emp._id); }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(emp._id); }}><DeleteIcon fontSize="small" /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={handleAdd}><AddIcon /></Fab>

      {/* FORM DIALOG */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { backgroundColor: '#000000', border: '1px solid #2C2C2E' } }}>
        <DialogTitle sx={{ bgcolor: '#1C1C1E' }}>{editingId ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        
        <Tabs value={formTab} onChange={(_, v) => setFormTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: '#1C1C1E' }}>
          <Tab icon={<PersonIcon />} label="Personal" iconPosition="start" />
          <Tab icon={<BadgeIcon />} label="Career Track" iconPosition="start" />
          <Tab icon={<AwardIcon />} label="Add-ons" iconPosition="start" />
          <Tab icon={<MoneyIcon />} label="Compensation" iconPosition="start" />
        </Tabs>

        <DialogContent sx={{ minHeight: 500, bgcolor: '#000000' }}>
          <TabPanel value={formTab} index={0}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><PersonIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Information</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={4}><TextField fullWidth label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></Grid>
                <Grid item xs={4}><TextField fullWidth label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></Grid>
                <Grid item xs={4}><TextField fullWidth label="Preferred Name" value={formData.preferredName} onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth type="email" label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="Secondary Phone" value={formData.phoneSecondary} onChange={(e) => setFormData({ ...formData, phoneSecondary: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><AssignmentIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Employment Details</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={3}><TextField fullWidth type="date" label="Hire Date" value={new Date(formData.hireDate).toISOString().split('T')[0]} onChange={(e) => setFormData({ ...formData, hireDate: new Date(e.target.value).getTime() })} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="Employee ID" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} placeholder="Auto-generated" /></Grid>
                <Grid item xs={3}><TextField fullWidth select label="Employment Type" value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}><MenuItem value="Full-Time">Full-Time</MenuItem><MenuItem value="Part-Time">Part-Time</MenuItem><MenuItem value="Seasonal">Seasonal</MenuItem><MenuItem value="Contractor">Contractor</MenuItem></TextField></Grid>
                <Grid item xs={3}><TextField fullWidth select label="Status" value={formData.employmentStatus} onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}>{EMPLOYMENT_STATUS.map(s => <MenuItem key={s.value} value={s.value}>{s.value}</MenuItem>)}</TextField></Grid>
                <Grid item xs={6}><TextField fullWidth label="Home Branch/Location" value={formData.homeBranch} onChange={(e) => setFormData({ ...formData, homeBranch: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Reports To" value={formData.reportsTo} onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })} placeholder="Manager/Supervisor name" /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={1}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><BadgeIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Primary Career Track</Typography></Box>
              {Object.entries(CAREER_TRACKS).map(([category, tracks]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{category}</Typography>
                  <Grid container spacing={1}>
                    {tracks.map(track => (
                      <Grid item xs={6} sm={4} md={3} key={track}>
                        <Button fullWidth variant={formData.primaryTrack === track ? 'contained' : 'outlined'}
                          onClick={() => setFormData({ ...formData, primaryTrack: track })}
                          sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1.5 }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{track}</Typography>
                            <Typography variant="caption" color="text.secondary">{TRACK_NAMES[track as keyof typeof TRACK_NAMES]}</Typography>
                          </Box>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><ProgressIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Tier Level</Typography></Box>
              <Grid container spacing={2}>
                {TIER_LEVELS.map(tier => (
                  <Grid item xs={12} sm={6} md={4} key={tier.value}>
                    <Button fullWidth variant={formData.tier === tier.value ? 'contained' : 'outlined'}
                      onClick={() => setFormData({ ...formData, tier: tier.value })}
                      sx={{ flexDirection: 'column', py: 2, alignItems: 'flex-start' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{tier.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{tier.exp}</Typography>
                      <Typography variant="caption" sx={{ mt: 0.5, color: '#007AFF' }}>Multiplier: {tier.multiplier}x</Typography>
                    </Button>
                  </Grid>
                ))}
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="Years of Experience" value={formData.yearsExperience} onChange={(e) => setFormData({ ...formData, yearsExperience: parseFloat(e.target.value) })} InputProps={{ endAdornment: <InputAdornment position="end">years</InputAdornment> }} />
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={2}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><AwardIcon sx={{ mr: 1, color: '#34C759' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Leadership</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><FormControl fullWidth><InputLabel>Leadership Level (Optional)</InputLabel><Select value={formData.leadership} onChange={(e) => setFormData({ ...formData, leadership: e.target.value })} label="Leadership Level"><MenuItem value="">None</MenuItem>{LEADERSHIP_LEVELS.map(l => <MenuItem key={l.code} value={l.code}>{l.label} (+${l.premium}/hr)</MenuItem>)}</Select></FormControl></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><EquipmentIcon sx={{ mr: 1, color: '#FF9500' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Equipment Certifications</Typography></Box>
              <Grid container spacing={1}>
                {EQUIPMENT_LEVELS.map(eq => (
                  <Grid item xs={12} sm={6} key={eq.code}>
                    <Box sx={{ p: 2, border: '1px solid #2C2C2E', borderRadius: 1, cursor: 'pointer', bgcolor: formData.equipmentCerts.includes(eq.code) ? '#007AFF22' : 'transparent', '&:hover': { borderColor: '#007AFF' } }}
                      onClick={() => setFormData({ ...formData, equipmentCerts: formData.equipmentCerts.includes(eq.code) ? formData.equipmentCerts.filter(c => c !== eq.code) : [...formData.equipmentCerts, eq.code] })}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Checkbox checked={formData.equipmentCerts.includes(eq.code)} sx={{ p: 0, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{eq.label} (+${eq.premium}/hr)</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">{eq.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><CarIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Driver Licenses</Typography></Box>
              <Grid container spacing={1}>
                {DRIVER_LICENSES.map(lic => (
                  <Grid item xs={12} sm={6} key={lic.code}>
                    <Box sx={{ p: 2, border: '1px solid #2C2C2E', borderRadius: 1, cursor: 'pointer', bgcolor: formData.driverLicenses.includes(lic.code) ? '#007AFF22' : 'transparent', '&:hover': { borderColor: '#007AFF' } }}
                      onClick={() => setFormData({ ...formData, driverLicenses: formData.driverLicenses.includes(lic.code) ? formData.driverLicenses.filter(c => c !== lic.code) : [...formData.driverLicenses, lic.code] })}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox checked={formData.driverLicenses.includes(lic.code)} sx={{ p: 0, mr: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{lic.label} (+${lic.premium}/hr)</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><SchoolIcon sx={{ mr: 1, color: '#34C759' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Professional Certifications</Typography></Box>
              <Grid container spacing={1}>
                {CERTIFICATIONS.map(cert => (
                  <Grid item xs={12} sm={6} md={4} key={cert.code}>
                    <Box sx={{ p: 2, border: '1px solid #2C2C2E', borderRadius: 1, cursor: 'pointer', bgcolor: formData.certifications.includes(cert.code) ? '#007AFF22' : 'transparent', '&:hover': { borderColor: '#007AFF' } }}
                      onClick={() => setFormData({ ...formData, certifications: formData.certifications.includes(cert.code) ? formData.certifications.filter(c => c !== cert.code) : [...formData.certifications, cert.code] })}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox checked={formData.certifications.includes(cert.code)} sx={{ p: 0, mr: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{cert.label} (+${cert.premium}/hr)</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={3}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><MoneyIcon sx={{ mr: 1, color: '#34C759' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Base Compensation</Typography></Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="number" label="Base Hourly Rate" value={formData.baseHourlyRate} onChange={(e) => setFormData({ ...formData, baseHourlyRate: parseFloat(e.target.value) })}
                    required InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, endAdornment: <InputAdornment position="end">/hr</InputAdornment> }} />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><MoneyIcon sx={{ mr: 1, color: '#007AFF' }} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Calculated Compensation</Typography></Box>
              {(() => {
                const comp = calculateCompensation(formData);
                return (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ bgcolor: '#2C2C2E' }}>
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>Total Hourly Rate</Typography>
                          <Typography variant="h4" sx={{ color: '#007AFF', fontWeight: 600 }}>${comp.totalHourly.toFixed(2)}/hr</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary">Base × Tier: ${comp.baseTiered.toFixed(2)}</Typography>
                          {comp.leadershipPremium > 0 && <Typography variant="body2" color="text.secondary">Leadership: +${comp.leadershipPremium.toFixed(2)}</Typography>}
                          {comp.equipmentPremium > 0 && <Typography variant="body2" color="text.secondary">Equipment: +${comp.equipmentPremium.toFixed(2)}</Typography>}
                          {comp.driverPremium > 0 && <Typography variant="body2" color="text.secondary">Driver: +${comp.driverPremium.toFixed(2)}</Typography>}
                          {comp.certPremium > 0 && <Typography variant="body2" color="text.secondary">Certifications: +${comp.certPremium.toFixed(2)}</Typography>}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{ bgcolor: '#2C2C2E' }}>
                        <CardContent>
                          <Typography color="text.secondary" gutterBottom>True Business Cost (1.7x)</Typography>
                          <Typography variant="h4" sx={{ color: '#34C759', fontWeight: 600 }}>${comp.trueCost.toFixed(2)}/hr</Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary">Annual: ${(comp.trueCost * 2080).toLocaleString()}</Typography>
                          <Typography variant="caption" color="text.secondary">Includes burden (taxes, insurance, benefits)</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info">Employee Code: <strong>{generateEmployeeCode(formData)}</strong></Alert>
                    </Grid>
                  </Grid>
                );
              })()}
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Notes</Typography>
              <TextField fullWidth multiline rows={4} label="Employee Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Skills, special assignments, career goals, etc." />
            </Paper>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, bgcolor: '#1C1C1E' }}>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.firstName || !formData.lastName || !formData.baseHourlyRate}>{editingId ? 'Save Changes' : 'Add Employee'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function EmployeesPage() {
  return (<ConvexAuthGuard><EmployeesPageContent /></ConvexAuthGuard>);
}
