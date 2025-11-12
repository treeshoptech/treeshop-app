/**
 * TreeShop Equipment Taxonomy
 *
 * Comprehensive categorization system for ALL equipment types used in tree service,
 * land clearing, and forestry operations. The more granular the data, the more
 * accurate cost tracking and productivity analysis becomes.
 */

export const EQUIPMENT_TAXONOMY = {
  // ============================================================================
  // TRUCKS & VEHICLES
  // ============================================================================
  "Trucks & Vehicles": {
    description: "All motorized vehicles for transportation and hauling",
    subcategories: {
      "Light Duty Pickup": {
        examples: ["Ford F-150", "Ram 1500", "Chevy Silverado 1500"],
        typical_capacity: "1/2 ton - 1 ton",
      },
      "Heavy Duty Pickup": {
        examples: ["Ford F-250/F-350/F-450", "Ram 2500/3500", "Chevy Silverado 2500HD/3500HD"],
        typical_capacity: "3/4 ton - 1.5 ton",
      },
      "Dump Truck": {
        examples: ["Single Axle Dump", "Tandem Axle Dump", "Tri-Axle Dump"],
        typical_capacity: "5-20 cubic yards",
      },
      "Flatbed Truck": {
        examples: ["F-550 Flatbed", "International Flatbed", "Freightliner Flatbed"],
        typical_capacity: "12-26 ft beds",
      },
      "Grapple Truck": {
        examples: ["Mack Grapple", "Peterbilt Grapple", "Kenworth Grapple"],
        typical_capacity: "20-40 cubic yards",
      },
      "Box Truck": {
        examples: ["16' Box Truck", "20' Box Truck", "26' Box Truck"],
        typical_capacity: "500-1500 cubic feet",
      },
      "Semi Truck/Tractor": {
        examples: ["Day Cab Semi", "Sleeper Semi", "Lowboy Tractor"],
        typical_capacity: "Class 8 trucks",
      },
      "Service Truck": {
        examples: ["Utility Body Truck", "Mechanic Truck", "Service Body with Crane"],
        typical_capacity: "Various",
      },
      "Crew Cab": {
        examples: ["F-150 Crew Cab", "Transit Van", "Sprinter Van"],
        typical_capacity: "4-7 passengers",
      },
      "Sales/Office Vehicle": {
        examples: ["Sedan", "SUV", "Crossover"],
        typical_capacity: "Personal/administrative use",
      },
    },
  },

  // ============================================================================
  // CARRIERS (Base Machines)
  // ============================================================================
  "Carriers": {
    description: "Base machines that can accept attachments",
    subcategories: {
      "Skid Steer": {
        examples: ["Bobcat S650", "CAT 272D", "John Deere 332G", "ASV RT-75"],
        typical_capacity: "1800-3500 lb operating capacity",
      },
      "Compact Track Loader": {
        examples: ["Bobcat T770", "CAT 299D", "ASV VT-70"],
        typical_capacity: "2500-4000 lb operating capacity",
      },
      "Mini Excavator": {
        examples: ["Bobcat E35", "CAT 305.5", "Kubota U35"],
        typical_capacity: "3-8 metric tons",
      },
      "Midi Excavator": {
        examples: ["CAT 308", "Bobcat E60", "John Deere 75G"],
        typical_capacity: "8-12 metric tons",
      },
      "Standard Excavator": {
        examples: ["CAT 320", "Komatsu PC200", "John Deere 200G"],
        typical_capacity: "18-24 metric tons",
      },
      "Large Excavator": {
        examples: ["CAT 330", "Komatsu PC360", "John Deere 350G"],
        typical_capacity: "30-40 metric tons",
      },
      "Wheeled Excavator": {
        examples: ["CAT M318F", "Komatsu PW148", "Volvo EW160E"],
        typical_capacity: "Mobile excavators with wheels",
      },
      "Backhoe Loader": {
        examples: ["CAT 420F", "John Deere 310L", "Case 580N"],
        typical_capacity: "Loader front, backhoe rear",
      },
      "Dozer": {
        examples: ["CAT D3", "CAT D5", "CAT D6", "John Deere 850K"],
        typical_capacity: "Small to large track dozers",
      },
      "Forestry Carrier": {
        examples: ["Prinoth Raptor", "ASV Posi-Track RT-120F", "CAT 289D3"],
        typical_capacity: "Purpose-built for forestry work",
      },
      "Tractor": {
        examples: ["John Deere 5075E", "Kubota M7060", "Mahindra 2638"],
        typical_capacity: "Agricultural/utility tractors",
      },
      "Articulated Loader": {
        examples: ["CAT 906M", "John Deere 244L", "Volvo L25H"],
        typical_capacity: "Compact wheel loaders",
      },
    },
  },

  // ============================================================================
  // ATTACHMENTS - Mulching & Cutting
  // ============================================================================
  "Attachments - Mulching & Cutting": {
    description: "Forestry mulchers, brush cutters, and vegetation management attachments",
    subcategories: {
      "Skid Steer Forestry Mulcher": {
        examples: ["Diamond Mowers Skid Pro", "Fecon BH74SS", "Loftness Battle Ax"],
        typical_capacity: "Up to 8\" cutting diameter",
      },
      "Excavator Forestry Mulcher": {
        examples: ["Fecon BH80", "Diamond FTX150", "Denis Cimaf DAH"],
        typical_capacity: "Up to 15\" cutting diameter",
      },
      "Dedicated Forestry Mulcher": {
        examples: ["CAT 259D with mulcher head", "ASV VT-70 High Output"],
        typical_capacity: "Purpose-built mulching systems",
      },
      "Brush Cutter (Rotary)": {
        examples: ["Land Pride RCR1872", "Woods BB72X", "Titan 72\""],
        typical_capacity: "3-6\" cutting diameter",
      },
      "Flail Mower": {
        examples: ["Fecon BH80", "Seppi M BMF"],
        typical_capacity: "Heavy-duty vegetation management",
      },
      "Tree Shear": {
        examples: ["Caterpillar SG24B", "Barko Tree Shears"],
        typical_capacity: "Cuts and gathers trees",
      },
      "Disc Mulcher Head": {
        examples: ["FAE UML/SSL", "Denis Cimaf DAF-180"],
        typical_capacity: "High-speed disc cutting",
      },
      "Drum Mulcher Head": {
        examples: ["Fecon Bullhog", "Diamond Mowers"],
        typical_capacity: "Rotating drum with teeth",
      },
    },
  },

  // ============================================================================
  // ATTACHMENTS - Grapples & Handling
  // ============================================================================
  "Attachments - Grapples & Material Handling": {
    description: "Grapples, forks, and material handling attachments",
    subcategories: {
      "Root Grapple": {
        examples: ["Heavy Hitch Root Grapple", "Titan 72\" Root Grapple"],
        typical_capacity: "3000-8000 lb capacity",
      },
      "Rock Grapple": {
        examples: ["Bradco Rock Grapple", "Land Pride RGA"],
        typical_capacity: "For land clearing with rocks",
      },
      "Log Grapple": {
        examples: ["Pierce Log Grapple", "Caterpillar G315B"],
        typical_capacity: "Timber and log handling",
      },
      "Brush Grapple": {
        examples: ["Titan 72\" Brush Grapple", "TMG BCG72"],
        typical_capacity: "Lightweight debris handling",
      },
      "Rotating Grapple": {
        examples: ["Caterpillar 360° Rotating Grapple"],
        typical_capacity: "360-degree rotation",
      },
      "Demolition Grapple": {
        examples: ["CAT G325B", "Komatsu GP155F"],
        typical_capacity: "Heavy-duty material sorting",
      },
      "Orange Peel Grapple": {
        examples: ["OPG Scrap Grapple"],
        typical_capacity: "Multi-tine scrap handling",
      },
      "Pallet Forks": {
        examples: ["48\" Pallet Forks", "72\" Heavy Duty Forks"],
        typical_capacity: "Material transport",
      },
      "Bale Spear": {
        examples: ["Single Spear", "Double Spear"],
        typical_capacity: "Hay/material handling",
      },
    },
  },

  // ============================================================================
  // ATTACHMENTS - Buckets & Excavation
  // ============================================================================
  "Attachments - Buckets & Excavation": {
    description: "Buckets, rakes, and digging attachments",
    subcategories: {
      "General Purpose Bucket": {
        examples: ["48\" GP Bucket", "60\" GP Bucket", "72\" GP Bucket"],
        typical_capacity: "0.5-2.5 cubic yards",
      },
      "Digging Bucket": {
        examples: ["18\" Digging Bucket", "24\" Heavy Duty Digging"],
        typical_capacity: "Narrow trenching buckets",
      },
      "Grading Bucket": {
        examples: ["72\" Grading Bucket", "96\" Fine Grading"],
        typical_capacity: "Wide, smooth grading work",
      },
      "Rock Bucket": {
        examples: ["Severe Duty Rock Bucket", "HD Rock Bucket"],
        typical_capacity: "Heavy construction duty",
      },
      "Rake Bucket": {
        examples: ["60\" Skeleton Bucket", "Land Clearing Rake"],
        typical_capacity: "Separates debris from soil",
      },
      "Tilt Bucket": {
        examples: ["Hydraulic Tilt Bucket 60°"],
        typical_capacity: "Angled grading work",
      },
      "4-in-1 Bucket": {
        examples: ["Multi-Purpose 4-in-1"],
        typical_capacity: "Clamshell, dozer, scraper, grapple",
      },
      "Ditching Bucket": {
        examples: ["Trapezoid Ditching Bucket"],
        typical_capacity: "Drainage work",
      },
    },
  },

  // ============================================================================
  // ATTACHMENTS - Stump & Root
  // ============================================================================
  "Attachments - Stump & Root Work": {
    description: "Stump grinders and root cutting attachments",
    subcategories: {
      "Skid Steer Stump Grinder": {
        examples: ["Bradco SG13", "Lowe BP210", "Fecon Stumpex"],
        typical_capacity: "Up to 24\" stump diameter",
      },
      "Excavator Stump Grinder": {
        examples: ["Caterpillar SG18B", "FAE SFM/EX"],
        typical_capacity: "Up to 36\" stump diameter",
      },
      "Auger - Stump Plunge": {
        examples: ["Auger Torque Earth Drill", "Skid Steer Auger 36\""],
        typical_capacity: "Drilling around stumps",
      },
      "Ripper Tooth": {
        examples: ["Single Shank Ripper", "Multi-Shank Ripper"],
        typical_capacity: "Breaking up hard ground/roots",
      },
      "Root Saw": {
        examples: ["Excavator Root Cutting Saw"],
        typical_capacity: "Cuts large roots underground",
      },
    },
  },

  // ============================================================================
  // ATTACHMENTS - Specialty
  // ============================================================================
  "Attachments - Specialty": {
    description: "Specialized attachments for unique applications",
    subcategories: {
      "Land Plane / Box Blade": {
        examples: ["72\" Land Plane", "Box Blade 6ft"],
        typical_capacity: "Finish grading",
      },
      "Trencher": {
        examples: ["48\" Chain Trencher", "Excavator Trencher"],
        typical_capacity: "Utility line installation",
      },
      "Auger Drill": {
        examples: ["12\" Auger Bit", "24\" Tree Planting Auger"],
        typical_capacity: "Post holes, tree planting",
      },
      "Mower Attachment": {
        examples: ["Finish Mower 60\"", "Flail Mower 72\""],
        typical_capacity: "Lawn/pasture maintenance",
      },
      "Snowplow / Pusher": {
        examples: ["8ft Snow Pusher", "Skid Steer Plow"],
        typical_capacity: "Winter maintenance",
      },
      "Breaker / Hammer": {
        examples: ["Hydraulic Breaker 1000 lb", "Excavator Hammer"],
        typical_capacity: "Concrete/rock breaking",
      },
      "Compactor / Roller": {
        examples: ["Drum Compactor", "Plate Compactor"],
        typical_capacity: "Soil compaction",
      },
      "Sweeper / Broom": {
        examples: ["Angle Broom 72\"", "Pickup Sweeper"],
        typical_capacity: "Cleanup work",
      },
    },
  },

  // ============================================================================
  // AERIAL EQUIPMENT
  // ============================================================================
  "Aerial Equipment": {
    description: "Bucket trucks, lifts, and aerial access equipment",
    subcategories: {
      "Bucket Truck - Over Center": {
        examples: ["Altec AT37G", "Versalift VO-255", "Terex Hi-Ranger"],
        typical_capacity: "40-65 ft working height",
      },
      "Bucket Truck - Rear Mount": {
        examples: ["Altec LRV-56", "Terex Telelect"],
        typical_capacity: "55-75 ft working height",
      },
      "Spider Lift": {
        examples: ["Teupen Leo 30T", "Platform Basket 23.90"],
        typical_capacity: "50-90 ft with tracked mobility",
      },
      "Articulating Boom Lift": {
        examples: ["JLG 600AJ", "Genie Z-60/34"],
        typical_capacity: "60-125 ft working height",
      },
      "Straight Boom Lift": {
        examples: ["JLG 600S", "Genie S-65"],
        typical_capacity: "60-185 ft working height",
      },
      "Scissor Lift": {
        examples: ["Genie GS-2632", "JLG 2630ES"],
        typical_capacity: "19-40 ft platform height",
      },
      "Towable Boom Lift": {
        examples: ["Nifty TM34T", "Genie TZ-50"],
        typical_capacity: "34-50 ft working height",
      },
      "Material Lift": {
        examples: ["Genie Super Tower", "JLG Lift 250"],
        typical_capacity: "Material lifting to 24 ft",
      },
    },
  },

  // ============================================================================
  // CHIPPERS & GRINDERS
  // ============================================================================
  "Chippers & Grinders": {
    description: "Wood chippers, tub grinders, and biomass processing",
    subcategories: {
      "Tow-Behind Chipper": {
        examples: ["Vermeer BC600XL", "Bandit 65XP", "Morbark Beever 610"],
        typical_capacity: "6-12\" diameter capacity",
      },
      "Self-Propelled Chipper": {
        examples: ["Vermeer BC1800XL", "Bandit 3090 Track"],
        typical_capacity: "18-25\" diameter capacity",
      },
      "Whole Tree Chipper": {
        examples: ["Morbark 40/36", "Peterson 5900"],
        typical_capacity: "20-36\" diameter capacity",
      },
      "Drum Chipper": {
        examples: ["Bandit 1590XP", "Vermeer BC1500XL"],
        typical_capacity: "Large capacity drum",
      },
      "Disc Chipper": {
        examples: ["Bandit 3090", "Morbark Disc Chipper"],
        typical_capacity: "High-speed disc cutting",
      },
      "Tub Grinder": {
        examples: ["Vermeer TG7000", "Morbark 1300", "Diamond Z DZ3000"],
        typical_capacity: "Process stumps, logs, debris",
      },
      "Horizontal Grinder": {
        examples: ["Morbark 4600XL", "Peterson 5710D"],
        typical_capacity: "Large-scale biomass processing",
      },
      "Hand-Fed Chipper": {
        examples: ["Vermeer BC600XL", "DR 18.0 Rapid-Feed"],
        typical_capacity: "6-9\" diameter capacity",
      },
    },
  },

  // ============================================================================
  // STUMP GRINDERS - Self-Propelled
  // ============================================================================
  "Stump Grinders - Self-Propelled": {
    description: "Dedicated walk-behind and self-propelled stump grinders",
    subcategories: {
      "Walk-Behind Grinder": {
        examples: ["Vermeer SC252", "Rayco RG13", "Bandit SG-13"],
        typical_capacity: "13-25 HP, up to 18\" stumps",
      },
      "Towable Grinder": {
        examples: ["Vermeer SC60TX", "Bandit 2100SP"],
        typical_capacity: "60-100 HP, up to 30\" stumps",
      },
      "Track Grinder": {
        examples: ["Vermeer CTX160", "Bandit 2550 Track"],
        typical_capacity: "Remote control, extreme access",
      },
      "Large Self-Propelled": {
        examples: ["Vermeer SC802", "Rayco RG100", "Bandit 5500"],
        typical_capacity: "100+ HP, 40\"+ stumps",
      },
      "Compact Track Grinder": {
        examples: ["Vermeer SC30TX", "Rayco RG37 Super Jr"],
        typical_capacity: "30-37 HP, tight access",
      },
    },
  },

  // ============================================================================
  // CRANES & LIFTING
  // ============================================================================
  "Cranes & Lifting Equipment": {
    description: "Cranes, hoists, and heavy lifting equipment",
    subcategories: {
      "Knuckle Boom Crane": {
        examples: ["Palfinger PK 32080", "Fassi F155A", "Hiab 088"],
        typical_capacity: "3-20 ton-meters",
      },
      "Service Crane": {
        examples: ["Manitex 22101S", "Terex TC20"],
        typical_capacity: "Truck-mounted cranes",
      },
      "Mobile Crane": {
        examples: ["Link-Belt HTC-8640", "Grove GRT8100"],
        typical_capacity: "40-100 ton capacity",
      },
      "Grapple Crane": {
        examples: ["Kesla 2112T", "Palfinger Epsilon M80Z"],
        typical_capacity: "Forestry material handling",
      },
      "Portable Winch": {
        examples: ["PCW5000", "Warn 12000"],
        typical_capacity: "3000-12000 lb capacity",
      },
      "Cable Winch": {
        examples: ["Lewis Winch", "Portable Capstan Winch"],
        typical_capacity: "Tree rigging and pulling",
      },
    },
  },

  // ============================================================================
  // TRAILERS
  // ============================================================================
  "Trailers": {
    description: "All trailer types for equipment and material transport",
    subcategories: {
      "Equipment Trailer - Standard": {
        examples: ["18' Equipment Trailer", "20' Tandem Axle"],
        typical_capacity: "7000-14000 GVWR",
      },
      "Equipment Trailer - Heavy Duty": {
        examples: ["22' Heavy Equipment", "Gooseneck Trailer"],
        typical_capacity: "14000-20000+ GVWR",
      },
      "Lowboy Trailer": {
        examples: ["30 Ton Lowboy", "3-Axle Lowboy"],
        typical_capacity: "For large excavators/dozers",
      },
      "Dump Trailer": {
        examples: ["6x12 Dump", "7x14 Dump Trailer"],
        typical_capacity: "5-8 cubic yard capacity",
      },
      "Chip Trailer": {
        examples: ["Live Bottom Chip Trailer", "Walking Floor"],
        typical_capacity: "45-100 cubic yard capacity",
      },
      "Enclosed Trailer": {
        examples: ["6x12 Enclosed", "8.5x20 Enclosed"],
        typical_capacity: "Tool/equipment storage",
      },
      "Utility Trailer": {
        examples: ["5x8 Utility", "6x12 Landscape"],
        typical_capacity: "2990-7000 GVWR",
      },
      "Flatbed Trailer": {
        examples: ["20' Deckover", "24' Flatbed"],
        typical_capacity: "10000-14000 GVWR",
      },
      "Log Trailer": {
        examples: ["Pole Trailer", "Logging Trailer"],
        typical_capacity: "Log and timber transport",
      },
    },
  },

  // ============================================================================
  // CHAINSAWS & HANDHELD EQUIPMENT
  // ============================================================================
  "Chainsaws & Handheld Equipment": {
    description: "Chainsaws, pole saws, and handheld power tools",
    subcategories: {
      "Professional Chainsaw - Small": {
        examples: ["Stihl MS 170", "Husqvarna 450"],
        typical_capacity: "30-40cc, up to 16\" bar",
      },
      "Professional Chainsaw - Medium": {
        examples: ["Stihl MS 261", "Husqvarna 562XP"],
        typical_capacity: "50-60cc, 16-20\" bar",
      },
      "Professional Chainsaw - Large": {
        examples: ["Stihl MS 462", "Husqvarna 572XP"],
        typical_capacity: "70-80cc, 20-28\" bar",
      },
      "Professional Chainsaw - Extra Large": {
        examples: ["Stihl MS 881", "Husqvarna 3120XP"],
        typical_capacity: "120+cc, 36-60\" bar",
      },
      "Climbing Chainsaw": {
        examples: ["Stihl MS 201T", "Husqvarna T540XP"],
        typical_capacity: "Top-handle, lightweight",
      },
      "Battery Chainsaw": {
        examples: ["Stihl MSA 220", "Husqvarna 540i XP"],
        typical_capacity: "Battery-powered professional",
      },
      "Pole Saw": {
        examples: ["Stihl HT 133", "Echo PPT-266"],
        typical_capacity: "Extended reach pruning",
      },
      "String Trimmer": {
        examples: ["Stihl FS 131", "Echo SRM-2620"],
        typical_capacity: "Commercial-grade trimmer",
      },
      "Hedge Trimmer": {
        examples: ["Stihl HS 82 T", "Echo HC-152"],
        typical_capacity: "Commercial hedge work",
      },
      "Blower": {
        examples: ["Stihl BR 700", "Echo PB-9010T"],
        typical_capacity: "Backpack blower",
      },
      "Brush Cutter": {
        examples: ["Stihl FS 560", "Echo SRM-420"],
        typical_capacity: "Heavy-duty clearing saw",
      },
    },
  },

  // ============================================================================
  // CLIMBING & RIGGING EQUIPMENT
  // ============================================================================
  "Climbing & Rigging Equipment": {
    description: "Climbing gear, ropes, rigging equipment, and safety gear",
    subcategories: {
      "Climbing Harness": {
        examples: ["Petzl Sequoia SRT", "Buckingham Ergovation"],
        typical_capacity: "Full-body harness",
      },
      "Climbing Rope": {
        examples: ["12mm Climbing Line", "1/2\" Stable Braid"],
        typical_capacity: "200 ft climbing rope",
      },
      "Rigging Rope": {
        examples: ["3/4\" Double Braid", "5/8\" Stable Braid"],
        typical_capacity: "150-200 ft rigging line",
      },
      "Rigging Block / Pulley": {
        examples: ["Notch Block 4000lb", "DMM Pinto Pulley"],
        typical_capacity: "Friction management",
      },
      "Carabiner / Hardware": {
        examples: ["DMM Boa", "Petzl Oxan Screw-Link"],
        typical_capacity: "Connectors and hardware",
      },
      "Friction Device": {
        examples: ["Petzl Zig Zag", "ART SpiderJack"],
        typical_capacity: "Descenders and progress capture",
      },
      "Tree Strap / Sling": {
        examples: ["Notch Sling 5000lb", "Yale ½\" Sling"],
        typical_capacity: "Anchor and rigging slings",
      },
      "Throw Line & Weight": {
        examples: ["Zing-It Throw Line", "16oz Throw Bag"],
        typical_capacity: "Access and setup",
      },
    },
  },

  // ============================================================================
  // SAFETY EQUIPMENT
  // ============================================================================
  "Safety Equipment": {
    description: "Personal protective equipment and safety gear",
    subcategories: {
      "Helmet System": {
        examples: ["Petzl Vertex", "Kask Super Plasma"],
        typical_capacity: "Hard hat with visor and muffs",
      },
      "Chainsaw Chaps": {
        examples: ["Husqvarna Pro Chaps", "Stihl Chainsaw Pants"],
        typical_capacity: "Cut-resistant leg protection",
      },
      "Gloves": {
        examples: ["Mechanix M-Pact", "Husqvarna Technical"],
        typical_capacity: "Hand protection",
      },
      "Safety Glasses": {
        examples: ["Uvex Genesis", "Oakley Turbine"],
        typical_capacity: "Eye protection",
      },
      "Boots": {
        examples: ["Haix Protector Forest", "Stihl Pro Logger"],
        typical_capacity: "Steel toe, cut-resistant",
      },
      "First Aid Kit": {
        examples: ["Trauma Kit", "OSHA Compliant Kit"],
        typical_capacity: "Jobsite medical supplies",
      },
      "Fire Extinguisher": {
        examples: ["ABC 10lb", "Vehicle Extinguisher"],
        typical_capacity: "Fire safety",
      },
      "Traffic Cones / Safety Barriers": {
        examples: ["36\" Safety Cone", "Barrier Tape"],
        typical_capacity: "Site control",
      },
    },
  },

  // ============================================================================
  // SUPPORT EQUIPMENT
  // ============================================================================
  "Support Equipment": {
    description: "Generators, air compressors, pumps, and miscellaneous tools",
    subcategories: {
      "Generator - Portable": {
        examples: ["Honda EU7000iS", "Champion 7500W"],
        typical_capacity: "3000-10000 watts",
      },
      "Generator - Towable": {
        examples: ["Generac 20kW", "Kohler 25kW"],
        typical_capacity: "15-50 kW trailer-mounted",
      },
      "Air Compressor - Portable": {
        examples: ["Dewalt 6 Gal", "Makita MAC700"],
        typical_capacity: "1-6 gallon tank",
      },
      "Air Compressor - Towable": {
        examples: ["Atlas Copco XAS185", "Sullair 185CFM"],
        typical_capacity: "185-375 CFM diesel",
      },
      "Water Pump": {
        examples: ["Honda WB30", "Tsurumi 3\" Pump"],
        typical_capacity: "2-6\" discharge diameter",
      },
      "Pressure Washer": {
        examples: ["Simpson MS61084", "Honda GX390"],
        typical_capacity: "3000-4000 PSI commercial",
      },
      "Welder": {
        examples: ["Lincoln Electric Ranger 225", "Miller Bobcat 250"],
        typical_capacity: "Engine-driven welder",
      },
      "Fuel Tank / Transfer Tank": {
        examples: ["150 Gal Diesel Tank", "Transfer Flow Tank"],
        typical_capacity: "Onboard/auxiliary fuel storage",
      },
      "Tool Chest / Storage": {
        examples: ["Milwaukee PACKOUT", "DeWalt ToughSystem"],
        typical_capacity: "Job box, gang box",
      },
    },
  },

  // ============================================================================
  // TOOLS & ACCESSORIES
  // ============================================================================
  "Tools & Accessories": {
    description: "Hand tools, power tools, and miscellaneous equipment",
    subcategories: {
      "Power Tool - Drill/Driver": {
        examples: ["Milwaukee M18 Fuel", "DeWalt 20V Max"],
        typical_capacity: "Cordless drill/impact",
      },
      "Power Tool - Grinder": {
        examples: ["Milwaukee M18 Grinder", "Makita 9\" Angle Grinder"],
        typical_capacity: "Angle grinder 4-9\"",
      },
      "Power Tool - Saw": {
        examples: ["Milwaukee M18 Circular Saw", "DeWalt Miter Saw"],
        typical_capacity: "Circular, miter, reciprocating",
      },
      "Hand Tools": {
        examples: ["Socket Set", "Wrenches", "Pliers", "Hammers"],
        typical_capacity: "Basic hand tool collection",
      },
      "Ladders": {
        examples: ["Werner 32' Extension", "Little Giant M26"],
        typical_capacity: "Extension and multi-position",
      },
      "Tarps / Ground Protection": {
        examples: ["20x30 Canvas Tarp", "Ground Protection Mat"],
        typical_capacity: "Site protection",
      },
      "Scales / Measuring": {
        examples: ["Log Scale", "Tape Measure 100'"],
        typical_capacity: "Measurement tools",
      },
      "GPS / Survey Equipment": {
        examples: ["Garmin GPSMAP", "TruPulse Laser Rangefinder"],
        typical_capacity: "Location and measurement",
      },
    },
  },

  // ============================================================================
  // OFFICE & SALES
  // ============================================================================
  "Office & Sales Equipment": {
    description: "Computers, printers, software, and office equipment",
    subcategories: {
      "Computer - Desktop": {
        examples: ["Dell OptiPlex", "HP EliteDesk", "iMac"],
        typical_capacity: "Office workstation",
      },
      "Computer - Laptop": {
        examples: ["MacBook Pro", "Dell Latitude", "ThinkPad"],
        typical_capacity: "Mobile computing",
      },
      "Tablet": {
        examples: ["iPad", "Surface Pro", "Samsung Galaxy Tab"],
        typical_capacity: "Field and office tablet",
      },
      "Phone - Mobile": {
        examples: ["iPhone", "Samsung Galaxy", "Google Pixel"],
        typical_capacity: "Business phone",
      },
      "Phone - Desk": {
        examples: ["VoIP Desk Phone", "Conference Phone"],
        typical_capacity: "Office phone system",
      },
      "Printer / Scanner": {
        examples: ["HP OfficeJet Pro", "Brother MFC"],
        typical_capacity: "All-in-one printer/scanner",
      },
      "Software License": {
        examples: ["Microsoft 365", "Adobe Creative Cloud", "QuickBooks"],
        typical_capacity: "Annual software subscription",
      },
      "Camera / Drone": {
        examples: ["Canon EOS", "DJI Mavic 3", "GoPro"],
        typical_capacity: "Documentation and marketing",
      },
      "Radio / Communication": {
        examples: ["Motorola Two-Way", "Midland GMRS"],
        typical_capacity: "Crew communication",
      },
    },
  },
};

/**
 * Helper function to get all category names
 */
export function getEquipmentCategories(): string[] {
  return Object.keys(EQUIPMENT_TAXONOMY);
}

/**
 * Helper function to get subcategories for a given category
 */
export function getEquipmentSubcategories(category: string): string[] {
  const categoryData = EQUIPMENT_TAXONOMY[category as keyof typeof EQUIPMENT_TAXONOMY];
  if (!categoryData) return [];
  return Object.keys(categoryData.subcategories);
}

/**
 * Helper function to get examples for a given subcategory
 */
export function getSubcategoryExamples(category: string, subcategory: string): string[] {
  const categoryData = EQUIPMENT_TAXONOMY[category as keyof typeof EQUIPMENT_TAXONOMY];
  if (!categoryData) return [];
  const subcategoryData = categoryData.subcategories[subcategory as keyof typeof categoryData.subcategories];
  if (!subcategoryData) return [];
  return subcategoryData.examples;
}

/**
 * Helper function to get all data for a subcategory
 */
export function getSubcategoryData(category: string, subcategory: string) {
  const categoryData = EQUIPMENT_TAXONOMY[category as keyof typeof EQUIPMENT_TAXONOMY];
  if (!categoryData) return null;
  return categoryData.subcategories[subcategory as keyof typeof categoryData.subcategories];
}

/**
 * Search equipment taxonomy by keyword
 */
export function searchEquipmentTaxonomy(searchTerm: string): Array<{
  category: string;
  subcategory: string;
  examples: string[];
}> {
  const results: Array<{ category: string; subcategory: string; examples: string[] }> = [];
  const lowerSearch = searchTerm.toLowerCase();

  for (const [category, categoryData] of Object.entries(EQUIPMENT_TAXONOMY)) {
    for (const [subcategory, subcategoryData] of Object.entries(categoryData.subcategories)) {
      const matchesSubcategory = subcategory.toLowerCase().includes(lowerSearch);
      const matchesExamples = subcategoryData.examples.some((ex) =>
        ex.toLowerCase().includes(lowerSearch)
      );

      if (matchesSubcategory || matchesExamples) {
        results.push({
          category,
          subcategory,
          examples: subcategoryData.examples,
        });
      }
    }
  }

  return results;
}
