import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin } from "./users";
import { statusValidator } from "./schema";

// Create lesson
export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    durationMinutes: v.number(),
    orderIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && course.instructorId !== userId)) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("lessons", {
      ...args,
      status: "active",
    });
  },
});

// Get lessons for a course
export const getCourseLessons = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Get lesson by ID
export const getLessonById = query({
  args: {
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

// Update lesson
export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    orderIndex: v.optional(v.number()),
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    const { lessonId, ...fields } = args;
    const userId = await getCurrentUserOrThrow(ctx);
    const lesson = await ctx.db.get(lessonId);
    if (!lesson) throw new Error("Lesson not found");

    const course = await ctx.db.get(lesson.courseId);
    if (!course) throw new Error("Course not found");

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && course.instructorId !== userId)) {
      throw new Error("Not authorized");
    }

    const patch: Record<string, unknown> = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) patch[key] = value;
    });

    await ctx.db.patch(lessonId, patch);
  },
});

// Delete lesson
export const deleteLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.lessonId);
  },
});
