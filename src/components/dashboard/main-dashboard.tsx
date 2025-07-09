"use client";

import { useState, useEffect } from "react";
import { type CallData } from "@/lib/types";
import { mockCallData } from "@/lib/mock-data";

import MetricsDashboard from "@/components/dashboard/metrics-dashboard";
import AiSummary from "@/components/dashboard/ai-summary";
import AnomalyDetector from "@/components/dashboard/anomaly-detector";
import CallAnalyticsTabs from "@/components/dashboard/call-analytics-tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainDashboard() {
  const [callData, setCallData] = useState<CallData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setCallData(mockCallData);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col min-h-screen dark bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b shrink-0 bg-background/80 backdrop-blur-sm md:px-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Call Center Analytics
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="flex flex-col gap-8">
            <MetricsDashboard data={callData} />
            <div className="grid gap-8 lg:grid-cols-2">
              <AiSummary data={callData} />
              <AnomalyDetector data={callData} />
            </div>
            <CallAnalyticsTabs data={callData} />
          </div>
        )}
      </main>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
    <Skeleton className="h-96 rounded-lg" />
  </div>
);
