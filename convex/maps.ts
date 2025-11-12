import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOrganization } from "./lib/auth";

/**
 * Get all saved drawings for the current organization
 */
export const getSavedDrawings = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    const drawings = await ctx.db
      .query("savedDrawings")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .order("desc")
      .take(100);

    return drawings;
  },
});

/**
 * Get active job locations for map display
 */
export const getActiveJobLocations = query({
  handler: async (ctx) => {
    const org = await getOrganization(ctx);

    // Get projects in Work Order status with coordinates
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization", (q) => q.eq("organizationId", org._id))
      .filter((q) => q.eq(q.field("status"), "Work Order"))
      .collect();

    // Filter for projects with coordinates and map to location data
    return projects
      .filter((p) => p.coordinates)
      .map((p) => ({
        _id: p._id,
        latitude: p.coordinates!.lat,
        longitude: p.coordinates!.lng,
        customerName: p.customerName || "Unknown Customer",
        status: p.workOrderStatus || "In Progress",
      }));
  },
});

/**
 * Save a new drawing
 */
export const saveDrawing = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    drawingData: v.object({
      type: v.string(),
      coordinates: v.optional(v.array(v.object({ lat: v.number(), lng: v.number() }))),
      center: v.optional(v.object({ lat: v.number(), lng: v.number() })),
      radius: v.optional(v.number()),
      position: v.optional(v.object({ lat: v.number(), lng: v.number() }))
    }),
    measurements: v.any(),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number()
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    const drawingId = await ctx.db.insert("savedDrawings", {
      organizationId: org._id,
      name: args.name,
      description: args.description,
      drawingData: args.drawingData,
      measurements: args.measurements,
      tags: args.tags,
      createdAt: args.createdAt
    });

    return drawingId;
  },
});

/**
 * Delete a saved drawing
 */
export const deleteDrawing = mutation({
  args: {
    drawingId: v.id("savedDrawings")
  },
  handler: async (ctx, args) => {
    const org = await getOrganization(ctx);

    // Verify the drawing belongs to this organization
    const drawing = await ctx.db.get(args.drawingId);
    if (!drawing || drawing.organizationId !== org._id) {
      throw new Error("Drawing not found or access denied");
    }

    await ctx.db.delete(args.drawingId);
    return { success: true };
  },
});
