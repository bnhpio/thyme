/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as schemas_organization_index from "../schemas/organization/index.js";
import type * as schemas_organization_organization from "../schemas/organization/organization.js";
import type * as schemas_organization_organizationInvite from "../schemas/organization/organizationInvite.js";
import type * as schemas_organization_organizationMember from "../schemas/organization/organizationMember.js";
import type * as schemas_user_userSettings from "../schemas/user/userSettings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  "schemas/organization/index": typeof schemas_organization_index;
  "schemas/organization/organization": typeof schemas_organization_organization;
  "schemas/organization/organizationInvite": typeof schemas_organization_organizationInvite;
  "schemas/organization/organizationMember": typeof schemas_organization_organizationMember;
  "schemas/user/userSettings": typeof schemas_user_userSettings;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
