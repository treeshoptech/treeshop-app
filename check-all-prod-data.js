const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

const client = new ConvexHttpClient("https://bright-quail-848.convex.cloud");

async function checkData() {
  try {
    const orgs = await client.query(api.organizations.list);
    const projects = await client.query(api.projects.list);
    const customers = await client.query(api.customers.list);
    const employees = await client.query(api.employees.list);
    const equipment = await client.query(api.equipment.list);
    const loadouts = await client.query(api.loadouts.list);

    console.log("Production Data:");
    console.log("================");
    console.log("Organizations:", orgs?.length || 0);
    orgs?.forEach(org => console.log("  -", org.name, `(${org.clerkOrgId})`));
    console.log("\nProjects:", projects?.length || 0);
    projects?.forEach(proj => console.log("  -", proj.name));
    console.log("\nCustomers:", customers?.length || 0);
    console.log("Employees:", employees?.length || 0);
    console.log("Equipment:", equipment?.length || 0);
    console.log("Loadouts:", loadouts?.length || 0);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkData();
