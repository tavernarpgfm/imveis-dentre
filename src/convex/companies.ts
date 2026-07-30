import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin } from "./users";
import { companyTypeValidator, statusValidator } from "./schema";

// Register a company
export const registerCompany = mutation({
  args: {
    companyType: companyTypeValidator,
    companyName: v.string(),
    cnpj: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    
    const existing = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existing) throw new Error("Company already registered");

    return await ctx.db.insert("companies", {
      userId,
      companyType: args.companyType,
      companyName: args.companyName,
      cnpj: args.cnpj,
      description: args.description,
      logoUrl: args.logoUrl,
      website: args.website,
      phone: args.phone,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      status: "active",
    });
  },
});

// Get my company
export const getMyCompany = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get company by ID
export const getCompanyById = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.companyId);
  },
});

// Update company
export const updateCompany = mutation({
  args: {
    companyType: v.optional(companyTypeValidator),
    companyName: v.optional(v.string()),
    cnpj: v.optional(v.string()),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const company = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!company) throw new Error("Company not found");

    const patch: Record<string, unknown> = {};
    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) patch[key] = value;
    });

    await ctx.db.patch(company._id, patch);
  },
});

// List companies (public)
export const listCompanies = query({
  args: {
    companyType: v.optional(companyTypeValidator),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let companies;
    if (args.companyType) {
      companies = await ctx.db
        .query("companies")
        .withIndex("by_companyType", (q) => q.eq("companyType", args.companyType!))
        .collect();
    } else {
      companies = await ctx.db.query("companies").collect();
    }
    
    return companies.filter(c => c.status === "active");
  },
});

// List all companies (admin)
export const listAllCompanies = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("companies").collect();
  },
});

// Update company status (admin)
export const updateCompanyStatus = mutation({
  args: {
    companyId: v.id("companies"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.companyId, { status: args.status });
  },
});
