import { internalMutation } from "./_generated/server";

// Seed the knowledge base with core TreeShop documentation
export const seedCoreDocumentation = internalMutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existingDocs = await ctx.db
      .query("knowledgeDocuments")
      .withIndex("by_system", (q) => q.eq("isSystemDoc", true))
      .collect();

    if (existingDocs.length > 0) {
      console.log("Knowledge base already seeded");
      return { message: "Already seeded", count: existingDocs.length };
    }

    const documents = [
      // Getting Started
      {
        title: "TreeShop Platform Overview",
        slug: "platform-overview",
        category: "Getting Started",
        content: `TreeShop is a complete business-in-a-box operating system for professional tree service companies.

The platform helps you:
- Create accurate pricing estimates using the TreeShop Score methodology
- Manage customers, projects, and work orders
- Track time and equipment usage
- Generate professional proposals and invoices
- Analyze business performance

TreeShop follows the DOC workflow:
D - Discovery (Lead management)
O - Offer (Proposal creation with pricing)
C - Complete (Work order execution with time tracking)
C - Collect (Invoice and payment)

This systematic approach ensures nothing falls through the cracks and every job is profitable.`,
        tags: ["getting-started", "overview", "workflow"],
        priority: 10,
      },

      // TreeShop Score
      {
        title: "TreeShop Score Methodology",
        slug: "treeshop-score",
        category: "Pricing",
        content: `TreeShop Score is a point-based system that quantifies work complexity across all tree service types.

**How it works:**
1. Calculate base score from work volume (acres, trees, stumps, etc.)
2. Apply AFISS multiplier for site complexity
3. Divide by production rate (Points Per Hour) to get time estimate
4. Multiply by billing rate to get price

**Service-Specific Formulas:**

Forestry Mulching: Base Score = DBH (inches) × Acreage
Stump Grinding: Base Score = Diameter² × (Height + Depth)
Tree Removal: Base Score = Height × Crown Radius × 2 × DBH ÷ 12
Tree Trimming: Base Score = Tree Removal Score × Trim Percentage Factor

The TreeShop Score approach eliminates guesswork and ensures consistent, profitable pricing.`,
        tags: ["pricing", "treeshop-score", "methodology", "formulas"],
        priority: 10,
      },

      // AFISS System
      {
        title: "AFISS Complexity Factors",
        slug: "afiss-factors",
        category: "Pricing",
        content: `AFISS stands for Access, Facilities, Irregularities, Site, and Safety - a comprehensive system of 80+ factors that adjust pricing for job complexity.

**Access Factors:**
- Narrow gate (<8 ft): +12%
- No equipment access: +50%
- Soft/muddy ground: +15%
- Steep slope (>15°): +20%
- Long drive (>2 hrs): +10%

**Facilities:**
- Power lines touching work area: +30%
- Power lines nearby (<10 ft): +15%
- Building within 50 ft: +20%
- Pool or high-value target: +30%

**Irregularities:**
- Dead/hazard trees: +15%
- Leaning trees: +20%
- Hardwood species: +15%
- Rotten stump: -15% (easier)

**Site Conditions:**
- Wetlands in work area: +20%
- Rocky ground: +10-25%
- Protected species habitat: +30%

**Safety:**
- High voltage lines: +50%
- Confined space work: +25%
- Emergency/hazard situation: +30%

Apply factors additively: 1.0 + 0.12 + 0.15 + 0.20 = 1.47× multiplier`,
        tags: ["pricing", "afiss", "complexity", "factors"],
        priority: 9,
      },

      // Loadouts
      {
        title: "Loadouts: Equipment & Crew Configurations",
        slug: "loadouts-guide",
        category: "Equipment",
        content: `A loadout is a specific combination of equipment and crew members configured for a service type.

**Loadout Components:**
1. Equipment (with hourly costs)
2. Crew members (with true labor costs including burden)
3. Production rate (Points Per Hour for each service type)
4. Billing rates at different margins

**Example Loadout:**
Name: "Forestry Mulching Team A"
- Equipment: CAT 265 Mulcher, F450 Truck, Support trailer
- Crew: Operator (Tier 3), Ground Crew (Tier 2)
- Production Rate: 1.4 PPH for forestry mulching
- Total Cost: $246/hour
- Billing Rate (50% margin): $492/hour

Loadouts allow you to:
- Calculate exact job costs
- Track crew performance
- Compare profitability across configurations
- Schedule resources efficiently

Create multiple loadouts for different service types and crew capabilities.`,
        tags: ["equipment", "loadouts", "crew", "resources"],
        priority: 8,
      },

      // Profit Margin Formula
      {
        title: "Profit Margin Pricing Formula",
        slug: "margin-formula",
        category: "Formulas",
        content: `The correct formula for converting cost to price with a target margin is:

Selling Price = Cost ÷ (1 - Desired Margin%)

**NOT:** Cost × (1 + Markup%) ← WRONG WAY

**Why this formula?**
If you want 50% profit margin, you want profit to be 50% of the selling price, so costs must be the other 50%.
Therefore: Cost ÷ 0.50 = Price

**Conversion Table:**
30% margin → Cost ÷ 0.70 = 1.43x multiplier
40% margin → Cost ÷ 0.60 = 1.67x multiplier
50% margin → Cost ÷ 0.50 = 2.0x multiplier
60% margin → Cost ÷ 0.40 = 2.5x multiplier
70% margin → Cost ÷ 0.70 = 3.33x multiplier

**Example:**
Loadout cost: $246.43/hour
Target margin: 50%
Billing rate: $246.43 ÷ 0.50 = $492.86/hour

**Proof:**
Revenue: $492.86
Cost: $246.43
Profit: $246.43
Margin: $246.43 ÷ $492.86 = 50% ✓`,
        tags: ["pricing", "formulas", "margin", "profit"],
        priority: 9,
      },

      // Equipment Cost Calculation
      {
        title: "Equipment Hourly Cost Calculation",
        slug: "equipment-costs",
        category: "Formulas",
        content: `Equipment costs have two components: Ownership and Operating.

**Ownership Cost Per Hour:**
(Purchase Price ÷ Useful Life Years + Annual Finance + Annual Insurance + Annual Registration) ÷ Annual Hours

**Operating Cost Per Hour:**
(Fuel Cost Per Hour + Annual Maintenance + Annual Repairs) ÷ Annual Hours

**Total Equipment Cost = Ownership + Operating**

**Example - CAT 265 Mulcher:**
Purchase: $325,000
Useful Life: 7 years
Finance (5%): $16,250/year
Insurance: $8,000/year
Registration: $800/year
Annual Hours: 1,500

Ownership/Hour = ($325,000 ÷ 7 + $16,250 + $8,000 + $800) ÷ 1,500 = $47.65/hour

Fuel: 9 gal/hr × $3.75 = $33.75/hour
Maintenance: $40,000 ÷ 1,500 = $26.67/hour
Repairs: $10,000 ÷ 1,500 = $6.67/hour

Operating/Hour = $67.09/hour

Total: $47.65 + $67.09 = $114.74/hour`,
        tags: ["equipment", "formulas", "costs", "calculations"],
        priority: 7,
      },

      // Employee Burden Cost
      {
        title: "Employee True Labor Cost",
        slug: "labor-costs",
        category: "Formulas",
        content: `Employee costs include more than just base wage - you must account for burden (taxes, insurance, overhead).

**Formula:**
True Cost Per Hour = Base Hourly Rate × Burden Multiplier

**Standard Burden Multiplier: 1.7x**
This includes:
- 1.0x = Base wage
- 0.3x = Tax burden (payroll taxes, workers comp, unemployment)
- 0.4x = Overhead (insurance, PTO, training, non-billable time)

**Position-Specific Multipliers:**
Entry Ground Crew: Base × 1.6
Experienced Climber: Base × 1.7
Crew Leader: Base × 1.8
Certified Arborist: Base × 1.9
Specialized Operator: Base × 2.0

**Example:**
Employee base wage: $35/hour
Burden multiplier: 1.7x
True cost: $35 × 1.7 = $59.50/hour

Always use true cost (not base wage) when calculating loadout costs and pricing.`,
        tags: ["labor", "formulas", "costs", "employees"],
        priority: 7,
      },

      // DOC Workflow
      {
        title: "DOC Workflow: Lead to Cash",
        slug: "doc-workflow",
        category: "Workflows",
        content: `TreeShop follows the DOC workflow - four stages from initial contact to payment:

**D - DISCOVERY (Lead)**
- Customer inquiry (website, phone, referral)
- Initial qualification
- Site assessment scheduling
- Property address and drive time calculation

**O - OFFER (Proposal)**
- Calculate TreeShop Score
- Apply AFISS factors
- Select loadout
- Generate price range
- Present professional proposal
- Digital signature capture

**C - COMPLETE (Work Order)**
- Schedule crew and equipment
- Field execution with time tracking
- GPS verification
- Photo documentation
- Customer walkthrough and sign-off

**C - COLLECT (Invoice)**
- Invoice generation from completed work
- Payment collection
- Review request automation
- Customer satisfaction tracking

Each stage has specific actions and data capture to ensure profitability and customer satisfaction.`,
        tags: ["workflow", "doc", "process", "stages"],
        priority: 8,
      },

      // Creating Proposals
      {
        title: "How to Create a Proposal",
        slug: "creating-proposals",
        category: "Workflows",
        content: `Step-by-step guide to creating proposals in TreeShop:

1. **Start from a Lead or Project**
   Navigate to Projects → Select project → Click "Create Proposal"

2. **Select Service Type**
   Choose: Forestry Mulching, Stump Grinding, Land Clearing, Tree Removal, or Tree Trimming

3. **Enter Work Volume**
   - Forestry Mulching: Acreage + DBH package
   - Stump Grinding: Number of stumps with diameters
   - Land Clearing: Project type + intensity
   - Tree Removal: Tree dimensions
   - Tree Trimming: Tree dimensions + trim percentage

4. **Apply AFISS Factors**
   Select applicable complexity factors from checklist
   System automatically calculates multiplier

5. **Select Loadout**
   Choose crew/equipment configuration
   System calculates time estimate and cost

6. **Review Price Range**
   See low (30% margin) to high (50% margin) estimates
   Adjust if needed based on market conditions

7. **Add Details**
   - Scope of work description
   - What's included
   - What's NOT included
   - Special terms or conditions

8. **Generate and Send**
   - Preview PDF
   - Send via email or print
   - Track when viewed
   - Receive notification when signed

Target: 70% close rate on properly presented proposals.`,
        tags: ["proposals", "workflow", "how-to", "pricing"],
        priority: 9,
      },

      // FAQ
      {
        title: "Frequently Asked Questions",
        slug: "faq",
        category: "FAQs",
        content: `**Q: What is TreeShop Score?**
A: A point-based system that quantifies work complexity for accurate pricing. Each service type has a specific formula.

**Q: What are AFISS factors?**
A: Access, Facilities, Irregularities, Site, Safety - 80+ complexity factors that adjust pricing. Apply them additively.

**Q: How do I price a job?**
A: 1) Calculate base TreeShop Score, 2) Apply AFISS multiplier, 3) Divide by production rate for hours, 4) Multiply by billing rate for price.

**Q: What's a loadout?**
A: A specific combination of equipment and crew configured for a service type, with known costs and production rates.

**Q: What's the difference between margin and markup?**
A: Margin = profit as % of selling price. Markup = profit as % of cost. Always use margin formula: Price = Cost ÷ (1 - Margin%).

**Q: How do I calculate equipment costs?**
A: Ownership (purchase ÷ years + finance + insurance ÷ hours) + Operating (fuel + maintenance + repairs ÷ hours).

**Q: What's the employee burden multiplier?**
A: Usually 1.7x base wage. Accounts for taxes (0.3x) and overhead (0.4x). Use true cost (base × 1.7) for pricing.

**Q: What's the DOC workflow?**
A: Discovery (Lead) → Offer (Proposal) → Complete (Work Order) → Collect (Invoice). TreeShop's systematic approach to profitable jobs.`,
        tags: ["faq", "questions", "help"],
        priority: 6,
      },
    ];

    // Insert all documents
    const insertedIds = [];
    for (const doc of documents) {
      const wordCount = doc.content.split(/\s+/).length;
      const excerpt = doc.content.substring(0, 200);

      const id = await ctx.db.insert("knowledgeDocuments", {
        organizationId: undefined, // Global system docs
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        subcategory: undefined,
        content: doc.content,
        contentType: "text",
        excerpt,
        sourceUrl: undefined,
        sourceType: "Manual Entry",
        lastScraped: undefined,
        wordCount,
        tags: doc.tags,
        relatedServiceTypes: undefined,
        searchKeywords: undefined,
        priority: doc.priority,
        isPublished: true,
        isSystemDoc: true,
        viewCount: 0,
        helpfulCount: 0,
        unhelpfulCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: "system",
      });

      insertedIds.push(id);
    }

    return {
      message: "Knowledge base seeded successfully",
      count: insertedIds.length,
      documentIds: insertedIds,
    };
  },
});
