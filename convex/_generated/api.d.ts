/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as action_auth from "../action/auth.js";
import type * as action_email from "../action/email.js";
import type * as action_node_createPrivateKey from "../action/node/createPrivateKey.js";
import type * as action_node_customToken from "../action/node/customToken.js";
import type * as action_node_utils from "../action/node/utils.js";
import type * as action_profile from "../action/profile.js";
import type * as auth from "../auth.js";
import type * as email_templates_InvitationEmail from "../email/templates/InvitationEmail.js";
import type * as email_templates_WelcomeEmail from "../email/templates/WelcomeEmail.js";
import type * as http_task_upload from "../http/task/upload.js";
import type * as http from "../http.js";
import type * as mutation_customToken from "../mutation/customToken.js";
import type * as mutation_organizations from "../mutation/organizations.js";
import type * as mutation_profile from "../mutation/profile.js";
import type * as mutation_task from "../mutation/task.js";
import type * as query_customToken from "../query/customToken.js";
import type * as query_profile from "../query/profile.js";
import type * as query_user from "../query/user.js";
import type * as schemas_organization_index from "../schemas/organization/index.js";
import type * as schemas_organization_organization from "../schemas/organization/organization.js";
import type * as schemas_organization_organizationInvite from "../schemas/organization/organizationInvite.js";
import type * as schemas_organization_organizationMember from "../schemas/organization/organizationMember.js";
import type * as schemas_profile_index from "../schemas/profile/index.js";
import type * as schemas_profile_profile from "../schemas/profile/profile.js";
import type * as schemas_task_index from "../schemas/task/index.js";
import type * as schemas_task_task from "../schemas/task/task.js";
import type * as schemas_user_userCustomToken from "../schemas/user/userCustomToken.js";
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
  "action/auth": typeof action_auth;
  "action/email": typeof action_email;
  "action/node/createPrivateKey": typeof action_node_createPrivateKey;
  "action/node/customToken": typeof action_node_customToken;
  "action/node/utils": typeof action_node_utils;
  "action/profile": typeof action_profile;
  auth: typeof auth;
  "email/templates/InvitationEmail": typeof email_templates_InvitationEmail;
  "email/templates/WelcomeEmail": typeof email_templates_WelcomeEmail;
  "http/task/upload": typeof http_task_upload;
  http: typeof http;
  "mutation/customToken": typeof mutation_customToken;
  "mutation/organizations": typeof mutation_organizations;
  "mutation/profile": typeof mutation_profile;
  "mutation/task": typeof mutation_task;
  "query/customToken": typeof query_customToken;
  "query/profile": typeof query_profile;
  "query/user": typeof query_user;
  "schemas/organization/index": typeof schemas_organization_index;
  "schemas/organization/organization": typeof schemas_organization_organization;
  "schemas/organization/organizationInvite": typeof schemas_organization_organizationInvite;
  "schemas/organization/organizationMember": typeof schemas_organization_organizationMember;
  "schemas/profile/index": typeof schemas_profile_index;
  "schemas/profile/profile": typeof schemas_profile_profile;
  "schemas/task/index": typeof schemas_task_index;
  "schemas/task/task": typeof schemas_task_task;
  "schemas/user/userCustomToken": typeof schemas_user_userCustomToken;
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
