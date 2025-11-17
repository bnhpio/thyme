/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as action_auth from '../action/auth.js';
import type * as action_email from '../action/email.js';
import type * as action_executable from '../action/executable.js';
import type * as action_node_createSmartAccount from '../action/node/createSmartAccount.js';
import type * as action_node_customToken from '../action/node/customToken.js';
import type * as action_node_utils from '../action/node/utils.js';
import type * as action_organizations from '../action/organizations.js';
import type * as action_profile from '../action/profile.js';
import type * as action_task from '../action/task.js';
import type * as auth from '../auth.js';
import type * as autumn from '../autumn.js';
import type * as email_templates_InvitationEmail from '../email/templates/InvitationEmail.js';
import type * as email_templates_SupportEmail from '../email/templates/SupportEmail.js';
import type * as email_templates_WelcomeEmail from '../email/templates/WelcomeEmail.js';
import type * as http from '../http.js';
import type * as http_organization_list from '../http/organization/list.js';
import type * as http_task_upload from '../http/task/upload.js';
import type * as http_utils from '../http/utils.js';
import type * as mutation_customToken from '../mutation/customToken.js';
import type * as mutation_executable from '../mutation/executable.js';
import type * as mutation_log from '../mutation/log.js';
import type * as mutation_organizations from '../mutation/organizations.js';
import type * as mutation_profile from '../mutation/profile.js';
import type * as mutation_task from '../mutation/task.js';
import type * as mutation_user from '../mutation/user.js';
import type * as query_chain from '../query/chain.js';
import type * as query_customToken from '../query/customToken.js';
import type * as query_dashboard from '../query/dashboard.js';
import type * as query_executable from '../query/executable.js';
import type * as query_organization from '../query/organization.js';
import type * as query_profile from '../query/profile.js';
import type * as query_task from '../query/task.js';
import type * as query_user from '../query/user.js';
import type * as schemas_chain_chain from '../schemas/chain/chain.js';
import type * as schemas_chain_index from '../schemas/chain/index.js';
import type * as schemas_organization_index from '../schemas/organization/index.js';
import type * as schemas_organization_organization from '../schemas/organization/organization.js';
import type * as schemas_organization_organizationInvite from '../schemas/organization/organizationInvite.js';
import type * as schemas_organization_organizationMember from '../schemas/organization/organizationMember.js';
import type * as schemas_profile_index from '../schemas/profile/index.js';
import type * as schemas_profile_profile from '../schemas/profile/profile.js';
import type * as schemas_task_executable from '../schemas/task/executable.js';
import type * as schemas_task_execution from '../schemas/task/execution.js';
import type * as schemas_task_history from '../schemas/task/history.js';
import type * as schemas_task_index from '../schemas/task/index.js';
import type * as schemas_task_log from '../schemas/task/log.js';
import type * as schemas_task_task from '../schemas/task/task.js';
import type * as schemas_user_userCustomToken from '../schemas/user/userCustomToken.js';
import type * as schemas_user_userSettings from '../schemas/user/userSettings.js';

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from 'convex/server';

declare const fullApi: ApiFromModules<{
  'action/auth': typeof action_auth;
  'action/email': typeof action_email;
  'action/executable': typeof action_executable;
  'action/node/createSmartAccount': typeof action_node_createSmartAccount;
  'action/node/customToken': typeof action_node_customToken;
  'action/node/utils': typeof action_node_utils;
  'action/organizations': typeof action_organizations;
  'action/profile': typeof action_profile;
  'action/task': typeof action_task;
  auth: typeof auth;
  autumn: typeof autumn;
  'email/templates/InvitationEmail': typeof email_templates_InvitationEmail;
  'email/templates/SupportEmail': typeof email_templates_SupportEmail;
  'email/templates/WelcomeEmail': typeof email_templates_WelcomeEmail;
  http: typeof http;
  'http/organization/list': typeof http_organization_list;
  'http/task/upload': typeof http_task_upload;
  'http/utils': typeof http_utils;
  'mutation/customToken': typeof mutation_customToken;
  'mutation/executable': typeof mutation_executable;
  'mutation/log': typeof mutation_log;
  'mutation/organizations': typeof mutation_organizations;
  'mutation/profile': typeof mutation_profile;
  'mutation/task': typeof mutation_task;
  'mutation/user': typeof mutation_user;
  'query/chain': typeof query_chain;
  'query/customToken': typeof query_customToken;
  'query/dashboard': typeof query_dashboard;
  'query/executable': typeof query_executable;
  'query/organization': typeof query_organization;
  'query/profile': typeof query_profile;
  'query/task': typeof query_task;
  'query/user': typeof query_user;
  'schemas/chain/chain': typeof schemas_chain_chain;
  'schemas/chain/index': typeof schemas_chain_index;
  'schemas/organization/index': typeof schemas_organization_index;
  'schemas/organization/organization': typeof schemas_organization_organization;
  'schemas/organization/organizationInvite': typeof schemas_organization_organizationInvite;
  'schemas/organization/organizationMember': typeof schemas_organization_organizationMember;
  'schemas/profile/index': typeof schemas_profile_index;
  'schemas/profile/profile': typeof schemas_profile_profile;
  'schemas/task/executable': typeof schemas_task_executable;
  'schemas/task/execution': typeof schemas_task_execution;
  'schemas/task/history': typeof schemas_task_history;
  'schemas/task/index': typeof schemas_task_index;
  'schemas/task/log': typeof schemas_task_log;
  'schemas/task/task': typeof schemas_task_task;
  'schemas/user/userCustomToken': typeof schemas_user_userCustomToken;
  'schemas/user/userSettings': typeof schemas_user_userSettings;
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
  FunctionReference<any, 'public'>
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
  FunctionReference<any, 'internal'>
>;

export declare const components: {
  crons: {
    public: {
      del: FunctionReference<
        'mutation',
        'internal',
        { identifier: { id: string } | { name: string } },
        null
      >;
      get: FunctionReference<
        'query',
        'internal',
        { identifier: { id: string } | { name: string } },
        {
          args: Record<string, any>;
          functionHandle: string;
          id: string;
          name?: string;
          schedule:
            | { kind: 'interval'; ms: number }
            | { cronspec: string; kind: 'cron'; tz?: string };
        } | null
      >;
      list: FunctionReference<
        'query',
        'internal',
        {},
        Array<{
          args: Record<string, any>;
          functionHandle: string;
          id: string;
          name?: string;
          schedule:
            | { kind: 'interval'; ms: number }
            | { cronspec: string; kind: 'cron'; tz?: string };
        }>
      >;
      register: FunctionReference<
        'mutation',
        'internal',
        {
          args: Record<string, any>;
          functionHandle: string;
          name?: string;
          schedule:
            | { kind: 'interval'; ms: number }
            | { cronspec: string; kind: 'cron'; tz?: string };
        },
        string
      >;
    };
  };
  autumn: {};
};
