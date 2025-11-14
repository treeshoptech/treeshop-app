const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

const client = new ConvexHttpClient("https://bright-quail-848.convex.cloud");

async function getOrgs() {
  try {
    const orgs = await client.query(api.organizations.list);
    console.log("Production organizations:", JSON.stringify(orgs, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

getOrgs();
