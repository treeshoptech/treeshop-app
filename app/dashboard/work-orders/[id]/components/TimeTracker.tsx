"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Box,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import MobileTimeTracker from "@/app/components/time-tracking/MobileTimeTracker";
import TimeTrackingReport from "@/app/components/reports/TimeTrackingReport";

interface TimeTrackerProps {
  workOrderId: Id<"workOrders">;
  lineItemId?: Id<"lineItems">;
}

export default function TimeTracker({ workOrderId, lineItemId }: TimeTrackerProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Get current user's employee record
  const user = useQuery(api.users.currentUser);
  const employee = user ? useQuery(api.employees.getByClerkUserId, {
    clerkUserId: user.clerkId
  }) : undefined;

  if (!employee) {
    return (
      <Alert severity="warning">
        You must be linked to an employee record to use time tracking.
      </Alert>
    );
  }

  return (
    <Box>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Time Tracker" />
        <Tab label="Reports & Analytics" />
      </Tabs>

      {/* Tab 1: Time Tracker */}
      {activeTab === 0 && (
        <MobileTimeTracker
          workOrderId={workOrderId}
          employeeId={employee._id}
        />
      )}

      {/* Tab 2: Reports */}
      {activeTab === 1 && (
        <TimeTrackingReport workOrderId={workOrderId} />
      )}
    </Box>
  );
}
