import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { ROLES, roleValidator } from "./schema";
import type { Role } from "./schema";

// Helper to get current user
export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  return userId;
}

// Helper to check if user has a specific role
export async function requireRole(ctx: QueryCtx, role: Role) {
  const userId = await getCurrentUserOrThrow(ctx);
  const user = await ctx.db.get(userId);
  if (!user || user.role !== role) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
  return userId;
}

// Helper to check if user is admin
export async function requireAdmin(ctx: QueryCtx) {
  return await requireRole(ctx, ROLES.ADMIN as Role);
}

// Get current user
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// List all users (admin only)
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

// Get users by role
export const getUsersByRole = query({
  args: {
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("role", (q) => q.eq("role", args.role))
      .collect();
  },
});

// Update own profile (basic info)
export const updateMyProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.image !== undefined) patch.image = args.image;
    if (args.phone !== undefined) patch.phone = args.phone;
    await ctx.db.patch(userId, patch);
  },
});
