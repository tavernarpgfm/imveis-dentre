import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

// =============================================================
// TYPE DEFINITIONS
// =============================================================

export type UserRole = "admin" | "instructor" | "student" | "broker" | "company";
export type CompanyType = "real_estate" | "construction" | "developer";
export type Status = "active" | "inactive" | "pending" | "approved" | "rejected" | "completed" | "cancelled" | "available" | "unavailable";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type AssessmentType = "quiz" | "final_exam" | "practical";
export type EnrollmentStatus = "active" | "completed" | "dropped" | "pending";
export type OpportunityStatus = "open" | "in_progress" | "closed" | "cancelled";
export type OpportunityType = "partnership" | "job" | "commission" | "other";
export type InteractionType = "saved" | "contacted" | "interviewed" | "hired";

// Users table (extends Supabase Auth)
export interface UsersRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  phone: string | null;
  is_anonymous: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string | null;
  rg: string | null;
  date_of_birth: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  avatar_url: string | null;
  bio: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface BrokerRow {
  id: string;
  user_id: string;
  profile_id: string;
  creci_number: string;
  creci_state: string;
  specialization: string | null;
  available_for_market: boolean;
  rating: number;
  completed_courses: number;
  certification_date: string | null;
  certificate_id: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface CompanyRow {
  id: string;
  user_id: string;
  company_type: CompanyType;
  company_name: string;
  cnpj: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface CourseRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor_id: string;
  cover_image_url: string | null;
  category: string;
  duration_hours: number;
  difficulty: Difficulty;
  price: number | null;
  is_free: boolean;
  status: Status;
  enrolled_count: number;
  average_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AssessmentRow {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  type: AssessmentType;
  passing_score: number;
  max_score: number;
  time_limit_minutes: number | null;
  questions: Question[];
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResultRow {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  answers: Answer[];
  completed_at: string;
  created_at: string;
}

export interface CertificateRow {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_code: string;
  issued_date: string;
  expiry_date: string | null;
  status: Status;
  certificate_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityRow {
  id: string;
  company_id: string;
  broker_id: string;
  title: string;
  description: string;
  opportunity_type: OpportunityType;
  status: OpportunityStatus;
  contact_date: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
}

export interface Answer {
  questionIndex: number;
  selectedIndex: number;
  correct: boolean;
}

// =============================================================
// AUTH SERVICE
// =============================================================

export const authService = {
  async signInWithEmail(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return data;
  },

  async verifyOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// =============================================================
// USERS SERVICE
// =============================================================

export const usersService = {
  async getCurrentUser(): Promise<UsersRow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    return data;
  },

  async updateUserRole(userId: string, role: UserRole) {
    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId);
    if (error) throw error;
  },

  async getUserById(userId: string) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  },

  async listUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getUsersByRole(role: UserRole) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", role);
    return data || [];
  },
};

// =============================================================
// PROFILES SERVICE
// =============================================================

export const profilesService = {
  async getMyProfile(): Promise<ProfileRow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    return data;
  },

  async createProfile(profile: Omit<ProfileRow, "id" | "status" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({ ...profile, status: "active" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMyProfile(updates: Partial<Omit<ProfileRow, "id" | "user_id" | "created_at" | "updated_at">>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getProfileByUserId(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data;
  },

  async listProfiles() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    return data || [];
  },
};

// =============================================================
// BROKERS SERVICE
// =============================================================

export const brokersService = {
  async getMyBrokerProfile(): Promise<BrokerRow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("brokers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    return data;
  },

  async registerBroker(data: {
    profileId: string;
    creciNumber: string;
    creciState: string;
    specialization?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: broker, error } = await supabase
      .from("brokers")
      .insert({
        user_id: user.id,
        profile_id: data.profileId,
        creci_number: data.creciNumber,
        creci_state: data.creciState,
        specialization: data.specialization || null,
        available_for_market: false,
        rating: 0,
        completed_courses: 0,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return broker;
  },

  async getBrokerById(brokerId: string) {
    const { data } = await supabase
      .from("brokers")
      .select("*")
      .eq("id", brokerId)
      .single();
    return data;
  },

  async toggleAvailability(available: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("brokers")
      .update({ available_for_market: available })
      .eq("user_id", user.id);
    if (error) throw error;
  },

  async listAvailableBrokers(filters?: { specialization?: string }) {
    let query = supabase
      .from("brokers")
      .select("*")
      .eq("available_for_market", true)
      .eq("status", "approved")
      .order("rating", { ascending: false });

    if (filters?.specialization) {
      query = query.ilike("specialization", `%${filters.specialization}%`);
    }

    const { data } = await query;
    return data || [];
  },

  async listBrokers(status?: Status) {
    let query = supabase.from("brokers").select("*");
    if (status) {
      query = query.eq("status", status);
    }
    const { data } = await query.order("created_at", { ascending: false });
    return data || [];
  },

  async updateBrokerStatus(brokerId: string, status: Status) {
    const { error } = await supabase
      .from("brokers")
      .update({ status })
      .eq("id", brokerId);
    if (error) throw error;
  },

  async searchBrokers(searchTerm: string) {
    const { data } = await supabase
      .from("brokers")
      .select("*")
      .eq("available_for_market", true)
      .eq("status", "approved")
      .or(`creci_number.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`);
    return data || [];
  },
};

// =============================================================
// COMPANIES SERVICE
// =============================================================

export const companiesService = {
  async getMyCompany(): Promise<CompanyRow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();
    return data;
  },

  async registerCompany(data: {
    companyType: CompanyType;
    companyName: string;
    cnpj?: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        company_type: data.companyType,
        company_name: data.companyName,
        cnpj: data.cnpj || null,
        description: data.description || null,
        logo_url: data.logoUrl || null,
        website: data.website || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        status: "active",
      })
      .select()
      .single();
    if (error) throw error;
    return company;
  },

  async getCompanyById(companyId: string) {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();
    return data;
  },

  async listCompanies(filters?: { companyType?: CompanyType; city?: string; state?: string }) {
    let query = supabase.from("companies").select("*").eq("status", "active");

    if (filters?.companyType) {
      query = query.eq("company_type", filters.companyType);
    }
    if (filters?.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    if (filters?.state) {
      query = query.eq("state", filters.state);
    }

    const { data } = await query.order("company_name");
    return data || [];
  },

  async updateCompany(companyId: string, updates: Partial<Omit<CompanyRow, "id" | "user_id" | "created_at" | "updated_at">>) {
    const { error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", companyId);
    if (error) throw error;
  },
};

// =============================================================
// COURSES SERVICE
// =============================================================

export const coursesService = {
  async listCourses(filters?: { category?: string; difficulty?: Difficulty; instructorId?: string }) {
    let query = supabase.from("courses").select("*").eq("status", "active");

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.difficulty) {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (filters?.instructorId) {
      query = query.eq("instructor_id", filters.instructorId);
    }

    const { data } = await query.order("created_at", { ascending: false });
    return data || [];
  },

  async getCourseById(courseId: string) {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();
    return data;
  },

  async getCourseBySlug(slug: string) {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .single();
    return data;
  },

  async createCourse(data: {
    title: string;
    slug: string;
    description: string;
    category: string;
    durationHours: number;
    difficulty: Difficulty;
    price?: number;
    isFree: boolean;
    coverImageUrl?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        title: data.title,
        slug: data.slug,
        description: data.description,
        instructor_id: user.id,
        category: data.category,
        duration_hours: data.durationHours,
        difficulty: data.difficulty,
        price: data.price || null,
        is_free: data.isFree,
        cover_image_url: data.coverImageUrl || null,
        status: "active",
        enrolled_count: 0,
      })
      .select()
      .single();
    if (error) throw error;
    return course;
  },

  async updateCourse(courseId: string, updates: Partial<Omit<CourseRow, "id" | "created_at" | "updated_at">>) {
    const { error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", courseId);
    if (error) throw error;
  },
};

// =============================================================
// LESSONS SERVICE
// =============================================================

export const lessonsService = {
  async getCourseLessons(courseId: string) {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "active")
      .order("order_index");
    return data || [];
  },

  async getLessonById(lessonId: string) {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();
    return data;
  },

  async createLesson(data: {
    courseId: string;
    title: string;
    description?: string;
    content?: string;
    videoUrl?: string;
    durationMinutes: number;
    orderIndex: number;
  }) {
    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        course_id: data.courseId,
        title: data.title,
        description: data.description || null,
        content: data.content || null,
        video_url: data.videoUrl || null,
        duration_minutes: data.durationMinutes,
        order_index: data.orderIndex,
        status: "active",
      })
      .select()
      .single();
    if (error) throw error;
    return lesson;
  },
};

// =============================================================
// ENROLLMENTS SERVICE
// =============================================================

export const enrollmentsService = {
  async getMyEnrollments(): Promise<EnrollmentRow[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getMyEnrollment(courseId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();
    return data;
  },

  async enrollInCourse(courseId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const existing = await this.getMyEnrollment(courseId);
    if (existing) {
      if (existing.status === "active") throw new Error("Already enrolled");
      if (existing.status === "completed") throw new Error("Course already completed");
      const { data, error } = await supabase
        .from("enrollments")
        .update({ status: "active", started_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: courseId,
        progress: 0,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.rpc("increment_course_enrollment", { course_id: courseId });

    return data;
  },

  async updateProgress(enrollmentId: string, progress: number) {
    const updates: Partial<EnrollmentRow> = { progress };
    if (progress >= 100) {
      updates.status = "completed";
      updates.completed_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("enrollments")
      .update(updates)
      .eq("id", enrollmentId);
    if (error) throw error;
  },
};

// =============================================================
// ASSESSMENTS SERVICE
// =============================================================

export const assessmentsService = {
  async getCourseAssessments(courseId: string) {
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "active");
    return data || [];
  },

  async getAssessmentById(assessmentId: string) {
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();
    return data;
  },

  async submitAssessmentResult(data: {
    assessmentId: string;
    answers: Answer[];
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const assessment = await this.getAssessmentById(data.assessmentId);
    if (!assessment) throw new Error("Assessment not found");

    let totalPoints = 0;
    data.answers.forEach((answer) => {
      if (answer.correct) {
        const question = assessment.questions[answer.questionIndex];
        totalPoints += question.points;
      }
    });

    const passed = totalPoints >= assessment.passing_score;

    const { data: result, error } = await supabase
      .from("assessment_results")
      .insert({
        user_id: user.id,
        assessment_id: data.assessmentId,
        score: totalPoints,
        max_score: assessment.max_score,
        passed,
        answers: data.answers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;

    if (assessment.type === "final_exam" && passed) {
      const enrollment = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", assessment.course_id)
        .single();

      if (enrollment.data) {
        await supabase
          .from("enrollments")
          .update({
            progress: 100,
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", enrollment.data.id);
      }
    }

    return result;
  },

  async getMyAssessmentResults() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", user.id);
    return data || [];
  },

  async getAssessmentResult(assessmentId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", user.id)
      .eq("assessment_id", assessmentId)
      .single();
    return data;
  },
};

// =============================================================
// CERTIFICATES SERVICE
// =============================================================

export const certificatesService = {
  async getMyCertificates() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .order("issued_date", { ascending: false });
    return data || [];
  },

  async getCertificateById(certificateId: string) {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", certificateId)
      .single();
    return data;
  },

  async verifyCertificate(code: string) {
    const { data } = await supabase
      .from("certificates")
      .select("*, users!inner(name, email), courses!inner(title)")
      .eq("certificate_code", code)
      .single();
    return data ? { valid: true, certificate: data } : { valid: false };
  },

  async generateCertificate(enrollmentId: string, courseId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const code = `DENTRE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        user_id: user.id,
        course_id: courseId,
        enrollment_id: enrollmentId,
        certificate_code: code,
        status: "active",
      })
      .select()
      .single();
    if (error) throw error;

    const { data: broker } = await supabase
      .from("brokers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (broker) {
      await supabase
        .from("brokers")
        .update({
          completed_courses: (broker.completed_courses || 0) + 1,
          certification_date: new Date().toISOString(),
          certificate_id: data.id,
        })
        .eq("id", broker.id);
    }

    return data;
  },
};

// =============================================================
// OPPORTUNITIES SERVICE
// =============================================================

export const opportunitiesService = {
  async createOpportunity(data: {
    brokerId: string;
    title: string;
    description: string;
    opportunityType: OpportunityType;
    notes?: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!company) throw new Error("Company profile not found");

    const { data: opp, error } = await supabase
      .from("opportunities")
      .insert({
        company_id: company.id,
        broker_id: data.brokerId,
        title: data.title,
        description: data.description,
        opportunity_type: data.opportunityType,
        status: "open",
        notes: data.notes || null,
        created_by: user.id,
      })
      .select()
      .single();
    if (error) throw error;
    return opp;
  },

  async getMyOpportunities() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: broker } = await supabase
      .from("brokers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!broker) return [];

    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("broker_id", broker.id);
    return data || [];
  },

  async getMyCompanyOpportunities() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!company) return [];

    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("company_id", company.id);
    return data || [];
  },

  async updateOpportunityStatus(opportunityId: string, status: OpportunityStatus, notes?: string) {
    const updates: Partial<OpportunityRow> = { status };
    if (notes !== undefined) updates.notes = notes;
    if (status === "closed") updates.contact_date = new Date().toISOString();

    const { error } = await supabase
      .from("opportunities")
      .update(updates)
      .eq("id", opportunityId);
    if (error) throw error;
  },

  async saveBroker(brokerId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!company) throw new Error("Company profile not found");

    const { data: existing } = await supabase
      .from("company_broker_interactions")
      .select("*")
      .eq("company_id", company.id)
      .eq("broker_id", brokerId)
      .single();

    if (existing) {
      if (existing.interaction_type === "saved") {
        await supabase
          .from("company_broker_interactions")
          .delete()
          .eq("id", existing.id);
        return { saved: false };
      }
      return { saved: true };
    }

    await supabase.from("company_broker_interactions").insert({
      company_id: company.id,
      broker_id: brokerId,
      interaction_type: "saved",
    });

    return { saved: true };
  },

  async getSavedBrokers() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!company) return [];

    const { data } = await supabase
      .from("company_broker_interactions")
      .select("*")
      .eq("company_id", company.id);
    return data || [];
  },
};
