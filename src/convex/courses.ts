import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin, requireRole } from "./users";
import { statusValidator, ROLES } from "./schema";
import type { Role } from "./schema";

// Create course (admin/instructor only)
export const createCourse = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    coverImageUrl: v.optional(v.string()),
    category: v.string(),
    durationHours: v.number(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    price: v.optional(v.number()),
    isFree: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && user.role !== "instructor")) {
      throw new Error("Only admins and instructors can create courses");
    }

    return await ctx.db.insert("courses", {
      ...args,
      instructorId: userId,
      status: "active",
      enrolledCount: 0,
      averageRating: undefined,
    });
  },
});

// Get published courses (public)
export const listCourses = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    instructorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    if (args.category) {
      courses = courses.filter(c => c.category === args.category);
    }
    if (args.difficulty) {
      courses = courses.filter(c => c.difficulty === args.difficulty);
    }
    if (args.instructorId) {
      courses = courses.filter(c => c.instructorId === args.instructorId);
    }

    return courses;
  },
});

// Get course by ID
export const getCourseById = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

// Get course by slug
export const getCourseBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Update course
export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    durationHours: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    price: v.optional(v.number()),
    isFree: v.optional(v.boolean()),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    const { courseId, ...fields } = args;
    const course = await ctx.db.get(courseId);
    if (!course) throw new Error("Course not found");

    const userId = await getCurrentUserOrThrow(ctx);
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && course.instructorId !== userId)) {
      throw new Error("Not authorized to update this course");
    }

    const patch: Record<string, unknown> = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) patch[key] = value;
    });

    await ctx.db.patch(courseId, patch);
  },
});

// Delete course (admin only)
export const deleteCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.courseId);
  },
});
