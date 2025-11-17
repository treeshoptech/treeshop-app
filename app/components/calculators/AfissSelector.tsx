"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

interface AfissSelectorProps {
  serviceType?: string; // Filter factors by service type (e.g., "Forestry Mulching", "Stump Grinding")
  selectedFactorIds: string[]; // Array of factorId strings (e.g., ["access_narrow_gate", "facilities_power_lines_nearby"])
  onFactorsChange: (factorIds: string[]) => void;
  showMultiplier?: boolean; // Show calculated multiplier (default true)
}

export function AfissSelector({
  serviceType,
  selectedFactorIds,
  onFactorsChange,
  showMultiplier = true,
}: AfissSelectorProps) {
  // Fetch AFISS factors from database
  const allFactors = useQuery(api.afissFactors.list);
  const multiplierResult = useQuery(
    api.afissFactors.calculateMultiplier,
    { factorIds: selectedFactorIds }
  );

  // All categories collapsed by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter factors by service type if specified
  const filteredFactors = useMemo(() => {
    if (!allFactors) return [];
    if (!serviceType) return allFactors;

    return allFactors.filter((factor) =>
      factor.applicableServiceTypes.includes(serviceType)
    );
  }, [allFactors, serviceType]);

  // Group factors by category
  const groupedFactors = useMemo(() => {
    const groups: Record<string, typeof filteredFactors> = {};

    filteredFactors.forEach((factor) => {
      if (!groups[factor.category]) {
        groups[factor.category] = [];
      }
      groups[factor.category].push(factor);
    });

    // Sort factors within each category by sortOrder
    Object.keys(groups).forEach((category) => {
      groups[category].sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return groups;
  }, [filteredFactors]);

  const categories = Object.keys(groupedFactors).sort();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleFactorToggle = (factorId: string) => {
    onFactorsChange(
      selectedFactorIds.includes(factorId)
        ? selectedFactorIds.filter((id) => id !== factorId)
        : [...selectedFactorIds, factorId]
    );
  };

  // Search/autocomplete functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results: Array<{ factor: typeof filteredFactors[0]; category: string }> = [];

    Object.entries(groupedFactors).forEach(([category, factors]) => {
      factors.forEach((factor) => {
        if (
          factor.name.toLowerCase().includes(term) ||
          factor.description.toLowerCase().includes(term)
        ) {
          results.push({ factor, category });
        }
      });
    });

    return results.slice(0, 5); // Top 5 matches
  }, [searchTerm, groupedFactors]);

  const handleSearchResultClick = (factorId: string) => {
    if (!selectedFactorIds.includes(factorId)) {
      onFactorsChange([...selectedFactorIds, factorId]);
    }
    setSearchTerm("");
  };

  // Loading state
  if (allFactors === undefined) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // No factors available
  if (filteredFactors.length === 0) {
    return (
      <Alert severity="warning">
        <Typography variant="subtitle2" gutterBottom>
          No AFISS factors available
        </Typography>
        <Typography variant="body2">
          {serviceType
            ? `No complexity factors found for ${serviceType}. Check service template configuration.`
            : "No complexity factors found in the database. Please seed default AFISS factors."}
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Site Assessment Factors (AFISS)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Search or browse to identify site conditions that affect complexity
        </Typography>
        <TextField
          fullWidth
          placeholder="Search factors (e.g., 'power lines', 'steep', 'wetlands')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Quick Add:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {searchResults.map(({ factor, category }) => (
                <Chip
                  key={factor.factorId}
                  label={`${factor.name} (${category})`}
                  onClick={() => handleSearchResultClick(factor.factorId)}
                  color={selectedFactorIds.includes(factor.factorId) ? "success" : "default"}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Selected Factors Summary */}
      {selectedFactorIds.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "success.dark" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selectedFactorIds.length} factor{selectedFactorIds.length !== 1 ? "s" : ""} identified
            </Typography>
            {showMultiplier && multiplierResult && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: "success.light" }}>
                {multiplierResult.multiplier.toFixed(2)}× complexity
                {multiplierResult.totalImpactPercent !== 0 && (
                  <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                    ({multiplierResult.totalImpactPercent > 0 ? '+' : ''}{multiplierResult.totalImpactPercent}%)
                  </Typography>
                )}
              </Typography>
            )}
          </Box>
          {multiplierResult && multiplierResult.factorsApplied.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Applied factors:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                {multiplierResult.factorsApplied.map((f: any) => (
                  <Chip
                    key={f.id}
                    label={`${f.name} (${f.impact > 0 ? '+' : ''}${Math.round(f.impact * 100)}%)`}
                    size="small"
                    color={f.impact > 0 ? "warning" : "success"}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      )}

      {/* Categories - Collapsed by Default */}
      <Stack spacing={1}>
        {categories.map((categoryName) => {
          const categoryFactors = groupedFactors[categoryName];
          const selectedInCategory = categoryFactors.filter((f) =>
            selectedFactorIds.includes(f.factorId)
          ).length;
          const isExpanded = expandedCategories.includes(categoryName);

          return (
            <Paper key={categoryName} sx={{ overflow: "hidden" }}>
              {/* Category Header */}
              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => toggleCategory(categoryName)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {categoryName}
                  </Typography>
                  {selectedInCategory > 0 && (
                    <Chip
                      label={selectedInCategory}
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
                <IconButton size="small">
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* Category Factors */}
              <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 2, bgcolor: "background.default" }}>
                  {categoryFactors.map((factor) => (
                    <Box
                      key={factor.factorId}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        width: "100%",
                        py: 0.5,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedFactorIds.includes(factor.factorId)}
                            onChange={() => handleFactorToggle(factor.factorId)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {factor.name}
                            </Typography>
                            {factor.description && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {factor.description}
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ flex: 1, m: 0 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
