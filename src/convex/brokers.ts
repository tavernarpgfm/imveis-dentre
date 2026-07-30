import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin } from "./users";
import { statusValidator } from "./schema";

// Register as a broker
export const registerBroker = mutation({
  args: {
    profileId: v.id("profiles"),
    creciNumber: v.string(),
    creciState: v.string(),
    specialization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    
    const existing = await ctx.db
      .query("brokers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existing) throw new Error("Broker profile already exists");

    return await ctx.db.insert("brokers", {
      userId,
      profileId: args.profileId,
      creciNumber: args.creciNumber,
      creciState: args.creciState,
      specialization: args.specialization,
      availableForMarket: false,
      rating: 0,
      completedCourses: 0,
      certificationDate: undefined,
      certificateId: undefined,
      status: "pending",
    });
  },
});

// Get my broker profile
export const getMyBrokerProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("brokers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get broker by ID
export const getBrokerById = query({
  args: {
    brokerId: v.id("brokers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.brokerId);
  },
});

// Toggle availability for market
export const toggleAvailability = mutation({
  args: {
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const broker = await ctx.db
      .query("brokers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!broker) throw new Error("Broker profile not found");
    if (broker.status !== "approved") throw new Error("Broker is not certified");

    await ctx.db.patch(broker._id, { availableForMarket: args.available });
  },
});

// List certified and available brokers (public for companies)
export const listAvailableBrokers = query({
  args: {
    specialization: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let brokers = await ctx.db
      .query("brokers")
      .withIndex("by_available", (q) => q.eq("availableForMarket", true).eq("status", "approved"))
      .collect();

    if (args.specialization) {
      brokers = brokers.filter(b => b.specialization?.toLowerCase().includes(args.specialization!.toLowerCase()));
    }

    return brokers;
  },
});

// List brokers (admin only)
export const listBrokers = query({
  args: {
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const allBrokers = await ctx.db.query("brokers").collect();
    if (args.status) {
      return allBrokers.filter(b => b.status === args.status);
    }
    return allBrokers;
  },
});

// Approve/reject broker (admin)
export const updateBrokerStatus = mutation({
  args: {
    brokerId: v.id("brokers"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.brokerId, { status: args.status });
  },
});

// Update broker profile
export const updateBroker = mutation({
  args: {
    specialization: v.optional(v.string()),
    creciNumber: v.optional(v.string()),
    creciState: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const broker = await ctx.db
      .query("brokers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!broker) throw new Error("Broker profile not found");

    const patch: Record<string, unknown> = {};
    if (args.specialization !== undefined) patch.specialization = args.specialization;
    if (args.creciNumber !== undefined) patch.creciNumber = args.creciNumber;
    if (args.creciState !== undefined) patch.creciState = args.creciState;
    
    await ctx.db.patch(broker._id, patch);
  },
});

// Search brokers by name or creci (for companies)
export const searchBrokers = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const brokers = await ctx.db
      .query("brokers")
      .withIndex("by_available", (q) => q.eq("availableForMarket", true).eq("status", "approved"))
      .collect();
    
    const term = args.searchTerm.toLowerCase();
    return brokers.filter(b => 
      b.creciNumber.toLowerCase().includes(term) ||
      b.specialization?.toLowerCase().includes(term)
    );
  },
});
