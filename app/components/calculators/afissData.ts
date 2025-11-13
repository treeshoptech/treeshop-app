import { AfissCategory } from "./AfissSelector";

// FORESTRY MULCHING AFISS (No DBH factors - that's in package selection)
export const FORESTRY_MULCHING_AFISS: AfissCategory[] = [
  {
    id: "vegetation-density",
    name: "VEGETATION DENSITY",
    factors: [
      { id: "heavy-underbrush", label: "Heavy Underbrush", impact: -18 },
      { id: "thick-palmetto", label: "Thick Palmetto", impact: -31 },
      { id: "invasive-species", label: "Invasive Species (Brazilian Pepper)", impact: -22 },
      { id: "vines-entangled", label: "Vines/Entangled Growth", impact: -27 },
      { id: "standing-water", label: "Standing Water >6\"", impact: -36 },
      { id: "hardwood-predominant", label: "Hardwood Predominant", impact: -18 },
      { id: "mixed-density", label: "Mixed Vegetation Density", impact: -13 },
    ],
  },
  {
    id: "terrain",
    name: "TERRAIN CONDITIONS",
    factors: [
      { id: "steep-15", label: "Steep Slope >15%", impact: -22 },
      { id: "steep-30", label: "Steep Slope >30%", impact: -40 },
      { id: "wet-ground", label: "Wet/Saturated Ground", impact: -31 },
      { id: "rocky", label: "Rocky Terrain", impact: -27 },
      { id: "soft-sandy", label: "Soft/Sandy Soil", impact: -13 },
      { id: "uneven-grade", label: "Uneven Grade", impact: -18 },
      { id: "creek-drainage", label: "Creek/Drainage Through Site", impact: -22 },
      { id: "elevation-changes", label: "Multiple Elevation Changes", impact: -18 },
    ],
  },
  {
    id: "access",
    name: "ACCESS LIMITATIONS",
    factors: [
      { id: "gate-10ft", label: "Gated Access <10ft (smaller unit)", impact: -22 },
      { id: "gate-8ft", label: "Gated Access <8ft (mini mulcher)", impact: -36 },
      { id: "no-direct-access", label: "No Direct Access", impact: -53 },
      { id: "multiple-entries", label: "Multiple Entry Points Needed", impact: -18 },
      { id: "long-transit", label: "Long Transit On-Site", impact: -9 },
      { id: "overhead-clearance", label: "Overhead Clearance <12ft", impact: -18 },
      { id: "limited-turnaround", label: "Limited Turnaround Space", impact: -13 },
    ],
  },
  {
    id: "obstacles",
    name: "OBSTACLES & FEATURES",
    factors: [
      { id: "fence-lines", label: "Fence Lines to Work Around", impact: -13 },
      { id: "structures-20ft", label: "Structures <20ft", impact: -18 },
      { id: "trees-preserve", label: "Scattered Trees to Preserve", impact: -27 },
      { id: "underground-utilities", label: "Underground Utilities", impact: -22 },
      { id: "septic-system", label: "Septic System Present", impact: -18 },
      { id: "wells-irrigation", label: "Wells/Irrigation", impact: -13 },
      { id: "property-markers", label: "Property Line Markers", impact: -9 },
      { id: "large-stumps", label: "Large Stumps to Avoid", impact: -16 },
    ],
  },
  {
    id: "environmental",
    name: "ENVIRONMENTAL RESTRICTIONS",
    factors: [
      { id: "wetlands", label: "Wetlands Present", impact: -27 },
      { id: "protected-wildlife", label: "Protected Wildlife", impact: -22 },
      { id: "waterfront", label: "Waterfront Property", impact: -13 },
      { id: "conservation-area", label: "Conservation Area", impact: -18 },
      { id: "flood-zone", label: "Flood Zone", impact: -9 },
      { id: "near-water-body", label: "Within 50ft of Water Body", impact: -11 },
      { id: "endangered-species", label: "Endangered Species", impact: -31 },
    ],
  },
  {
    id: "site-conditions",
    name: "SITE CONDITIONS",
    factors: [
      { id: "adjacent-occupied", label: "Adjacent Occupied Property", impact: -9 },
      { id: "noise-restrictions", label: "Noise Restrictions", impact: -18 },
      { id: "limited-hours", label: "Limited Work Hours", impact: -13 },
      { id: "dust-control", label: "Dust Control Required", impact: -11 },
      { id: "high-cleanup", label: "High Cleanup Standards", impact: -13 },
      { id: "hoa-oversight", label: "HOA Oversight", impact: -7 },
    ],
  },
  {
    id: "weather",
    name: "WEATHER IMPACTS",
    factors: [
      { id: "hot-weather", label: "Hot Weather >95°F", impact: -9 },
      { id: "cold-weather", label: "Cold Weather <40°F", impact: -7 },
      { id: "hurricane-season", label: "Hurricane Season (caution)", impact: -4 },
      { id: "wet-season", label: "Wet Season Operations", impact: -13 },
    ],
  },
];

// STUMP GRINDING AFISS
export const STUMP_GRINDING_AFISS: AfissCategory[] = [
  {
    id: "stump-condition",
    name: "STUMP CONDITION",
    factors: [
      { id: "hardwood", label: "Hardwood Species (Oak, Hickory)", impact: -27 },
      { id: "large-flare", label: "Large Root Flare >36\"", impact: -22 },
      { id: "multiple-stems", label: "Multiple Stems", impact: -18 },
      { id: "root-ball-48", label: "Root Ball >48\" diameter", impact: -27 },
      { id: "treated-wood", label: "Treated/Pressure Treated Wood", impact: -36 },
      { id: "fresh-cut", label: "Fresh Cut (<30 days)", impact: -13 },
      { id: "buried-concrete", label: "Buried Concrete/Debris", impact: -31 },
      { id: "stump-36", label: "Stump >36\" diameter", impact: -18 },
    ],
  },
  {
    id: "proximity",
    name: "PROXIMITY HAZARDS",
    factors: [
      { id: "against-foundation", label: "Against Foundation", impact: -36 },
      { id: "between-structures", label: "Between Structures <5ft", impact: -40 },
      { id: "under-deck", label: "Under Deck/Patio", impact: -45 },
      { id: "against-fence", label: "Against Fence", impact: -18 },
      { id: "planting-bed", label: "In Planting Bed", impact: -13 },
      { id: "retaining-wall", label: "Near Retaining Wall", impact: -18 },
      { id: "pool-spa", label: "Against Pool/Spa", impact: -27 },
    ],
  },
  {
    id: "underground",
    name: "UNDERGROUND HAZARDS",
    factors: [
      { id: "septic-10ft", label: "Septic System <10ft", impact: -27 },
      { id: "irrigation", label: "Irrigation Lines", impact: -22 },
      { id: "utilities-unknown", label: "Underground Utilities Unknown", impact: -18 },
      { id: "gas-line", label: "Gas Line <5ft", impact: -36 },
      { id: "water-line", label: "Water Line <5ft", impact: -27 },
      { id: "811-locate", label: "811 Locate Required", impact: -9 },
      { id: "electrical-conduit", label: "Electrical Conduit", impact: -22 },
      { id: "storm-drain", label: "Storm Drain", impact: -13 },
    ],
  },
  {
    id: "soil-terrain",
    name: "SOIL & TERRAIN",
    factors: [
      { id: "rocky-soil", label: "Rocky Soil", impact: -31 },
      { id: "clay-soil", label: "Clay Soil (hard)", impact: -18 },
      { id: "steep-slope", label: "Steep Slope >20%", impact: -22 },
      { id: "wet-soft", label: "Wet/Soft Ground", impact: -18 },
      { id: "sandy-soil", label: "Sandy Soil (loose)", impact: -13 },
      { id: "uneven-grade", label: "Uneven Grade", impact: -13 },
    ],
  },
  {
    id: "access",
    name: "ACCESS LIMITATIONS",
    factors: [
      { id: "gate-36", label: "Gated Access <36\" (hand grinder)", impact: -40 },
      { id: "backyard-only", label: "Backyard Only", impact: -9 },
      { id: "no-direct-access", label: "No Direct Access", impact: -22 },
      { id: "long-push-100", label: "Long Push >100ft", impact: -13 },
      { id: "long-push-200", label: "Long Push >200ft", impact: -22 },
      { id: "stairs", label: "Stairs to Navigate", impact: -18 },
      { id: "tight-maneuvering", label: "Tight Maneuvering", impact: -16 },
    ],
  },
  {
    id: "protection",
    name: "SITE PROTECTION",
    factors: [
      { id: "manicured-lawn", label: "Manicured Lawn", impact: -9 },
      { id: "landscaping-protect", label: "Landscaping to Protect", impact: -4 },
      { id: "hardscaping", label: "Hardscaping Adjacent", impact: -4 },
      { id: "plywood-path", label: "Plywood Path Required", impact: -9 },
      { id: "tarp-protection", label: "Tarp/Protection Setup", impact: -7 },
    ],
  },
  {
    id: "cleanup",
    name: "DEBRIS & CLEANUP",
    factors: [
      { id: "haul-grindings", label: "Must Haul Grindings", impact: -9 },
      { id: "fill-hole", label: "Fill Hole with Dirt", impact: -4 },
      { id: "seed-sod", label: "Seed/Sod After", impact: -9 },
      { id: "rake-level", label: "Rake/Level Site", impact: -4 },
      { id: "remove-all", label: "Remove All Grindings", impact: -13 },
    ],
  },
];

// LAND CLEARING AFISS
export const LAND_CLEARING_AFISS: AfissCategory[] = [
  {
    id: "vegetation",
    name: "VEGETATION TYPE & DENSITY",
    factors: [
      { id: "large-trees-12", label: "Large Trees (>12\" DBH)", impact: -31 },
      { id: "large-trees-18", label: "Large Trees (>18\" DBH)", impact: -45 },
      { id: "dense-forest", label: "Dense Forest", impact: -27 },
      { id: "palm-grove", label: "Palm Grove", impact: -22 },
      { id: "invasive-infestation", label: "Invasive Infestation", impact: -18 },
      { id: "mix-sizes", label: "Mix of Tree Sizes", impact: -13 },
      { id: "heavy-underbrush", label: "Heavy Underbrush", impact: -18 },
      { id: "mature-hardwoods", label: "Mature Hardwoods", impact: -27 },
    ],
  },
  {
    id: "terrain",
    name: "TERRAIN CONDITIONS",
    factors: [
      { id: "steep-20", label: "Steep Grade >20%", impact: -27 },
      { id: "steep-40", label: "Very Steep >40%", impact: -45 },
      { id: "wet-ground", label: "Wet Ground", impact: -31 },
      { id: "rocky", label: "Rocky", impact: -22 },
      { id: "elevation-changes", label: "Multiple Elevation Changes", impact: -18 },
      { id: "ravines-ditches", label: "Ravines/Ditches", impact: -27 },
      { id: "unstable-soil", label: "Unstable Soil", impact: -22 },
    ],
  },
  {
    id: "access",
    name: "ACCESS & HAUL ROUTES",
    factors: [
      { id: "no-direct-access", label: "No Direct Access", impact: -53 },
      { id: "limited-access", label: "Limited Access Point", impact: -18 },
      { id: "long-haul", label: "Long Haul Route", impact: -13 },
      { id: "public-road-only", label: "Public Road Access Only", impact: -27 },
      { id: "temp-road-build", label: "Temporary Road Build Needed", impact: -31 },
      { id: "bridge-culvert", label: "Bridge/Culvert Required", impact: -36 },
      { id: "soft-ground-access", label: "Soft Ground Access", impact: -22 },
    ],
  },
  {
    id: "obstacles",
    name: "OBSTACLES & BOUNDARIES",
    factors: [
      { id: "structures-protect", label: "Structures to Protect", impact: -22 },
      { id: "property-lines", label: "Adjacent Property Lines", impact: -13 },
      { id: "underground-utilities", label: "Underground Utilities", impact: -18 },
      { id: "work-around-features", label: "Must Work Around Features", impact: -18 },
      { id: "save-trees", label: "Mature Trees to Save", impact: -27 },
      { id: "waterways-avoid", label: "Waterways to Avoid", impact: -18 },
      { id: "historic-protected", label: "Historic/Protected Features", impact: -22 },
    ],
  },
  {
    id: "debris",
    name: "DEBRIS DISPOSAL",
    factors: [
      { id: "haul-all", label: "Must Haul All Material", impact: -27 },
      { id: "burn-pile", label: "Burn Pile Allowed", impact: 8 }, // Positive!
      { id: "grinding-required", label: "Grinding Required", impact: -18 },
      { id: "sort-materials", label: "Sort Materials (logs/brush)", impact: -13 },
      { id: "chip-brush", label: "Chip All Brush", impact: -16 },
      { id: "no-onsite-disposal", label: "No On-Site Disposal", impact: -31 },
    ],
  },
  {
    id: "regulatory",
    name: "REGULATORY REQUIREMENTS",
    factors: [
      { id: "permit-required", label: "Permit Required", impact: -13 },
      { id: "environmental-study", label: "Environmental Study", impact: -27 },
      { id: "wetlands-delineation", label: "Wetlands Delineation", impact: -18 },
      { id: "county-inspection", label: "County Inspection Required", impact: -9 },
      { id: "erosion-control", label: "Erosion Control Plan", impact: -11 },
      { id: "stormwater", label: "Stormwater Management", impact: -13 },
      { id: "archaeological", label: "Archaeological Survey", impact: -18 },
    ],
  },
  {
    id: "scale",
    name: "PROJECT SCALE FACTORS",
    factors: [
      { id: "small-acre", label: "<1 acre (small equipment)", impact: -18 },
      { id: "large-20", label: ">20 acres (mobilization)", impact: -13 },
      { id: "multiple-phases", label: "Multiple Phases Required", impact: -16 },
      { id: "seasonal-timing", label: "Seasonal Timing Critical", impact: -11 },
    ],
  },
  {
    id: "restoration",
    name: "SITE RESTORATION",
    factors: [
      { id: "grading-required", label: "Grading Required", impact: -13 },
      { id: "seeding-stabilization", label: "Seeding/Stabilization", impact: -9 },
      { id: "erosion-barriers", label: "Erosion Barriers", impact: -7 },
      { id: "final-grade-spec", label: "Final Grade to Spec", impact: -11 },
    ],
  },
];

// TREE REMOVAL AFISS
export const TREE_REMOVAL_AFISS: AfissCategory[] = [
  {
    id: "tree-characteristics",
    name: "TREE CHARACTERISTICS",
    factors: [
      { id: "dead-tree", label: "Dead Tree (Hazard)", impact: -27 },
      { id: "large-dbh-24", label: "Large DBH >24\"", impact: -22 },
      { id: "large-dbh-36", label: "Very Large DBH >36\"", impact: -36 },
      { id: "co-dominant-stems", label: "Co-Dominant Stems", impact: -18 },
      { id: "decay-rot", label: "Decay/Rot Present", impact: -22 },
      { id: "heavy-lean", label: "Heavy Lean >15°", impact: -31 },
      { id: "split-trunk", label: "Split/Cracked Trunk", impact: -27 },
      { id: "dense-canopy", label: "Dense Canopy", impact: -13 },
    ],
  },
  {
    id: "proximity",
    name: "PROXIMITY HAZARDS",
    factors: [
      { id: "over-structure", label: "Overhanging Structure", impact: -31 },
      { id: "between-structures", label: "Between Structures", impact: -36 },
      { id: "power-lines-touching", label: "Power Lines Touching", impact: -53 },
      { id: "power-lines-nearby", label: "Power Lines Nearby <10ft", impact: -27 },
      { id: "over-pool", label: "Over Pool/Patio", impact: -27 },
      { id: "fence-line", label: "Along Fence Line", impact: -13 },
      { id: "landscape-features", label: "Valuable Landscape Features", impact: -18 },
    ],
  },
  {
    id: "access",
    name: "ACCESS & RIGGING",
    factors: [
      { id: "no-bucket-access", label: "No Bucket Access (Climb Only)", impact: -40 },
      { id: "backyard-only", label: "Backyard Only", impact: -18 },
      { id: "tight-rigging", label: "Tight Rigging Required", impact: -27 },
      { id: "crane-required", label: "Crane Required", impact: -45 },
      { id: "limited-drop-zone", label: "Limited Drop Zone", impact: -22 },
      { id: "small-gate", label: "Gate <6ft (no chipper)", impact: -31 },
      { id: "long-haul", label: "Long Haul >100ft", impact: -13 },
    ],
  },
  {
    id: "site-protection",
    name: "SITE PROTECTION",
    factors: [
      { id: "manicured-lawn", label: "Manicured Lawn", impact: -13 },
      { id: "hardscaping-protect", label: "Hardscaping to Protect", impact: -9 },
      { id: "plywood-path", label: "Plywood Path Required", impact: -9 },
      { id: "high-value-property", label: "High-Value Property", impact: -18 },
      { id: "hoa-restrictions", label: "HOA Restrictions", impact: -11 },
    ],
  },
  {
    id: "debris",
    name: "DEBRIS & CLEANUP",
    factors: [
      { id: "haul-all", label: "Must Haul All Material", impact: -13 },
      { id: "grind-stump", label: "Grind Stump Included", impact: -18 },
      { id: "fill-seed", label: "Fill Hole & Seed", impact: -9 },
      { id: "rake-mulch", label: "Rake/Spread Mulch", impact: -4 },
      { id: "pristine-cleanup", label: "Pristine Cleanup Standard", impact: -11 },
    ],
  },
  {
    id: "complexity",
    name: "TECHNICAL COMPLEXITY",
    factors: [
      { id: "emergency-removal", label: "Emergency Removal", impact: -36 },
      { id: "storm-damage", label: "Storm Damage", impact: -27 },
      { id: "multiple-targets", label: "Multiple High-Value Targets", impact: -22 },
      { id: "difficult-species", label: "Difficult Species (Palm, etc.)", impact: -18 },
      { id: "aerial-work", label: "Extensive Aerial Work", impact: -13 },
    ],
  },
];

// TREE TRIMMING AFISS
export const TREE_TRIMMING_AFISS: AfissCategory[] = [
  {
    id: "tree-characteristics",
    name: "TREE CHARACTERISTICS",
    factors: [
      { id: "large-mature", label: "Large Mature Tree >30ft", impact: -18 },
      { id: "very-large", label: "Very Large Tree >50ft", impact: -27 },
      { id: "dense-canopy", label: "Dense Canopy", impact: -13 },
      { id: "deadwood-removal", label: "Extensive Deadwood Removal", impact: -22 },
      { id: "crossing-branches", label: "Many Crossing Branches", impact: -13 },
      { id: "weak-structure", label: "Weak Branch Structure", impact: -18 },
      { id: "overgrown", label: "Severely Overgrown", impact: -22 },
    ],
  },
  {
    id: "proximity",
    name: "PROXIMITY CONCERNS",
    factors: [
      { id: "over-structure", label: "Branches Over Structure", impact: -22 },
      { id: "power-lines-touching", label: "Touching Power Lines", impact: -45 },
      { id: "power-lines-nearby", label: "Power Lines Nearby <10ft", impact: -22 },
      { id: "over-pool-patio", label: "Over Pool/Patio", impact: -18 },
      { id: "high-traffic-area", label: "High-Traffic Area Below", impact: -13 },
      { id: "clearance-structure", label: "Clearance from Structure <5ft", impact: -18 },
    ],
  },
  {
    id: "access",
    name: "ACCESS & EQUIPMENT",
    factors: [
      { id: "no-bucket-access", label: "No Bucket Access (Climb Only)", impact: -31 },
      { id: "backyard-only", label: "Backyard Only", impact: -13 },
      { id: "tight-spaces", label: "Tight Spaces", impact: -18 },
      { id: "limited-drop-zone", label: "Limited Drop Zone", impact: -18 },
      { id: "small-gate", label: "Gate <6ft", impact: -22 },
      { id: "long-haul", label: "Long Haul >100ft", impact: -9 },
    ],
  },
  {
    id: "site-protection",
    name: "SITE PROTECTION",
    factors: [
      { id: "manicured-lawn", label: "Manicured Lawn", impact: -11 },
      { id: "landscaping", label: "Landscaping to Protect", impact: -9 },
      { id: "hardscaping", label: "Hardscaping Below", impact: -9 },
      { id: "high-value-property", label: "High-Value Property", impact: -13 },
      { id: "hoa-restrictions", label: "HOA Restrictions", impact: -7 },
    ],
  },
  {
    id: "debris",
    name: "DEBRIS & CLEANUP",
    factors: [
      { id: "haul-all", label: "Must Haul All Material", impact: -11 },
      { id: "chip-all", label: "Chip All Brush", impact: -9 },
      { id: "rake-clean", label: "Rake & Clean Site", impact: -4 },
      { id: "pristine-cleanup", label: "Pristine Cleanup Standard", impact: -9 },
    ],
  },
  {
    id: "trim-specification",
    name: "TRIM SPECIFICATION",
    factors: [
      { id: "canopy-reduction", label: "Canopy Reduction >30%", impact: -22 },
      { id: "crown-raising", label: "Crown Raising", impact: -13 },
      { id: "crown-thinning", label: "Crown Thinning", impact: -13 },
      { id: "directional-pruning", label: "Directional Pruning", impact: -18 },
      { id: "clearance-pruning", label: "Clearance Pruning (lines/structures)", impact: -18 },
      { id: "vista-pruning", label: "Vista Pruning (specific views)", impact: -22 },
      { id: "fine-pruning", label: "Fine Pruning (detail work)", impact: -27 },
    ],
  },
];

// Export all AFISS data
export const AFISS_DATA = {
  "Forestry Mulching": FORESTRY_MULCHING_AFISS,
  "Stump Grinding": STUMP_GRINDING_AFISS,
  "Land Clearing": LAND_CLEARING_AFISS,
  "Tree Removal": TREE_REMOVAL_AFISS,
  "Tree Trimming": TREE_TRIMMING_AFISS,
};
