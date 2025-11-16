// TreeShop Time Clock Task Options - Service-Specific

export type TaskCategory =
  | "Production Time"      // Billable main work
  | "Transport Time"       // Billable at separate rate
  | "Setup/Teardown"      // Billable overhead
  | "Breaks"              // Required by law, not billable
  | "Maintenance"         // Overhead cost
  | "Admin/Safety";       // Overhead cost

export interface TimeTrackingTask {
  name: string;
  category: TaskCategory;
  billable: boolean;
}

// FORESTRY MULCHING
export const FORESTRY_MULCHING_TASKS: TimeTrackingTask[] = [
  { name: "Transport - To Site", category: "Transport Time", billable: true },
  { name: "Setup/Site Prep", category: "Setup/Teardown", billable: true },
  { name: "Safety Briefing", category: "Admin/Safety", billable: false },
  { name: "Mulching - Production", category: "Production Time", billable: true },
  { name: "Equipment Adjustment/Repair", category: "Maintenance", billable: false },
  { name: "Refuel", category: "Maintenance", billable: false },
  { name: "Break - Meal", category: "Breaks", billable: false },
  { name: "Break - Rest", category: "Breaks", billable: false },
  { name: "Cleanup", category: "Setup/Teardown", billable: true },
  { name: "Customer Walkthrough", category: "Admin/Safety", billable: false },
  { name: "Transport - Return", category: "Transport Time", billable: true },
  { name: "Equipment Maintenance", category: "Maintenance", billable: false },
  { name: "Photo Documentation", category: "Admin/Safety", billable: false },
];

// TREE REMOVAL
export const TREE_REMOVAL_TASKS: TimeTrackingTask[] = [
  { name: "Transport - To Site", category: "Transport Time", billable: true },
  { name: "Setup/Site Prep", category: "Setup/Teardown", billable: true },
  { name: "Safety Briefing", category: "Admin/Safety", billable: false },
  { name: "Rigging Setup", category: "Setup/Teardown", billable: true },
  { name: "Climbing/Cutting", category: "Production Time", billable: true },
  { name: "Crane Operations", category: "Production Time", billable: true },
  { name: "Felling", category: "Production Time", billable: true },
  { name: "Limb Cutting/Processing", category: "Production Time", billable: true },
  { name: "Stump Grinding", category: "Production Time", billable: true },
  { name: "Debris Loading", category: "Setup/Teardown", billable: true },
  { name: "Debris Hauling", category: "Transport Time", billable: true },
  { name: "Break - Meal", category: "Breaks", billable: false },
  { name: "Break - Rest", category: "Breaks", billable: false },
  { name: "Cleanup/Site Restoration", category: "Setup/Teardown", billable: true },
  { name: "Equipment Repair", category: "Maintenance", billable: false },
  { name: "Transport - Return", category: "Transport Time", billable: true },
];

// TREE TRIMMING/PRUNING
export const TREE_TRIMMING_TASKS: TimeTrackingTask[] = [
  { name: "Transport - To Site", category: "Transport Time", billable: true },
  { name: "Setup/Site Prep", category: "Setup/Teardown", billable: true },
  { name: "Safety Briefing", category: "Admin/Safety", billable: false },
  { name: "Climbing", category: "Production Time", billable: true },
  { name: "Pruning/Cutting", category: "Production Time", billable: true },
  { name: "Palm Trimming", category: "Production Time", billable: true },
  { name: "Debris Cutting/Chipping", category: "Setup/Teardown", billable: true },
  { name: "Debris Hauling", category: "Transport Time", billable: true },
  { name: "Break - Meal", category: "Breaks", billable: false },
  { name: "Break - Rest", category: "Breaks", billable: false },
  { name: "Cleanup", category: "Setup/Teardown", billable: true },
  { name: "Equipment Maintenance", category: "Maintenance", billable: false },
  { name: "Transport - Return", category: "Transport Time", billable: true },
];

// STUMP GRINDING
export const STUMP_GRINDING_TASKS: TimeTrackingTask[] = [
  { name: "Transport - To Site", category: "Transport Time", billable: true },
  { name: "Setup/Access Prep", category: "Setup/Teardown", billable: true },
  { name: "Safety Briefing", category: "Admin/Safety", billable: false },
  { name: "Grinding - Production", category: "Production Time", billable: true },
  { name: "Blade Change", category: "Maintenance", billable: false },
  { name: "Refuel", category: "Maintenance", billable: false },
  { name: "Cleanup/Mulch Removal", category: "Setup/Teardown", billable: true },
  { name: "Break - Meal", category: "Breaks", billable: false },
  { name: "Break - Rest", category: "Breaks", billable: false },
  { name: "Equipment Maintenance", category: "Maintenance", billable: false },
  { name: "Transport - Return", category: "Transport Time", billable: true },
];

// LAND CLEARING
export const LAND_CLEARING_TASKS: TimeTrackingTask[] = [
  { name: "Transport - To Site", category: "Transport Time", billable: true },
  { name: "Setup/Site Prep", category: "Setup/Teardown", billable: true },
  { name: "Safety Briefing", category: "Admin/Safety", billable: false },
  { name: "Clearing - Production", category: "Production Time", billable: true },
  { name: "Debris Piling", category: "Setup/Teardown", billable: true },
  { name: "Debris Hauling", category: "Transport Time", billable: true },
  { name: "Equipment Adjustment/Repair", category: "Maintenance", billable: false },
  { name: "Refuel", category: "Maintenance", billable: false },
  { name: "Break - Meal", category: "Breaks", billable: false },
  { name: "Break - Rest", category: "Breaks", billable: false },
  { name: "Cleanup/Grading", category: "Setup/Teardown", billable: true },
  { name: "Transport - Return", category: "Transport Time", billable: true },
];

// UNIVERSAL OPTIONS (available for ALL services)
export const UNIVERSAL_TASKS: TimeTrackingTask[] = [
  { name: "Shop Maintenance", category: "Maintenance", billable: false },
  { name: "Administrative", category: "Admin/Safety", billable: false },
  { name: "Training", category: "Admin/Safety", billable: false },
  { name: "Safety Meeting", category: "Admin/Safety", billable: false },
  { name: "Equipment Repair - Shop", category: "Maintenance", billable: false },
  { name: "Waiting on Customer", category: "Admin/Safety", billable: false },
  { name: "Weather Delay", category: "Admin/Safety", billable: false },
];

// Get tasks for a specific service type
export function getTasksForService(serviceType: string): TimeTrackingTask[] {
  const normalizedType = serviceType.toLowerCase();

  let serviceTasks: TimeTrackingTask[] = [];

  if (normalizedType.includes("forestry mulching") || normalizedType.includes("mulching")) {
    serviceTasks = FORESTRY_MULCHING_TASKS;
  } else if (normalizedType.includes("tree removal") || normalizedType.includes("removal")) {
    serviceTasks = TREE_REMOVAL_TASKS;
  } else if (normalizedType.includes("tree trimming") || normalizedType.includes("trimming") || normalizedType.includes("pruning")) {
    serviceTasks = TREE_TRIMMING_TASKS;
  } else if (normalizedType.includes("stump grinding") || normalizedType.includes("stump") || normalizedType.includes("grinding")) {
    serviceTasks = STUMP_GRINDING_TASKS;
  } else if (normalizedType.includes("land clearing") || normalizedType.includes("clearing")) {
    serviceTasks = LAND_CLEARING_TASKS;
  } else {
    // Default to universal tasks if service type not recognized
    serviceTasks = UNIVERSAL_TASKS;
  }

  // Combine service-specific tasks with universal tasks
  return [...serviceTasks, ...UNIVERSAL_TASKS];
}

// Get all unique task categories
export function getAllCategories(): TaskCategory[] {
  return [
    "Production Time",
    "Transport Time",
    "Setup/Teardown",
    "Breaks",
    "Maintenance",
    "Admin/Safety",
  ];
}

// Group tasks by category for display
export function groupTasksByCategory(tasks: TimeTrackingTask[]): Map<TaskCategory, TimeTrackingTask[]> {
  const grouped = new Map<TaskCategory, TimeTrackingTask[]>();

  tasks.forEach(task => {
    const existing = grouped.get(task.category) || [];
    grouped.set(task.category, [...existing, task]);
  });

  return grouped;
}
