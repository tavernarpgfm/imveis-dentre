import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin } from "./users";

// Enroll in a course
export const enrollInCourse = mutation({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    
    // Check if already enrolled
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", userId).eq("courseId", args.courseId))
      .first();
    
    if (existing) {
      if (existing.status === "active") throw new Error("Already enrolled in this course");
      if (existing.status === "completed") throw new Error("Course already completed");
      // Reactivate dropped enrollment
      await ctx.db.patch(existing._id, { status: "active", startedAt: Date.now() });
      return existing._id;
    }

    // Update course enrolled count
    const course = await ctx.db.get(args.courseId);
    if (course) {
      await ctx.db.patch(args.courseId, { enrolledCount: (course.enrolledCount || 0) + 1 });
    }

    return await ctx.db.insert("enrollments", {
      userId,
      courseId: args.courseId,
      progress: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      status: "active",
    });
  },
});

// Get my enrollments
export const getMyEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("enrollments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get enrollment for a specific course
export const getMyEnrollment = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("enrollments")
      .withIndex("by_user_course", (q) => q.eq("userId", userId).eq("courseId", args.courseId))
      .first();
  },
});

// Update enrollment progress
export const updateProgress = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    if (enrollment.userId !== userId) throw new Error("Not authorized");

    const patch: Record<string, unknown> = { progress: args.progress };
    
    if (args.progress >= 100) {
      patch.status = "completed";
      patch.completedAt = Date.now();
    }

    await ctx.db.patch(args.enrollmentId, patch);
  },
});

// Get all enrollments (admin)
export const listEnrollments = query({
  args: {
    courseId: v.optional(v.id("courses")),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("dropped"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    if (args.courseId) {
      return await ctx.db
        .query("enrollments")
        .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId!))
        .collect();
    }
    return await ctx.db.query("enrollments").collect();
  },
});
