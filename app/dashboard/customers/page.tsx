"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  ContactMail as ContactMailIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';

const CUSTOMER_SOURCES = ['Referral', 'Website', 'Google Search', 'Social Media', 'Repeat Customer', 'Door Hanger', 'Yard Sign', 'Vehicle Wrap', 'Other'];
const CUSTOMER_TYPES = ['Residential', 'Commercial', 'Municipal', 'HOA', 'Property Management', 'Real Estate'];
const CONTACT_METHODS = ['Phone', 'Email', 'Text', 'Any'];
const AVAILABLE_TAGS = ['VIP', 'Repeat Customer', 'High Value', 'Quick Pay', 'Difficult Access', 'Gated Community', 'Large Property', 'Preferred'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function CustomersPageContent() {
  const customers = useQuery(api.customers.list);
  const projects = useQuery(api.projects.listAll);
  const createCustomer = useMutation(api.customers.create);
  const updateCustomer = useMutation(api.customers.update);
  const deleteCustomer = useMutation(api.customers.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"customers"> | null>(null);
  const [selectedId, setSelectedId] = useState<Id<"customers"> | null>(null);
  const [formTab, setFormTab] = useState(0);
  const [detailTab, setDetailTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', secondaryPhone: '', company: '',
    propertyAddress: '', propertyCity: '', propertyState: 'FL', propertyZip: '',
    billingAddress: '', billingCity: '', billingState: 'FL', billingZip: '',
    source: 'Website', referredBy: '', customerType: 'Residential', preferredContactMethod: 'Phone',
    tags: [] as string[], notes: '',
  });

  const selectedCustomer = customers?.find(c => c._id === selectedId);
  const customerProjects = projects?.filter(p => p.customerId === selectedId) || [];

  const filteredCustomers = customers?.filter(customer => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return fullName.includes(search) || (customer.email || '').toLowerCase().includes(search) ||
           (customer.phone || '').toLowerCase().includes(search) || (customer.company || '').toLowerCase().includes(search) ||
           customer.propertyAddress.toLowerCase().includes(search);
  }) || [];

  const getInitials = (firstName: string, lastName: string) => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', secondaryPhone: '', company: '',
      propertyAddress: '', propertyCity: '', propertyState: 'FL', propertyZip: '',
      billingAddress: '', billingCity: '', billingState: 'FL', billingZip: '',
      source: 'Website', referredBy: '', customerType: 'Residential', preferredContactMethod: 'Phone',
      tags: [], notes: '' });
    setFormTab(0);
    setFormOpen(true);
  };

  const handleEdit = (id: Id<"customers">) => {
    const customer = customers?.find(c => c._id === id);
    if (customer) {
      setEditingId(id);
      setFormData({
        firstName: customer.firstName, lastName: customer.lastName, email: customer.email || '', phone: customer.phone || '',
        secondaryPhone: customer.secondaryPhone || '', company: customer.company || '',
        propertyAddress: customer.propertyAddress, propertyCity: customer.propertyCity || '',
        propertyState: customer.propertyState || 'FL', propertyZip: customer.propertyZip || '',
        billingAddress: customer.billingAddress || '', billingCity: customer.billingCity || '',
        billingState: customer.billingState || 'FL', billingZip: customer.billingZip || '',
        source: customer.source || 'Website', referredBy: customer.referredBy || '',
        customerType: customer.customerType || 'Residential', preferredContactMethod: customer.preferredContactMethod || 'Phone',
        tags: customer.tags || [], notes: customer.notes || ''
      });
      setFormTab(0);
      setFormOpen(true);
    }
  };

  const handleDelete = async (id: Id<"customers">) => {
    if (confirm('Delete this customer?')) {
      try {
        await deleteCustomer({ id });
        if (selectedId === id) { setDetailOpen(false); setSelectedId(null); }
      } catch (error: any) {
        alert(error.message || 'Failed to delete');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.propertyAddress) {
      alert('Please fill required fields');
      return;
    }
    if (editingId) {
      await updateCustomer({ id: editingId, ...formData });
    } else {
      await createCustomer(formData);
    }
    setFormOpen(false);
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Customers</Typography>
      </Box>

      <TextField fullWidth placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          endAdornment: searchQuery && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><CloseIcon /></IconButton></InputAdornment>,
        }} />

      {customers === undefined ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><Typography color="text.secondary">Loading...</Typography></Box>
      ) : filteredCustomers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>{searchQuery ? 'No customers found' : 'No customers yet'}</Typography>
          {!searchQuery && <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Customer</Button>}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredCustomers.map((customer) => {
            const custProjects = projects?.filter(p => p.customerId === customer._id) || [];
            const fullName = `${customer.firstName} ${customer.lastName}`;
            return (
              <Grid item xs={12} sm={6} md={4} key={customer._id}>
                <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
                  onClick={() => { setSelectedId(customer._id); setDetailOpen(true); setDetailTab(0); }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Avatar sx={{ bgcolor: getAvatarColor(fullName), mr: 2, width: 56, height: 56, fontSize: '1.25rem', fontWeight: 600 }}>{getInitials(customer.firstName, customer.lastName)}</Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>{fullName}</Typography>
                        {customer.company && <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{customer.company}</Typography>}
                        <Chip label={customer.customerType || 'Residential'} size="small" sx={{ bgcolor: '#007AFF', color: '#FFF', fontWeight: 500, height: 20, fontSize: '0.7rem' }} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    {customer.email && <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /><Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{customer.email}</Typography></Box>}
                    {customer.phone && <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /><Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{customer.phone}</Typography></Box>}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}><HomeIcon sx={{ fontSize: 16, mr: 1, mt: 0.3, color: 'text.secondary' }} /><Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{customer.propertyAddress}</Typography></Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box><Typography variant="caption" color="text.secondary">Projects</Typography><Typography variant="h6" sx={{ fontWeight: 600, color: '#007AFF' }}>{custProjects.length}</Typography></Box>
                      {customer.source && <Box sx={{ textAlign: 'right' }}><Typography variant="caption" color="text.secondary">Source</Typography><Typography variant="body2" sx={{ fontWeight: 500 }}>{customer.source}</Typography></Box>}
                    </Box>
                    {customer.tags && customer.tags.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {customer.tags.slice(0, 3).map((tag, i) => <Chip key={i} label={tag} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#2C2C2E' }} />)}
                        {customer.tags.length > 3 && <Chip label={`+${customer.tags.length - 3}`} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#2C2C2E' }} />}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(customer._id); }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(customer._id); }}><DeleteIcon fontSize="small" /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={handleAdd}><AddIcon /></Fab>

      {/* FORM DIALOG - TABBED */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E' } }}>
        <DialogTitle>{editingId ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        
        <Tabs value={formTab} onChange={(_, v) => setFormTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tab icon={<PersonIcon />} label="Contact" iconPosition="start" />
          <Tab icon={<HomeIcon />} label="Addresses" iconPosition="start" />
          <Tab icon={<TagIcon />} label="Details" iconPosition="start" />
        </Tabs>

        <DialogContent sx={{ minHeight: 400 }}>
          <TabPanel value={formTab} index={0}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ContactMailIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Contact Methods</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth type="email" label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth select label="Preferred Contact" value={formData.preferredContactMethod} onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}>{CONTACT_METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>
                <Grid item xs={6}><TextField fullWidth label="Primary Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 555-5555" /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Secondary Phone" value={formData.secondaryPhone} onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })} placeholder="(555) 555-5555" /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={1}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HomeIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Property Address</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Street Address" value={formData.propertyAddress} onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })} required /></Grid>
                <Grid item xs={5}><TextField fullWidth label="City" value={formData.propertyCity} onChange={(e) => setFormData({ ...formData, propertyCity: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="State" value={formData.propertyState} onChange={(e) => setFormData({ ...formData, propertyState: e.target.value })} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="ZIP" value={formData.propertyZip} onChange={(e) => setFormData({ ...formData, propertyZip: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Billing Address</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>(if different)</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Street Address" value={formData.billingAddress} onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })} /></Grid>
                <Grid item xs={5}><TextField fullWidth label="City" value={formData.billingCity} onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="State" value={formData.billingState} onChange={(e) => setFormData({ ...formData, billingState: e.target.value })} /></Grid>
                <Grid item xs={4}><TextField fullWidth label="ZIP" value={formData.billingZip} onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })} /></Grid>
              </Grid>
            </Paper>
          </TabPanel>

          <TabPanel value={formTab} index={2}>
            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Customer Details</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth select label="Customer Type" value={formData.customerType} onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}>{CUSTOMER_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
                <Grid item xs={6}><TextField fullWidth select label="Source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>{CUSTOMER_SOURCES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                {formData.source === 'Referral' && <Grid item xs={12}><TextField fullWidth label="Referred By" value={formData.referredBy} onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })} placeholder="Name of referrer" /></Grid>}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tags</InputLabel>
                    <Select multiple value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })} input={<OutlinedInput label="Tags" />} renderValue={(sel) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{sel.map(v => <Chip key={v} label={v} size="small" />)}</Box>}>
                      {AVAILABLE_TAGS.map(tag => <MenuItem key={tag} value={tag}><Checkbox checked={formData.tags.indexOf(tag) > -1} /><ListItemText primary={tag} /></MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes about this customer..." /></Grid>
              </Grid>
            </Paper>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.firstName || !formData.lastName || !formData.propertyAddress}>{editingId ? 'Save Changes' : 'Add Customer'}</Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E' } }}>
        {selectedCustomer && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: getAvatarColor(`${selectedCustomer.firstName} ${selectedCustomer.lastName}`), width: 48, height: 48, fontSize: '1.25rem', fontWeight: 600 }}>{getInitials(selectedCustomer.firstName, selectedCustomer.lastName)}</Avatar>
                <Box><Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedCustomer.firstName} {selectedCustomer.lastName}</Typography>{selectedCustomer.company && <Typography variant="body2" color="text.secondary">{selectedCustomer.company}</Typography>}</Box>
                <Chip label={selectedCustomer.customerType || 'Residential'} size="small" sx={{ bgcolor: '#007AFF', color: '#FFF', fontWeight: 500, ml: 'auto' }} />
              </Box>
            </DialogTitle>
            <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}><Tab label="Details" /><Tab label="Projects" /><Tab label="Notes" /></Tabs>
            <DialogContent>
              <TabPanel value={detailTab} index={0}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Contact</Typography>
                <List>
                  {selectedCustomer.email && <ListItem><ListItemIcon><EmailIcon /></ListItemIcon><ListItemText primary="Email" secondary={selectedCustomer.email} /></ListItem>}
                  {selectedCustomer.phone && <ListItem><ListItemIcon><PhoneIcon /></ListItemIcon><ListItemText primary="Phone" secondary={selectedCustomer.phone} /></ListItem>}
                  {selectedCustomer.secondaryPhone && <ListItem><ListItemIcon><PhoneIcon /></ListItemIcon><ListItemText primary="Secondary" secondary={selectedCustomer.secondaryPhone} /></ListItem>}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Addresses</Typography>
                <List>
                  <ListItem><ListItemIcon><HomeIcon /></ListItemIcon><ListItemText primary="Property" secondary={<>{selectedCustomer.propertyAddress}<br />{selectedCustomer.propertyCity && `${selectedCustomer.propertyCity}, `}{selectedCustomer.propertyState} {selectedCustomer.propertyZip}</>} /></ListItem>
                  {selectedCustomer.billingAddress && <ListItem><ListItemIcon><ReceiptIcon /></ListItemIcon><ListItemText primary="Billing" secondary={<>{selectedCustomer.billingAddress}<br />{selectedCustomer.billingCity && `${selectedCustomer.billingCity}, `}{selectedCustomer.billingState} {selectedCustomer.billingZip}</>} /></ListItem>}
                </List>
              </TabPanel>
              <TabPanel value={detailTab} index={1}>
                {customerProjects.length === 0 ? <Box sx={{ textAlign: 'center', py: 4 }}><ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} /><Typography color="text.secondary">No projects</Typography></Box> : <List>{customerProjects.map(p => <ListItem key={p._id} sx={{ bgcolor: '#2C2C2E', mb: 1, borderRadius: 1 }}><ListItemText primary={p.serviceType} secondary={<>{p.propertyAddress}<br />Status: {p.status}</>} /><Chip label={p.status} size="small" sx={{ bgcolor: '#007AFF', color: '#FFF' }} /></ListItem>)}</List>}
              </TabPanel>
              <TabPanel value={detailTab} index={2}>
                {selectedCustomer.notes ? <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedCustomer.notes}</Typography> : <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">No notes</Typography></Box>}
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => { setDetailOpen(false); handleEdit(selectedCustomer._id); }}>Edit</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default function CustomersPage() {
  return (<ConvexAuthGuard><CustomersPageContent /></ConvexAuthGuard>);
}
