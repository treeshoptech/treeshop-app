"use client";

import { useState } from "react";
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

export type AfissFactor = {
  id: string;
  label: string;
  impact: number; // Negative percentage (e.g., -27 for -27%)
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map((c) => c.id)
  );

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

  // Calculate total impact (compound multiplication)
  const calculateTotalImpact = () => {
    let multiplier = 1.0;

    categories.forEach((category) => {
      category.factors.forEach((factor) => {
        if (selectedFactors.includes(factor.id)) {
          multiplier *= 1 + factor.impact / 100;
        }
      });
    });

    const totalImpactPercent = (1 - multiplier) * 100;
    return totalImpactPercent;
  };

  const totalImpact = calculateTotalImpact();

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2, bgcolor: "#1C1C1E", border: "1px solid #2C2C2E" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          AFISS Complexity Factors
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select all factors that apply to this job. Each factor impacts production rate.
        </Typography>

        {totalImpact > 0 && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: "rgba(255, 149, 0, 0.1)",
              border: "1px solid #FF9500",
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#FF9500" }}>
              Total Production Impact: {totalImpact.toFixed(1)}% slower
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Production rate reduced to {(100 - totalImpact).toFixed(1)}% of normal
            </Typography>
          </Box>
        )}
      </Paper>

      <Stack spacing={1}>
        {categories.map((category) => {
          const selectedInCategory = category.factors.filter((f) =>
            selectedFactors.includes(f.id)
          ).length;
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <Paper
              key={category.id}
              sx={{
                bgcolor: "#1C1C1E",
                border: "1px solid #2C2C2E",
                overflow: "hidden",
              }}
            >
              {/* Category Header */}
              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                }}
                onClick={() => toggleCategory(category.id)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                  {selectedInCategory > 0 && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: "#FF9500",
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {selectedInCategory}
                    </Box>
                  )}
                </Box>
                <IconButton size="small">
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* Category Factors */}
              <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {category.factors.map((factor) => (
                    <FormControlLabel
                      key={factor.id}
                      control={
                        <Checkbox
                          checked={selectedFactors.includes(factor.id)}
                          onChange={() => handleFactorToggle(factor.id)}
                          sx={{
                            color: "#8E8E93",
                            "&.Mui-checked": { color: "#FF9500" },
                          }}
                        />
                      }
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Typography variant="body2">{factor.label}</Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: factor.impact < 0 ? "#FF3B30" : "#34C759",
                              ml: 2,
                            }}
                          >
                            {factor.impact > 0 ? "+" : ""}
                            {factor.impact}%
                          </Typography>
                        </Box>
                      }
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
