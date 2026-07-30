import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow, requireAdmin } from "./users";
import { statusValidator } from "./schema";

// Generate certificate when student completes a course
export const generateCertificate = mutation({
  args: {
    enrollmentId: v.id("enrollments"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserOrThrow(ctx);
    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");
    if (enrollment.userId !== userId) throw new Error("Not authorized");
    if (enrollment.status !== "completed") throw new Error("Course not yet completed");

    // Check if certificate already exists
    const existing = await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("courseId"), args.courseId))
      .first();

    if (existing) throw new Error("Certificate already generated");

    // Generate unique certificate code
    const code = `DENTRE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const certificateId = await ctx.db.insert("certificates", {
      userId,
      courseId: args.courseId,
      enrollmentId: args.enrollmentId,
      certificateCode: code,
      issuedDate: Date.now(),
      expiryDate: undefined,
      status: "active",
      certificateUrl: undefined,
    });

    // If user is a broker student, update broker profile
    const user = await ctx.db.get(userId);
    if (user?.role === "student" || user?.role === "broker") {
      const broker = await ctx.db
        .query("brokers")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      
      if (broker) {
        await ctx.db.patch(broker._id, {
          completedCourses: (broker.completedCourses || 0) + 1,
          certificationDate: Date.now(),
          certificateId,
        });
      }
    }

    return certificateId;
  },
});

// Get my certificates
export const getMyCertificates = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("certificates")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get certificate by ID
export const getCertificateById = query({
  args: {
    certificateId: v.id("certificates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.certificateId);
  },
});

// Verify certificate by code (public)
export const verifyCertificate = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("certificates")
      .withIndex("by_code", (q) => q.eq("certificateCode", args.code))
      .first();
    
    if (!certificate) return { valid: false };
    if (certificate.status !== "active") return { valid: false };

    const user = await ctx.db.get(certificate.userId);
    const course = await ctx.db.get(certificate.courseId);

    return {
      valid: true,
      certificate,
      user: { name: user?.name, email: user?.email },
      course: { title: course?.title },
    };
  },
});

// List all certificates (admin)
export const listCertificates = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("certificates").collect();
  },
});

// Update certificate status (admin)
export const updateCertificateStatus = mutation({
  args: {
    certificateId: v.id("certificates"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.certificateId, { status: args.status });
  },
});
