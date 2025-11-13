/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as afissFactors from "../afissFactors.js";
import type * as analytics from "../analytics.js";
import type * as customers from "../customers.js";
import type * as dashboard from "../dashboard.js";
import type * as employees from "../employees.js";
import type * as equipment from "../equipment.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_employeeHelpers from "../lib/employeeHelpers.js";
import type * as lineItemTemplates from "../lineItemTemplates.js";
import type * as lineItems from "../lineItems.js";
import type * as loadouts from "../loadouts.js";
import type * as maps from "../maps.js";
import type * as organizationSettings from "../organizationSettings.js";
import type * as organizations from "../organizations.js";
import type * as projects from "../projects.js";
import type * as seedDefaultLineItemTemplates from "../seedDefaultLineItemTemplates.js";
import type * as timeEntries from "../timeEntries.js";
import type * as weatherAPI from "../weatherAPI.js";
import type * as workOrders from "../workOrders.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  afissFactors: typeof afissFactors;
  analytics: typeof analytics;
  customers: typeof customers;
  dashboard: typeof dashboard;
  employees: typeof employees;
  equipment: typeof equipment;
  invoices: typeof invoices;
  leads: typeof leads;
  "lib/auth": typeof lib_auth;
  "lib/employeeHelpers": typeof lib_employeeHelpers;
  lineItemTemplates: typeof lineItemTemplates;
  lineItems: typeof lineItems;
  loadouts: typeof loadouts;
  maps: typeof maps;
  organizationSettings: typeof organizationSettings;
  organizations: typeof organizations;
  projects: typeof projects;
  seedDefaultLineItemTemplates: typeof seedDefaultLineItemTemplates;
  timeEntries: typeof timeEntries;
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
