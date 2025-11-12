"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Card,
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
  Collapse,
  Menu,
  ListItemButton,
  Stack,
  Tabs,
  Tab,
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreVertIcon,
  Map as MapIcon,
  Assignment as AssignmentIcon,
  Note as NoteIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
// Google Maps components temporarily removed - causing production errors
// import { AddressAutocomplete } from '@/app/components/customers/AddressAutocomplete';
// import { PropertyMapPreview } from '@/app/components/customers/PropertyMapPreview';

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
  const projects = useQuery(api.projects.list);
  const createCustomer = useMutation(api.customers.create);
  const updateCustomer = useMutation(api.customers.update);
  const deleteCustomer = useMutation(api.customers.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"customers"> | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<Id<"customers"> | null>(null);
  const [expandedSection, setExpandedSection] = useState<'details' | 'projects' | 'map' | 'notes' | null>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [formTab, setFormTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCustomerId, setMenuCustomerId] = useState<Id<"customers"> | null>(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', secondaryPhone: '', company: '',
    propertyAddress: '', propertyCity: '', propertyState: 'FL', propertyZip: '',
    billingAddress: '', billingCity: '', billingState: 'FL', billingZip: '',
    source: 'Website', referredBy: '', customerType: 'Residential', preferredContactMethod: 'Phone',
    tags: [] as string[], notes: '',
  });

  const filteredCustomers = customers?.filter(customer => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return customer.firstName.toLowerCase().includes(search) ||
           customer.lastName.toLowerCase().includes(search) ||
           customer.email?.toLowerCase().includes(search) ||
           customer.phone?.toLowerCase().includes(search) ||
           customer.company?.toLowerCase().includes(search) ||
           customer.propertyAddress.toLowerCase().includes(search);
  });

  const handleOpenForm = () => {
    setEditingId(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', secondaryPhone: '', company: '',
      propertyAddress: '', propertyCity: '', propertyState: 'FL', propertyZip: '',
      billingAddress: '', billingCity: '', billingState: 'FL', billingZip: '',
      source: 'Website', referredBy: '', customerType: 'Residential', preferredContactMethod: 'Phone',
      tags: [], notes: '',
    });
    setFormTab(0);
    setFormOpen(true);
  };

  const handleEdit = (customerId: Id<"customers">) => {
    const customer = customers?.find(c => c._id === customerId);
    if (!customer) return;

    setEditingId(customerId);
    setFormData({
      firstName: customer.firstName, lastName: customer.lastName,
      email: customer.email || '', phone: customer.phone || '', secondaryPhone: customer.secondaryPhone || '',
      company: customer.company || '',
      propertyAddress: customer.propertyAddress, propertyCity: customer.propertyCity || '',
      propertyState: customer.propertyState || 'FL', propertyZip: customer.propertyZip || '',
      billingAddress: customer.billingAddress || '', billingCity: customer.billingCity || '',
      billingState: customer.billingState || 'FL', billingZip: customer.billingZip || '',
      source: customer.source || 'Website', referredBy: customer.referredBy || '',
      customerType: customer.customerType || 'Residential',
      preferredContactMethod: customer.preferredContactMethod || 'Phone',
      tags: customer.tags || [], notes: customer.notes || '',
    });
    setFormTab(0);
    setFormOpen(true);
    setAnchorEl(null);
  };

  const handleDelete = async (customerId: Id<"customers">) => {
    if (confirm('Delete this customer? This cannot be undone.')) {
      await deleteCustomer({ customerId });
      setAnchorEl(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.propertyAddress) {
      alert('Please fill in required fields (First Name, Last Name, Property Address)');
      return;
    }

    try {
      if (editingId) {
        await updateCustomer({ customerId: editingId, ...formData });
      } else {
        await createCustomer(formData);
      }
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer');
    }
  };

  const toggleExpand = (customerId: Id<"customers">) => {
    if (expandedCustomer === customerId) {
      setExpandedCustomer(null);
      setExpandedSection(null);
    } else {
      setExpandedCustomer(customerId);
      setExpandedSection('details');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, customerId: Id<"customers">) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCustomerId(customerId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCustomerId(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getCustomerProjects = (customerId: Id<"customers">) => {
    return projects?.filter(p => p.customerId === customerId) || [];
  };

  const getTotalRevenue = (customerId: Id<"customers">) => {
    const customerProjects = getCustomerProjects(customerId);
    // This would calculate total from invoices/quotes when those are added
    return customerProjects.length * 5000; // Placeholder
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Customers</Typography>
          <Typography variant="body2" color="text.secondary">
            {customers?.length || 0} total customers
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
          Add Customer
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search customers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Customer Directory List */}
      <Paper sx={{ bgcolor: '#1C1C1E', border: '1px solid #2C2C2E' }}>
        {filteredCustomers?.map((customer) => {
          const isExpanded = expandedCustomer === customer._id;
          const customerProjects = getCustomerProjects(customer._id);
          const totalRevenue = getTotalRevenue(customer._id);

          return (
            <Box key={customer._id} sx={{ borderBottom: '1px solid #2C2C2E', '&:last-child': { borderBottom: 'none' } }}>
              {/* Customer Row */}
              <ListItemButton
                onClick={() => toggleExpand(customer._id)}
                sx={{
                  py: 2,
                  px: 3,
                  bgcolor: isExpanded ? '#2C2C2E' : 'transparent',
                  '&:hover': { bgcolor: '#2C2C2E' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  {/* Expand/Collapse Icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 24 }}>
                    {isExpanded ? <FolderOpenIcon sx={{ color: '#007AFF' }} /> : <FolderIcon sx={{ color: 'text.secondary' }} />}
                  </Box>

                  {/* Avatar */}
                  <Avatar
                    sx={{
                      bgcolor: getAvatarColor(`${customer.firstName} ${customer.lastName}`),
                      width: 40,
                      height: 40,
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {getInitials(customer.firstName, customer.lastName)}
                  </Avatar>

                  {/* Name and Company */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25 }}>
                      {customer.firstName} {customer.lastName}
                    </Typography>
                    {customer.company && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {customer.company}
                      </Typography>
                    )}
                  </Box>

                  {/* Stats */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Projects
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {customerProjects.length}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Revenue
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#34C759' }}>
                        ${(totalRevenue / 1000).toFixed(1)}k
                      </Typography>
                    </Box>
                  </Box>

                  {/* Type Badge */}
                  <Chip
                    label={customer.customerType || 'Residential'}
                    size="small"
                    sx={{
                      bgcolor: customer.customerType === 'Commercial' ? '#FF9500' : '#007AFF',
                      color: '#FFF',
                      fontWeight: 500,
                      display: { xs: 'none', sm: 'flex' }
                    }}
                  />

                  {/* Tags */}
                  {customer.tags && customer.tags.length > 0 && (
                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5 }}>
                      {customer.tags.slice(0, 2).map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ bgcolor: '#2C2C2E', fontSize: '0.75rem', height: 24 }}
                        />
                      ))}
                      {customer.tags.length > 2 && (
                        <Chip
                          label={`+${customer.tags.length - 2}`}
                          size="small"
                          sx={{ bgcolor: '#2C2C2E', fontSize: '0.75rem', height: 24 }}
                        />
                      )}
                    </Box>
                  )}

                  {/* Actions Menu */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, customer._id)}
                    sx={{ ml: 1 }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </ListItemButton>

              {/* Expanded Content */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ bgcolor: '#000', p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Left Column - Navigation */}
                    <Grid item xs={12} md={3}>
                      <List sx={{ p: 0 }}>
                        <ListItemButton
                          selected={expandedSection === 'details'}
                          onClick={() => setExpandedSection('details')}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            '&.Mui-selected': { bgcolor: '#007AFF', '&:hover': { bgcolor: '#0051D5' } }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <PersonIcon sx={{ color: expandedSection === 'details' ? '#FFF' : 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText primary="Details" />
                        </ListItemButton>

                        <ListItemButton
                          selected={expandedSection === 'map'}
                          onClick={() => setExpandedSection('map')}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            '&.Mui-selected': { bgcolor: '#007AFF', '&:hover': { bgcolor: '#0051D5' } }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <MapIcon sx={{ color: expandedSection === 'map' ? '#FFF' : 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText primary="Property Map" />
                        </ListItemButton>

                        <ListItemButton
                          selected={expandedSection === 'projects'}
                          onClick={() => setExpandedSection('projects')}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            '&.Mui-selected': { bgcolor: '#007AFF', '&:hover': { bgcolor: '#0051D5' } }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <AssignmentIcon sx={{ color: expandedSection === 'projects' ? '#FFF' : 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText primary={`Projects (${customerProjects.length})`} />
                        </ListItemButton>

                        <ListItemButton
                          selected={expandedSection === 'notes'}
                          onClick={() => setExpandedSection('notes')}
                          sx={{
                            borderRadius: 1,
                            '&.Mui-selected': { bgcolor: '#007AFF', '&:hover': { bgcolor: '#0051D5' } }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <NoteIcon sx={{ color: expandedSection === 'notes' ? '#FFF' : 'text.secondary' }} />
                          </ListItemIcon>
                          <ListItemText primary="Notes" />
                        </ListItemButton>
                      </List>
                    </Grid>

                    {/* Right Column - Content */}
                    <Grid item xs={12} md={9}>
                      {/* Details Section */}
                      {expandedSection === 'details' && (
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Contact Information
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Email
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">{customer.email || 'Not provided'}</Typography>
                                </Box>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Phone
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">{customer.phone || 'Not provided'}</Typography>
                                </Box>
                              </Paper>
                            </Grid>
                            {customer.secondaryPhone && (
                              <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Secondary Phone
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2">{customer.secondaryPhone}</Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>

                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
                            Addresses
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Property Address
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                  <HomeIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.3 }} />
                                  <Box>
                                    <Typography variant="body2">{customer.propertyAddress}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {customer.propertyCity && `${customer.propertyCity}, `}
                                      {customer.propertyState} {customer.propertyZip}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>
                            {customer.billingAddress && (
                              <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Billing Address
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <ReceiptIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.3 }} />
                                    <Box>
                                      <Typography variant="body2">{customer.billingAddress}</Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {customer.billingCity && `${customer.billingCity}, `}
                                        {customer.billingState} {customer.billingZip}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>

                          <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
                            Customer Information
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Type
                                </Typography>
                                <Typography variant="body2">{customer.customerType || 'Residential'}</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Source
                                </Typography>
                                <Typography variant="body2">{customer.source || 'N/A'}</Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Preferred Contact
                                </Typography>
                                <Typography variant="body2">{customer.preferredContactMethod || 'Phone'}</Typography>
                              </Paper>
                            </Grid>
                            {customer.referredBy && (
                              <Grid item xs={12} sm={6} md={3}>
                                <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Referred By
                                  </Typography>
                                  <Typography variant="body2">{customer.referredBy}</Typography>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>

                          {customer.tags && customer.tags.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Tags
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {customer.tags.map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    icon={<TagIcon />}
                                    sx={{ bgcolor: '#2C2C2E' }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Map Section */}
                      {expandedSection === 'map' && (
                        <Box>
                          <Card>
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                              <Typography variant="body1" color="text.secondary">
                                Property maps feature coming soon
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {customer.propertyAddress}, {customer.propertyCity}, {customer.propertyState} {customer.propertyZip}
                              </Typography>
                            </Box>
                          </Card>
                        </Box>
                      )}

                      {/* Projects Section */}
                      {expandedSection === 'projects' && (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Projects ({customerProjects.length})
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => {/* TODO: Create project for this customer */}}
                            >
                              New Project
                            </Button>
                          </Box>
                          {customerProjects.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#1C1C1E' }}>
                              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                              <Typography color="text.secondary">No projects yet</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Create a project to get started
                              </Typography>
                            </Paper>
                          ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {customerProjects.map((project) => (
                                <Paper key={project._id} sx={{ p: 2, bgcolor: '#1C1C1E', cursor: 'pointer', '&:hover': { bgcolor: '#2C2C2E' } }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {project.serviceType}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {project.propertyAddress}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip
                                          label={project.status}
                                          size="small"
                                          sx={{
                                            bgcolor: project.status === 'Work Order' ? '#34C759' : project.status === 'Proposal' ? '#FF9500' : '#007AFF',
                                            color: '#FFF',
                                            fontSize: '0.75rem',
                                            height: 24
                                          }}
                                        />
                                        {project.createdAt && (
                                          <Typography variant="caption" color="text.secondary">
                                            Created {new Date(project.createdAt).toLocaleDateString()}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                    <IconButton size="small">
                                      <MoreVertIcon />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Notes Section */}
                      {expandedSection === 'notes' && (
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Notes
                          </Typography>
                          {customer.notes ? (
                            <Paper sx={{ p: 2, bgcolor: '#1C1C1E' }}>
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {customer.notes}
                              </Typography>
                            </Paper>
                          ) : (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#1C1C1E' }}>
                              <NoteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                              <Typography color="text.secondary">No notes yet</Typography>
                            </Paper>
                          )}
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Box>
          );
        })}

        {filteredCustomers?.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </Typography>
            {!searchQuery && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm} sx={{ mt: 2 }}>
                Add First Customer
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuCustomerId && handleEdit(menuCustomerId)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => menuCustomerId && handleDelete(menuCustomerId)} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E' } }}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
            <IconButton onClick={() => setFormOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Tabs value={formTab} onChange={(_, v) => setFormTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tab label="Basic Info" />
          <Tab label="Addresses" />
          <Tab label="Details" />
        </Tabs>
        <DialogContent>
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Contact</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Secondary Phone" value={formData.secondaryPhone} onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })} /></Grid>
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
                <Grid item xs={12}>
                  <TextField
                    label="Property Address"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    fullWidth
                    required
                    placeholder="123 Main St"
                  />
                </Grid>
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
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Customer Type</InputLabel>
                    <Select value={formData.customerType} label="Customer Type" onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}>
                      {CUSTOMER_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Source</InputLabel>
                    <Select value={formData.source} label="Source" onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                      {CUSTOMER_SOURCES.map(source => <MenuItem key={source} value={source}>{source}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Contact Method</InputLabel>
                    <Select value={formData.preferredContactMethod} label="Preferred Contact Method" onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}>
                      {CONTACT_METHODS.map(method => <MenuItem key={method} value={method}>{method}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}><TextField fullWidth label="Referred By" value={formData.referredBy} onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })} /></Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 2, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TagIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Tags</Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>Select Tags</InputLabel>
                <Select
                  multiple
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                  input={<OutlinedInput label="Select Tags" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (<Chip key={value} label={value} size="small" />))}
                    </Box>
                  )}
                >
                  {AVAILABLE_TAGS.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      <Checkbox checked={formData.tags.indexOf(tag) > -1} />
                      <ListItemText primary={tag} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            <Paper sx={{ p: 3, bgcolor: '#2C2C2E' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NoteIcon sx={{ mr: 1, color: '#007AFF' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Notes</Typography>
              </Box>
              <TextField fullWidth multiline rows={4} label="Customer Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Add any notes about this customer..." />
            </Paper>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.firstName || !formData.lastName || !formData.propertyAddress}>
            {editingId ? 'Save Changes' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function CustomersPage() {
  return (
    <ConvexAuthGuard>
      <CustomersPageContent />
    </ConvexAuthGuard>
  );
}
