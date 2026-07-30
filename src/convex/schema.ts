import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// Role definitions for Dentre Imóveis platform
export const ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
  BROKER: "broker",
  COMPANY: "company",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.INSTRUCTOR),
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.BROKER),
  v.literal(ROLES.COMPANY),
);
export type Role = Infer<typeof roleValidator>;

// Company types
export const COMPANY_TYPES = {
  REAL_ESTATE: "real_estate",      // Imobiliária
  CONSTRUCTION: "construction",    // Construtora
  DEVELOPER: "developer",          // Incorporadora
} as const;

export const companyTypeValidator = v.union(
  v.literal(COMPANY_TYPES.REAL_ESTATE),
  v.literal(COMPANY_TYPES.CONSTRUCTION),
  v.literal(COMPANY_TYPES.DEVELOPER),
);
export type CompanyType = Infer<typeof companyTypeValidator>;

// Common status values
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
} as const;

export const statusValidator = v.union(
  v.literal(STATUS.ACTIVE),
  v.literal(STATUS.INACTIVE),
  v.literal(STATUS.PENDING),
  v.literal(STATUS.APPROVED),
  v.literal(STATUS.REJECTED),
  v.literal(STATUS.COMPLETED),
  v.literal(STATUS.CANCELLED),
  v.literal(STATUS.AVAILABLE),
  v.literal(STATUS.UNAVAILABLE),
);
export type Status = Infer<typeof statusValidator>;

// Validators for other table-specific types
export const assessmentTypeValidator = v.union(
  v.literal("quiz"),
  v.literal("final_exam"),
  v.literal("practical"),
);

export const opportunityStatusValidator = v.union(
  v.literal("open"),
  v.literal("in_progress"),
  v.literal("closed"),
  v.literal("cancelled"),
);

const schema = defineSchema(
  {
    // Default auth tables using convex auth.
    ...authTables,

    // Users table extended with Dentre Imóveis roles
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      phone: v.optional(v.string()),
    })
      .index("email", ["email"])
      .index("role", ["role"]),

    // Profiles - personal data for all users
    profiles: defineTable({
      userId: v.id("users"),
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
      status: statusValidator,
    })
      .index("by_userId", ["userId"])
      .index("by_status", ["status"]),

    // Brokers - certified real estate professionals
    brokers: defineTable({
      userId: v.id("users"),
      profileId: v.id("profiles"),
      creciNumber: v.string(),        // CRECI - Brazilian real estate registry
      creciState: v.string(),          // State where CRECI was issued
      specialization: v.optional(v.string()),
      availableForMarket: v.boolean(),
      rating: v.optional(v.float64()),
      completedCourses: v.number(),
      certificationDate: v.optional(v.number()),
      certificateId: v.optional(v.id("certificates")),
      status: statusValidator,
    })
      .index("by_userId", ["userId"])
      .index("by_creci", ["creciNumber"])
      .index("by_available", ["availableForMarket", "status"])
      .index("by_specialization", ["specialization"])
      .index("by_rating", ["rating"]),

    // Companies - real estate agencies, construction companies, developers
    companies: defineTable({
      userId: v.id("users"),
      companyType: companyTypeValidator,
      companyName: v.string(),
      cnpj: v.optional(v.string()),    // Brazilian business registry
      description: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      website: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zipCode: v.optional(v.string()),
      status: statusValidator,
    })
      .index("by_userId", ["userId"])
      .index("by_companyType", ["companyType"])
      .index("by_status", ["status"])
      .index("by_city", ["city", "state"]),

    // Courses - training courses for aspiring brokers
    courses: defineTable({
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      instructorId: v.id("users"),
      coverImageUrl: v.optional(v.string()),
      category: v.string(),
      durationHours: v.number(),
      difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
      price: v.optional(v.number()),
      isFree: v.boolean(),
      status: statusValidator,
      enrolledCount: v.number(),
      averageRating: v.optional(v.float64()),
    })
      .index("by_slug", ["slug"])
      .index("by_instructor", ["instructorId"])
      .index("by_status", ["status"])
      .index("by_category", ["category"])
      .index("by_difficulty", ["difficulty"]),

    // Lessons - individual lessons within a course
    lessons: defineTable({
      courseId: v.id("courses"),
      title: v.string(),
      description: v.optional(v.string()),
      content: v.optional(v.string()),    // Markdown or HTML content
      videoUrl: v.optional(v.string()),
      durationMinutes: v.number(),
      orderIndex: v.number(),
      status: statusValidator,
    })
      .index("by_courseId", ["courseId", "orderIndex"])
      .index("by_status", ["status"]),

    // Enrollments - student enrollments in courses
    enrollments: defineTable({
      userId: v.id("users"),
      courseId: v.id("courses"),
      progress: v.number(),              // Percentage 0-100
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      status: v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("dropped"),
        v.literal("pending"),
      ),
    })
      .index("by_userId", ["userId"])
      .index("by_courseId", ["courseId"])
      .index("by_user_course", ["userId", "courseId"])
      .index("by_status", ["status"]),

    // Assessments - evaluations (quizzes, exams, practical tests)
    assessments: defineTable({
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
      status: statusValidator,
    })
      .index("by_courseId", ["courseId"])
      .index("by_lessonId", ["lessonId"])
      .index("by_type", ["type"]),

    // Assessment Results - student scores on assessments
    assessmentResults: defineTable({
      userId: v.id("users"),
      assessmentId: v.id("assessments"),
      score: v.number(),
      maxScore: v.number(),
      passed: v.boolean(),
      answers: v.array(v.object({
        questionIndex: v.number(),
        selectedIndex: v.number(),
        correct: v.boolean(),
      })),
      completedAt: v.number(),
    })
      .index("by_userId", ["userId"])
      .index("by_assessmentId", ["assessmentId"])
      .index("by_user_assessment", ["userId", "assessmentId"]),

    // Certificates - certifications awarded to students who pass courses
    certificates: defineTable({
      userId: v.id("users"),
      courseId: v.id("courses"),
      enrollmentId: v.id("enrollments"),
      certificateCode: v.string(),       // Unique certification code
      issuedDate: v.number(),
      expiryDate: v.optional(v.number()),
      status: statusValidator,
      certificateUrl: v.optional(v.string()),  // URL to the certificate document
    })
      .index("by_userId", ["userId"])
      .index("by_courseId", ["courseId"])
      .index("by_code", ["certificateCode"])
      .index("by_status", ["status"]),

    // Opportunities - business opportunities between companies and brokers
    opportunities: defineTable({
      companyId: v.id("companies"),
      brokerId: v.id("brokers"),
      title: v.string(),
      description: v.string(),
      opportunityType: v.union(
        v.literal("partnership"),
        v.literal("job"),
        v.literal("commission"),
        v.literal("other"),
      ),
      status: v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("closed"),
        v.literal("cancelled"),
      ),
      contactDate: v.optional(v.number()),
      notes: v.optional(v.string()),
      createdBy: v.id("users"),
    })
      .index("by_companyId", ["companyId"])
      .index("by_brokerId", ["brokerId"])
      .index("by_status", ["status"])
      .index("by_type", ["opportunityType"]),

    // Company-broker interactions (saved searches, contact history)
    companyBrokerInteractions: defineTable({
      companyId: v.id("companies"),
      brokerId: v.id("brokers"),
      interactionType: v.union(
        v.literal("saved"),
        v.literal("contacted"),
        v.literal("interviewed"),
        v.literal("hired"),
      ),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_companyId", ["companyId"])
      .index("by_brokerId", ["brokerId"])
      .index("by_company_broker", ["companyId", "brokerId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
