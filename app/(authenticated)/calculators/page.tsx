"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  StumpGrindingCalculator,
  MulchingCalculator,
  LandClearingCalculator,
  TreeRemovalCalculator,
  TreeTrimmingCalculator,
} from "@/app/components/calculators";

type ServiceType = "stump" | "mulching" | "clearing" | "removal" | "trimming";

export default function CalculatorsPage() {
  const [serviceType, setServiceType] = useState<ServiceType>("stump");
  const [selectedLoadoutId, setSelectedLoadoutId] = useState<string>("");

  // Fetch loadouts
  const loadouts = useQuery(api.loadouts.list);

  const selectedLoadout = loadouts?.find((l) => l._id === selectedLoadoutId);

  const handleLineItemCreate = (lineItemData: any) => {
    console.log("Line item created:", lineItemData);
    // TODO: Create proposal or add to existing proposal
    // For now, just log the data
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Service Calculators
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Calculate pricing for tree services using TreeShop scoring formulas
      </Typography>

      <Stack spacing={3}>
        {/* Service Type Tabs */}
        <Paper>
          <Tabs
            value={serviceType}
            onChange={(_, val) => setServiceType(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Stump Grinding" value="stump" />
            <Tab label="Forestry Mulching" value="mulching" />
            <Tab label="Land Clearing" value="clearing" />
            <Tab label="Tree Removal" value="removal" />
            <Tab label="Tree Trimming" value="trimming" />
          </Tabs>
        </Paper>

        {/* Loadout Selection */}
        <Paper sx={{ p: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Loadout (Optional - for pricing)</InputLabel>
            <Select
              value={selectedLoadoutId}
              label="Select Loadout (Optional - for pricing)"
              onChange={(e) => setSelectedLoadoutId(e.target.value)}
            >
              <MenuItem value="">
                <em>No loadout (score calculation only)</em>
              </MenuItem>
              {loadouts?.map((loadout) => (
                <MenuItem key={loadout._id} value={loadout._id}>
                  {loadout.name} - {loadout.productionRate} PPH
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Calculator Display */}
        <Box>
          {serviceType === "stump" && (
            <StumpGrindingCalculator
              loadout={selectedLoadout}
              onLineItemCreate={handleLineItemCreate}
            />
          )}
          {serviceType === "mulching" && (
            <MulchingCalculator
              loadout={selectedLoadout}
              onLineItemCreate={handleLineItemCreate}
            />
          )}
          {serviceType === "clearing" && (
            <LandClearingCalculator
              loadout={selectedLoadout}
              onLineItemCreate={handleLineItemCreate}
            />
          )}
          {serviceType === "removal" && (
            <TreeRemovalCalculator
              loadout={selectedLoadout}
              onLineItemCreate={handleLineItemCreate}
            />
          )}
          {serviceType === "trimming" && (
            <TreeTrimmingCalculator
              loadout={selectedLoadout}
              onLineItemCreate={handleLineItemCreate}
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
}
