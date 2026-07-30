import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin } from "./users";
import { statusValidator, assessmentTypeValidator } from "./schema";

// Create assessment (instructor/admin)
export const createAssessment = mutation({
  args: {
    courseId: v.id("courses"),
    lessonId: v.optional(v.id("lessons")),
    title: v.string(),
    description: v.optional(v.string()),
    type: assessmentTypeValidator,
    passingScore: v.number(),
    maxScore: v.number(),
    timeLimitMinutes: v.optional(v.number()),
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctIndex: v.number(),
      points: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("Course not found");

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin" && course.instructorId !== userId)) {
      throw new Error("Not authorized");
    }

    return await ctx.db.insert("assessments", {
      ...args,
      status: "active",
    });
  },
});

// Get assessments for a course
export const getCourseAssessments = query({
  args: {
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assessments")
      .withIndex("by_courseId", (q) => q.eq("courseId", args.courseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Get assessment by ID
export const getAssessmentById = query({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.assessmentId);
  },
});

// Submit assessment result
export const submitAssessmentResult = mutation({
  args: {
    assessmentId: v.id("assessments"),
    answers: v.array(v.object({
      questionIndex: v.number(),
      selectedIndex: v.number(),
      correct: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const assessment = await ctx.db.get(args.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    // Calculate score
    const maxScore = assessment.maxScore;
    let totalPoints = 0;
    
    args.answers.forEach((answer) => {
      if (answer.correct) {
        const question = assessment.questions[answer.questionIndex];
        totalPoints += question.points;
      }
    });

    const passed = totalPoints >= assessment.passingScore;

    const result = await ctx.db.insert("assessmentResults", {
      userId,
      assessmentId: args.assessmentId,
      score: totalPoints,
      maxScore,
      passed,
      answers: args.answers,
      completedAt: Date.now(),
    });

    // If it's a final exam and passed, mark enrollment as completed
    if (assessment.type === "final_exam" && passed) {
      const enrollment = await ctx.db
        .query("enrollments")
        .withIndex("by_user_course", (q) => q.eq("userId", userId).eq("courseId", assessment.courseId))
        .first();
      
      if (enrollment) {
        await ctx.db.patch(enrollment._id, {
          progress: 100,
          status: "completed",
          completedAt: Date.now(),
        });
      }
    }

    return result;
  },
});

// Get my assessment results
export const getMyAssessmentResults = query({
  args: {
    courseId: v.optional(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("assessmentResults")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get assessment result for specific assessment
export const getAssessmentResult = query({
  args: {
    assessmentId: v.id("assessments"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("assessmentResults")
      .withIndex("by_user_assessment", (q) => q.eq("userId", userId).eq("assessmentId", args.assessmentId))
      .first();
  },
});
