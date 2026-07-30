import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

// Create opportunity (company, admin)
export const createOpportunity = mutation({
  args: {
    brokerId: v.id("brokers"),
    title: v.string(),
    description: v.string(),
    opportunityType: v.union(
      v.literal("partnership"),
      v.literal("job"),
      v.literal("commission"),
      v.literal("other"),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "company" && user.role !== "admin")) {
      throw new Error("Only companies can create opportunities");
    }

    const company = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!company) throw new Error("Company profile not found");

    return await ctx.db.insert("opportunities", {
      companyId: company._id,
      brokerId: args.brokerId,
      title: args.title,
      description: args.description,
      opportunityType: args.opportunityType,
      status: "open",
      notes: args.notes,
      createdBy: userId,
    });
  },
});

// Get my opportunities (as a broker - opportunities sent to me)
export const getMyOpportunities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const broker = await ctx.db
      .query("brokers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!broker) throw new Error("Broker profile not found");

    return await ctx.db
      .query("opportunities")
      .withIndex("by_brokerId", (q) => q.eq("brokerId", broker._id))
      .collect();
  },
});

// Get opportunities by company (as a company)
export const getMyCompanyOpportunities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const company = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!company) throw new Error("Company profile not found");

    return await ctx.db
      .query("opportunities")
      .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
      .collect();
  },
});

// Update opportunity status
export const updateOpportunityStatus = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("closed"), v.literal("cancelled")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const opportunity = await ctx.db.get(args.opportunityId);
    if (!opportunity) throw new Error("Opportunity not found");

    const company = await ctx.db.get(opportunity.companyId);
    if (!company || (company.userId !== userId && userId !== opportunity.createdBy)) {
      throw new Error("Not authorized");
    }

    const patch: Record<string, unknown> = { status: args.status };
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.status === "closed") patch.contactDate = Date.now();

    await ctx.db.patch(args.opportunityId, patch);
  },
});

// Save broker for later (company-broker interaction)
export const saveBroker = mutation({
  args: {
    brokerId: v.id("brokers"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const company = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!company) throw new Error("Company profile not found");

    const existing = await ctx.db
      .query("companyBrokerInteractions")
      .withIndex("by_company_broker", (q) => q.eq("companyId", company._id).eq("brokerId", args.brokerId))
      .first();

    if (existing) {
      if (existing.interactionType === "saved") {
        // Unsave
        await ctx.db.delete(existing._id);
        return { saved: false };
      }
      return { saved: true };
    }

    await ctx.db.insert("companyBrokerInteractions", {
      companyId: company._id,
      brokerId: args.brokerId,
      interactionType: "saved",
      createdAt: Date.now(),
    });

    return { saved: true };
  },
});

// Get saved brokers for a company
export const getSavedBrokers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const company = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!company) return [];

    return await ctx.db
      .query("companyBrokerInteractions")
      .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
      .collect();
  },
});
