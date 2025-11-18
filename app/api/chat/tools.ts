import { tool } from 'ai';
import { z } from 'zod';

// Define tools that the AI can call
export const chatTools = {
  // Navigate to a page
  navigateToPage: tool({
    description: 'Navigate the user to a specific page in TreeShop',
    parameters: z.object({
      path: z.string().describe('The path to navigate to, e.g., /dashboard/leads'),
      reason: z.string().describe('Why navigating to this page'),
    }),
    execute: async ({ path, reason }) => {
      return {
        action: 'navigate',
        path,
        message: `Navigating to ${path}: ${reason}`,
      };
    },
  }),

  // Search for a customer
  searchCustomer: tool({
    description: 'Search for a customer by name or email',
    parameters: z.object({
      query: z.string().describe('Customer name or email to search for'),
    }),
    execute: async ({ query }) => {
      // In production, this would call Convex
      return {
        action: 'search',
        query,
        message: `Searching for customer: ${query}`,
      };
    },
  }),

  // Calculate TreeShop Score
  calculateScore: tool({
    description: 'Calculate TreeShop Score for a project',
    parameters: z.object({
      serviceType: z.enum(['forestry-mulching', 'stump-grinding', 'tree-removal', 'land-clearing']),
      workVolume: z.object({
        acres: z.number().optional(),
        dbh: z.number().optional(),
        stumps: z.array(z.object({
          diameter: z.number(),
          height: z.number(),
          depth: z.number(),
        })).optional(),
      }),
    }),
    execute: async ({ serviceType, workVolume }) => {
      // Calculate based on service type
      let baseScore = 0;

      if (serviceType === 'forestry-mulching' && workVolume.acres && workVolume.dbh) {
        baseScore = workVolume.acres * workVolume.dbh;
      } else if (serviceType === 'stump-grinding' && workVolume.stumps) {
        baseScore = workVolume.stumps.reduce((sum, stump) => {
          return sum + (stump.diameter ** 2) * (stump.height + stump.depth);
        }, 0);
      }

      return {
        action: 'calculate',
        serviceType,
        baseScore,
        message: `Base TreeShop Score: ${baseScore} points`,
      };
    },
  }),

  // Get AFISS factors
  getAfissFactors: tool({
    description: 'Get list of AFISS complexity factors for a category',
    parameters: z.object({
      category: z.enum(['access', 'facilities', 'irregularities', 'site', 'safety', 'all']),
    }),
    execute: async ({ category }) => {
      const factors = {
        access: [
          'Narrow gate (<8 ft): +12%',
          'No equipment access: +50%',
          'Soft/muddy ground: +15%',
          'Steep slope (>15°): +20%',
        ],
        facilities: [
          'Power lines touching: +30%',
          'Power lines nearby: +15%',
          'Building within 50 ft: +20%',
          'Pool or high-value target: +30%',
        ],
        // ... more categories
      };

      return {
        action: 'afiss-info',
        category,
        factors: factors[category as keyof typeof factors] || [],
      };
    },
  }),
};

// Zod is needed for tool parameters
export type ChatTools = typeof chatTools;
