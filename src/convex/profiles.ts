import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin } from "./users";
import { statusValidator } from "./schema";

// Create profile
export const createProfile = mutation({
  args: {
    fullName: v.string(),
    cpf: v.optional(v.string()),
    rg: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    
    // Check if profile already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existing) {
      throw new Error("Profile already exists for this user");
    }

    return await ctx.db.insert("profiles", {
      userId,
      fullName: args.fullName,
      cpf: args.cpf,
      rg: args.rg,
      dateOfBirth: args.dateOfBirth,
      phone: args.phone,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      avatarUrl: args.avatarUrl,
      bio: args.bio,
      status: "active",
    });
  },
});

// Get my profile
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Update my profile
export const updateMyProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    cpf: v.optional(v.string()),
    rg: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");

    const patch: Record<string, unknown> = {};
    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) patch[key] = value;
    });

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

// Get profile by user ID (public)
export const getProfileByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// List all profiles (admin only)
export const listProfiles = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("profiles").collect();
  },
});
