/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as action_node_createPrivateKey from "../action/node/createPrivateKey.js";
import type * as action_node_utils from "../action/node/utils.js";
import type * as action_profile from "../action/profile.js";
import type * as auth from "../auth.js";
import type * as http_task_upload from "../http/task/upload.js";
import type * as http from "../http.js";
import type * as mutation_profile from "../mutation/profile.js";
import type * as mutation_task from "../mutation/task.js";
import type * as query_profile from "../query/profile.js";
import type * as schemas_organization_index from "../schemas/organization/index.js";
import type * as schemas_organization_organization from "../schemas/organization/organization.js";
import type * as schemas_organization_organizationInvite from "../schemas/organization/organizationInvite.js";
import type * as schemas_organization_organizationMember from "../schemas/organization/organizationMember.js";
import type * as schemas_profile_index from "../schemas/profile/index.js";
import type * as schemas_profile_profile from "../schemas/profile/profile.js";
import type * as schemas_task_index from "../schemas/task/index.js";
import type * as schemas_task_task from "../schemas/task/task.js";
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
  "action/node/createPrivateKey": typeof action_node_createPrivateKey;
  "action/node/utils": typeof action_node_utils;
  "action/profile": typeof action_profile;
  auth: typeof auth;
  "http/task/upload": typeof http_task_upload;
  http: typeof http;
  "mutation/profile": typeof mutation_profile;
  "mutation/task": typeof mutation_task;
  "query/profile": typeof query_profile;
  "schemas/organization/index": typeof schemas_organization_index;
  "schemas/organization/organization": typeof schemas_organization_organization;
  "schemas/organization/organizationInvite": typeof schemas_organization_organizationInvite;
  "schemas/organization/organizationMember": typeof schemas_organization_organizationMember;
  "schemas/profile/index": typeof schemas_profile_index;
  "schemas/profile/profile": typeof schemas_profile_profile;
  "schemas/task/index": typeof schemas_task_index;
  "schemas/task/task": typeof schemas_task_task;
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
