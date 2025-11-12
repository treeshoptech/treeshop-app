"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CRUDDirectory, CRUDItem } from "@/app/components/CRUDDirectory";
import { ConvexAuthGuard } from "@/app/components/ConvexAuthGuard";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Autocomplete,
  Typography,
} from '@mui/material';

interface Lead extends CRUDItem {
  _id: Id<"projects">;
  serviceType: string;
  propertyAddress: string;
  customerName?: string;
  driveTimeMinutes?: number;
}

const SERVICE_TYPES = [
  'Forestry Mulching',
  'Land Clearing',
  'Stump Grinding',
  'Tree Removal',
  'Tree Trimming',
  'Tree Inspection',
];

function LeadsPageContent() {
  const leads = useQuery(api.leads.list);
  const customers = useQuery(api.customers.list);
  const createLead = useMutation(api.leads.create);
  const updateLead = useMutation(api.leads.update);
  const deleteLead = useMutation(api.leads.remove);
  const convertToProposal = useMutation(api.leads.convertToProposal);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
  const [formData, setFormData] = useState({
    customerId: '' as Id<"customers"> | '',
    serviceType: 'Forestry Mulching',
    propertyAddress: '',
    driveTimeMinutes: 0,
    notes: '',
  });

  // Transform leads for CRUDDirectory
  const leadItems: Lead[] = (leads || []).map(lead => ({
    id: lead._id,
    _id: lead._id,
    title: lead.customer?.name || 'Unknown Customer',
    subtitle: `${lead.serviceType} - ${lead.propertyAddress}`,
    status: 'Lead',
    serviceType: lead.serviceType,
    propertyAddress: lead.propertyAddress,
    customerName: lead.customer?.name,
    driveTimeMinutes: lead.driveTimeMinutes,
  }));

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      customerId: '',
      serviceType: 'Forestry Mulching',
      propertyAddress: '',
      driveTimeMinutes: 0,
      notes: '',
    });
    setFormOpen(true);
  };

  const handleEdit = (item: Lead) => {
    const fullLead = leads?.find(l => l._id === item._id);
    if (fullLead) {
      setEditingId(item._id);
      setFormData({
        customerId: fullLead.customerId,
        serviceType: fullLead.serviceType,
        propertyAddress: fullLead.propertyAddress,
        driveTimeMinutes: fullLead.driveTimeMinutes || 0,
        notes: fullLead.notes || '',
      });
      setFormOpen(true);
    }
  };

  const handleDelete = async (item: Lead) => {
    await deleteLead({ id: item._id });
  };

  const handleSubmit = async () => {
    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (editingId) {
      await updateLead({
        id: editingId,
        serviceType: formData.serviceType,
        propertyAddress: formData.propertyAddress,
        driveTimeMinutes: formData.driveTimeMinutes || undefined,
        notes: formData.notes || undefined,
      });
    } else {
      await createLead({
        customerId: formData.customerId,
        serviceType: formData.serviceType,
        propertyAddress: formData.propertyAddress,
        driveTimeMinutes: formData.driveTimeMinutes || undefined,
        notes: formData.notes || undefined,
      });
    }
    setFormOpen(false);
  };

  const handleConvertToProposal = async (item: Lead) => {
    const confirmed = window.confirm(
      'Convert this lead to a proposal? You can add pricing details next.'
    );
    if (confirmed) {
      await convertToProposal({ id: item._id });
    }
  };

  const selectedCustomer = customers?.find(c => c._id === formData.customerId);

  return (
    <>
      <CRUDDirectory
        title="Leads"
        items={leadItems}
        loading={leads === undefined}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search leads..."
        emptyMessage="No leads yet. Add your first lead to get started!"
        statusColors={{
          lead: '#FF9500',
        }}
        customActions={[
          {
            label: 'Convert to Proposal',
            onClick: handleConvertToProposal,
            color: 'primary',
          },
        ]}
      />

      {/* Add/Edit Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1C1C1E',
            border: '1px solid #2C2C2E',
          },
        }}
      >
        <DialogTitle>
          {editingId ? 'Edit Lead' : 'Add New Lead'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {/* Customer Selection */}
              <Grid item xs={12}>
                <Autocomplete
                  options={customers || []}
                  getOptionLabel={(option) => option.name}
                  value={selectedCustomer || null}
                  onChange={(_, newValue) => {
                    setFormData({
                      ...formData,
                      customerId: newValue?._id || '',
                      propertyAddress: newValue?.propertyAddress || formData.propertyAddress,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer"
                      required
                      helperText={selectedCustomer ? `${selectedCustomer.email || ''} ${selectedCustomer.phone || ''}` : ''}
                    />
                  )}
                  disabled={!!editingId}
                  loading={customers === undefined}
                />
              </Grid>

              {/* Service Type */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Service Type"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                >
                  {SERVICE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Drive Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Drive Time (minutes)"
                  value={formData.driveTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, driveTimeMinutes: parseInt(e.target.value) || 0 })}
                  helperText="Estimated one-way drive time"
                />
              </Grid>

              {/* Property Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Property Address"
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                  required
                  multiline
                  rows={2}
                  helperText={selectedCustomer?.propertyAddress ? `Customer default: ${selectedCustomer.propertyAddress}` : ''}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                  placeholder="Initial conversation notes, special requests, etc."
                />
              </Grid>

              {/* Lead Info */}
              <Grid item xs={12}>
                <Box sx={{
                  p: 2,
                  backgroundColor: '#000000',
                  borderRadius: 1,
                  border: '1px solid #2C2C2E',
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    LEAD WORKFLOW
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Capture initial customer interest<br />
                    • Schedule site visit or remote assessment<br />
                    • Convert to Proposal when ready to price
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.customerId || !formData.propertyAddress}
          >
            {editingId ? 'Save Changes' : 'Add Lead'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function LeadsPage() {
  return (
    <ConvexAuthGuard>
      <LeadsPageContent />
    </ConvexAuthGuard>
  );
}
