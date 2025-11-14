const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api");

const client = new ConvexHttpClient("https://bright-quail-848.convex.cloud");

async function checkData() {
  try {
    const customers = await client.query(api.customers.list);
    const employees = await client.query(api.employees.list);
    const equipment = await client.query(api.equipment.list);
    
    console.log("Production data:");
    console.log("Customers:", customers?.length || 0);
    console.log("Employees:", employees?.length || 0);
    console.log("Equipment:", equipment?.length || 0);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkData();
