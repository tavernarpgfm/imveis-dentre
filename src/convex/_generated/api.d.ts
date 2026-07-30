/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assessments from "../assessments.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as brokers from "../brokers.js";
import type * as certificates from "../certificates.js";
import type * as companies from "../companies.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as http from "../http.js";
import type * as lessons from "../lessons.js";
import type * as opportunities from "../opportunities.js";
import type * as profiles from "../profiles.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assessments: typeof assessments;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  brokers: typeof brokers;
  certificates: typeof certificates;
  companies: typeof companies;
  courses: typeof courses;
  enrollments: typeof enrollments;
  http: typeof http;
  lessons: typeof lessons;
  opportunities: typeof opportunities;
  profiles: typeof profiles;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
