/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityTypes from "../activityTypes.js";
import type * as afissFactors from "../afissFactors.js";
import type * as analytics from "../analytics.js";
import type * as customers from "../customers.js";
import type * as dashboard from "../dashboard.js";
import type * as employees from "../employees.js";
import type * as equipment from "../equipment.js";
import type * as invoices from "../invoices.js";
import type * as jobCompletion from "../jobCompletion.js";
import type * as leads from "../leads.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_employeeHelpers from "../lib/employeeHelpers.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lineItemTemplates from "../lineItemTemplates.js";
import type * as lineItems from "../lineItems.js";
import type * as loadouts from "../loadouts.js";
import type * as maps from "../maps.js";
import type * as organizationSettings from "../organizationSettings.js";
import type * as organizations from "../organizations.js";
import type * as projects from "../projects.js";
import type * as scoringFormulas from "../scoringFormulas.js";
import type * as seedAfissFactors from "../seedAfissFactors.js";
import type * as seedDefaultData from "../seedDefaultData.js";
import type * as seedDefaultLineItemTemplates from "../seedDefaultLineItemTemplates.js";
import type * as serviceTemplateSeeds from "../serviceTemplateSeeds.js";
import type * as serviceTemplates from "../serviceTemplates.js";
import type * as taskDefinitionSeeds from "../taskDefinitionSeeds.js";
import type * as taskDefinitions from "../taskDefinitions.js";
import type * as timeEntries from "../timeEntries.js";
import type * as timeTracking from "../timeTracking.js";
import type * as weatherAPI from "../weatherAPI.js";
import type * as workOrders from "../workOrders.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityTypes: typeof activityTypes;
  afissFactors: typeof afissFactors;
  analytics: typeof analytics;
  customers: typeof customers;
  dashboard: typeof dashboard;
  employees: typeof employees;
  equipment: typeof equipment;
  invoices: typeof invoices;
  jobCompletion: typeof jobCompletion;
  leads: typeof leads;
  "lib/auth": typeof lib_auth;
  "lib/employeeHelpers": typeof lib_employeeHelpers;
  "lib/permissions": typeof lib_permissions;
  lineItemTemplates: typeof lineItemTemplates;
  lineItems: typeof lineItems;
  loadouts: typeof loadouts;
  maps: typeof maps;
  organizationSettings: typeof organizationSettings;
  organizations: typeof organizations;
  projects: typeof projects;
  scoringFormulas: typeof scoringFormulas;
  seedAfissFactors: typeof seedAfissFactors;
  seedDefaultData: typeof seedDefaultData;
  seedDefaultLineItemTemplates: typeof seedDefaultLineItemTemplates;
  serviceTemplateSeeds: typeof serviceTemplateSeeds;
  serviceTemplates: typeof serviceTemplates;
  taskDefinitionSeeds: typeof taskDefinitionSeeds;
  taskDefinitions: typeof taskDefinitions;
  timeEntries: typeof timeEntries;
  timeTracking: typeof timeTracking;
  weatherAPI: typeof weatherAPI;
  workOrders: typeof workOrders;
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
