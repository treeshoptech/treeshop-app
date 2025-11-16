"use client";

import { useState, useMemo } from "react";
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
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

export type AfissFactor = {
  id: string;
  label: string;
  impactType: "production" | "time"; // production = slows machine, time = adds overhead
  impactPercent: number; // Negative percentage (e.g., -25 for 25% slower/longer)
  description?: string;
};

export type AfissCategory = {
  id: string;
  name: string;
  factors: AfissFactor[];
};

type AfissSelectorProps = {
  categories: AfissCategory[];
  selectedFactors: string[];
  onFactorsChange: (factors: string[]) => void;
};

export function AfissSelector({
  categories,
  selectedFactors,
  onFactorsChange,
}: AfissSelectorProps) {
  // All categories collapsed by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFactorToggle = (factorId: string) => {
    onFactorsChange(
      selectedFactors.includes(factorId)
        ? selectedFactors.filter((id) => id !== factorId)
        : [...selectedFactors, factorId]
    );
  };

  // Search/autocomplete functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results: Array<{ factor: AfissFactor; category: AfissCategory }> = [];

    categories.forEach((category) => {
      category.factors.forEach((factor) => {
        if (factor.label.toLowerCase().includes(term)) {
          results.push({ factor, category });
        }
      });
    });

    return results.slice(0, 5); // Top 5 matches
  }, [searchTerm, categories]);

  const handleSearchResultClick = (factorId: string) => {
    if (!selectedFactors.includes(factorId)) {
      onFactorsChange([...selectedFactors, factorId]);
    }
    setSearchTerm("");
  };

  return (
    <Box>
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Site Assessment Factors
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Search or browse to identify site conditions
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
                  key={factor.id}
                  label={`${factor.label} (${category.name})`}
                  onClick={() => handleSearchResultClick(factor.id)}
                  color={selectedFactors.includes(factor.id) ? "success" : "default"}
                  sx={{ cursor: "pointer" }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Selected Factors Count */}
      {selectedFactors.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "success.dark" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedFactors.length} factor{selectedFactors.length !== 1 ? "s" : ""} identified
          </Typography>
        </Paper>
      )}

      {/* Categories - Collapsed by Default */}
      <Stack spacing={1}>
        {categories.map((category) => {
          const selectedInCategory = category.factors.filter((f) =>
            selectedFactors.includes(f.id)
          ).length;
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <Paper key={category.id} sx={{ overflow: "hidden" }}>
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
                onClick={() => toggleCategory(category.id)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {category.name}
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

              {/* Category Factors - NO PERCENTAGES SHOWN */}
              <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 2, bgcolor: "background.default" }}>
                  {category.factors.map((factor) => (
                    <FormControlLabel
                      key={factor.id}
                      control={
                        <Checkbox
                          checked={selectedFactors.includes(factor.id)}
                          onChange={() => handleFactorToggle(factor.id)}
                        />
                      }
                      label={<Typography variant="body2">{factor.label}</Typography>}
                      sx={{ display: "flex", width: "100%", m: 0, py: 0.5 }}
                    />
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
