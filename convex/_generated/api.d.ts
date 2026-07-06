/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ViktorSpacesEmail from "../ViktorSpacesEmail.js";
import type * as academy from "../academy.js";
import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as certification from "../certification.js";
import type * as community from "../community.js";
import type * as constants from "../constants.js";
import type * as dashboard from "../dashboard.js";
import type * as docs from "../docs.js";
import type * as doctrine from "../doctrine.js";
import type * as evidence from "../evidence.js";
import type * as http from "../http.js";
import type * as infraLab from "../infraLab.js";
import type * as instructor from "../instructor.js";
import type * as mirrorPrompts from "../mirrorPrompts.js";
import type * as mirrors from "../mirrors.js";
import type * as roles from "../roles.js";
import type * as seedContent from "../seedContent.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as sqlLab from "../sqlLab.js";
import type * as testAuth from "../testAuth.js";
import type * as training from "../training.js";
import type * as users from "../users.js";
import type * as viktorSpaceAuthConfig from "../viktorSpaceAuthConfig.js";
import type * as viktorSpaceAuthEnv from "../viktorSpaceAuthEnv.js";
import type * as viktorTools from "../viktorTools.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ViktorSpacesEmail: typeof ViktorSpacesEmail;
  academy: typeof academy;
  admin: typeof admin;
  ai: typeof ai;
  auth: typeof auth;
  certification: typeof certification;
  community: typeof community;
  constants: typeof constants;
  dashboard: typeof dashboard;
  docs: typeof docs;
  doctrine: typeof doctrine;
  evidence: typeof evidence;
  http: typeof http;
  infraLab: typeof infraLab;
  instructor: typeof instructor;
  mirrorPrompts: typeof mirrorPrompts;
  mirrors: typeof mirrors;
  roles: typeof roles;
  seedContent: typeof seedContent;
  seedTestUser: typeof seedTestUser;
  sqlLab: typeof sqlLab;
  testAuth: typeof testAuth;
  training: typeof training;
  users: typeof users;
  viktorSpaceAuthConfig: typeof viktorSpaceAuthConfig;
  viktorSpaceAuthEnv: typeof viktorSpaceAuthEnv;
  viktorTools: typeof viktorTools;
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
