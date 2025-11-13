# User-Employee Linking Implementation Status

## Overview
Connecting Clerk authentication users to Employee operational records for mobile app and employee portal functionality.

---

## ✅ COMPLETED: Phase 1 - Core Linking Infrastructure (Backend)

### Helper Functions (`convex/lib/employeeHelpers.ts`)
- ✅ `findClerkUserByEmail()` - Find Clerk user by email in organization
- ✅ `linkEmployeeToClerkUser()` - Validate and link employee to Clerk user
  - Ensures one-to-one mapping
  - Prevents duplicate links
  - Validates org ownership
- ✅ `unlinkEmployee()` - Remove link between employee and Clerk user (admin only)
- ✅ `autoLinkByEmail()` - Auto-populate clerkUserId when email matches
- ✅ `getEmployeeForCurrentUser()` - Get employee record for authenticated user

### Employee Mutations Enhanced (`convex/employees.ts`)
- ✅ `create()` - Auto-link to Clerk user if email matches org member
- ✅ Validates no duplicate links before auto-linking
- ✅ Populates `clerkUserId` field automatically when possible

### New Employee Queries (`convex/employees.ts`)
- ✅ `getByClerkUserId(clerkUserId)` - Find employee by Clerk user ID
- ✅ `getCurrentUserEmployee()` - Get logged-in user's employee record
- ✅ `getUnlinkedEmployees()` - List employees without Clerk accounts (admin)
- ✅ `linkToClerkUser(employeeId, clerkUserId)` - Manual linking (admin only)
- ✅ `unlinkFromClerkUser(employeeId)` - Manual unlinking (admin only)

---

## ✅ COMPLETED: Phase 2 - Employee Portal Queries (Partial)

### Work Orders Queries (`convex/workOrders.ts`)
- ✅ `getMyWorkOrders()` - Get all work orders assigned to current user
  - Filters by `crewMemberIds` array
  - Sorted by scheduled date (most recent first)
  - Returns empty array if user not linked to employee

- ✅ `getMyWorkOrdersByStatus(status)` - Filter work orders by status
  - Status: "Scheduled", "In Progress", "Completed"
  - Only returns work orders assigned to current employee

- ✅ `getMyWorkOrdersByDate(date)` - Get work orders for specific date
  - Used for daily schedule view
  - Filters by scheduledDate and employee assignment

- ✅ `getMyWorkOrdersInRange(startDate, endDate)` - Calendar date range
  - Used for weekly/monthly calendar views
  - Returns all assigned work orders in date range

### Loadouts Queries (`convex/loadouts.ts`)
- ✅ `getMyLoadouts()` - Get loadouts assigned to current user
  - Filters by `employeeIds` array
  - Shows equipment and crew configurations
  - Used for "My Team" and "My Equipment" views

---

## 🚧 IN PROGRESS: Phase 2.3 - Time Tracking

### Time Tracking Schema (convex/schema.ts)
- ⏳ Create `timeEntries` table with fields:
  - `organizationId`, `employeeId`, `workOrderId`
  - `clockInTime`, `clockOutTime`, `totalHours`
  - `clockInLocation` (GPS coords), `clockOutLocation`
  - `status`: "Clocked In", "Clocked Out"
  - `notes`

### Time Tracking Mutations (convex/timeEntries.ts - NEW FILE)
- ⏳ `clockIn(workOrderId)` - Start time entry for current user's employee
  - Validates employee is assigned to work order
  - Stores GPS location (optional)
  - Prevents multiple simultaneous clock-ins

- ⏳ `clockOut(timeEntryId)` - End time entry
  - Calculates total hours
  - Stores GPS location (optional)
  - Updates status to "Clocked Out"

- ⏳ `getMyTimeEntries(date)` - View own time records for specific date
- ⏳ `getActiveClockIn()` - Check if currently clocked in
- ⏳ `getMyTimeEntriesInRange(startDate, endDate)` - Week/month time view

---

## 📋 TODO: Phase 3 - Admin UI for Employee Linking

### Employee Form Enhancement (`app/dashboard/employees/[id]/page.tsx`)
- ⏳ Add "Clerk Account" section showing:
  - Current linked user (if any) with unlink button
  - "Link to Clerk User" button if not linked
  - Modal to select from available Clerk org members
  - "Auto-linked by email" badge when applicable

### Employee List View (`app/dashboard/employees/page.tsx`)
- ⏳ Add "Account Status" column (Linked ✓ / Not Linked)
- ⏳ Filter: "Show only unlinked employees"
- ⏳ Bulk action: "Send Clerk Invitations" for unlinked employees

### New Employee Creation Flow (`app/dashboard/employees/new/page.tsx`)
- ⏳ Show "Clerk user found - will auto-link" message when email entered
- ⏳ Show "No Clerk account found - invitation will be sent" if not found
- ⏳ Option to invite to Clerk during employee creation

---

## 📋 TODO: Phase 4 - Employee Mobile Views

### Employee Dashboard/Home (`app/(authenticated)/employee/page.tsx` - NEW)
- ⏳ Welcome message: "Hi [FirstName]!"
- ⏳ Today's schedule card
- ⏳ Active clock-in status (if clocked in)
- ⏳ Quick actions: Clock In/Out, View Schedule, View Equipment

### My Work Orders (`app/(authenticated)/employee/work-orders/page.tsx` - NEW)
- ⏳ List view: Upcoming, In Progress, Completed tabs
- ⏳ Card per work order: Customer, address, date/time, crew members
- ⏳ Tap to see full details: scope, equipment, notes, map

### My Schedule (`app/(authenticated)/employee/schedule/page.tsx` - NEW)
- ⏳ Calendar view (weekly/monthly)
- ⏳ Color-coded by work order status
- ⏳ Tap date to see day details
- ⏳ Filter by date range

### My Loadouts (`app/(authenticated)/employee/loadouts/page.tsx` - NEW)
- ⏳ Current loadout assignments
- ⏳ Equipment I'm working with
- ⏳ Crew members on my team
- ⏳ Service type and production goals

### Time Clock (`app/(authenticated)/employee/time-clock/page.tsx` - NEW)
- ⏳ Large "Clock In" / "Clock Out" button
- ⏳ Current status display
- ⏳ Today's hours summary
- ⏳ Week's hours summary
- ⏳ History: Recent time entries

---

## 📋 TODO: Phase 5 - Navigation & Role-Based Access

### Role Detection (`lib/useUserRole.ts` - NEW)
- ⏳ Hook: `useUserRole()` - Returns: admin, manager, employee, or null
- ⏳ Check Clerk org_role and employee record linkage

### Conditional Navigation (`app/dashboard/layout.tsx`)
- ⏳ Admin/Manager: See full dashboard (all tabs/features)
- ⏳ Employee: See employee portal (schedule, time clock, work orders)
- ⏳ Auto-redirect based on role after login

### Route Protection
- ⏳ Protect admin routes from employee access
- ⏳ Allow employees to only access their own data
- ⏳ Use Convex auth helpers for backend enforcement

---

## 📋 FUTURE: Phase 6 - Notifications & Invitations

### Clerk Invitation Flow
- ⏳ Admin clicks "Invite to Clerk" on unlinked employee
- ⏳ Send Clerk organization invitation to employee email
- ⏳ On first login, auto-link via email match

### Assignment Notifications
- ⏳ When added to work order → notification to employee
- ⏳ When loadout changes → notification to affected crew
- ⏳ Schedule changes → push notification (future: mobile app)

---

## Technical Foundation

### Existing Infrastructure (Already in Place)
✅ Schema field: `employees.clerkUserId` (optional string)
✅ Index: `by_org_clerk_user` on (organizationId, clerkUserId)
✅ Auth helpers: `getUserIdentity()`, `getOrganizationId()`, `requireAdmin()`
✅ Multi-tenant architecture: All queries scoped to organization

### Key Design Decisions
✅ No separate Users table - Clerk handles all auth
✅ Auto-link by email - Seamless for users, admin can override
✅ One-to-one mapping enforced - One Clerk user per employee per org
✅ Graceful degradation - Queries return empty arrays if not linked
✅ Admin-only linking operations - Security enforced at backend

---

## Success Metrics

### When Fully Implemented
- ✅ Employee logs in → sees their schedule immediately
- ✅ Work order assigned → appears in employee's app in real-time
- ✅ Clock in/out → tracked to authenticated user (no buddy punching)
- ✅ Admin can see which employees have/haven't linked accounts
- ✅ Zero duplicate links (validation enforced)

---

## Next Immediate Steps

1. **Complete Phase 2.3: Time Tracking**
   - Create timeEntries schema
   - Implement clockIn/clockOut mutations
   - Add time query functions

2. **Begin Phase 3: Admin UI**
   - Enhance employee form with linking section
   - Add account status column to employee list
   - Test manual link/unlink workflows

3. **Start Phase 4: Employee Views**
   - Create employee dashboard/home page
   - Build My Work Orders view
   - Build Time Clock interface

---

## Git Commits

- ✅ `5e41b87` - Phase 1: User-Employee linking infrastructure (backend)
- ✅ `5cfdd0f` - Phase 2: Employee portal queries (work orders & loadouts)
- ⏳ Next: Phase 2.3 Time tracking schema and mutations
- ⏳ Next: Phase 3 Admin UI implementation
- ⏳ Next: Phase 4 Employee mobile views

---

**Last Updated:** 2025-01-13
**Current Branch:** checkpoint-3
**Status:** Phases 1 & 2 (partial) Complete - Ready for Time Tracking
