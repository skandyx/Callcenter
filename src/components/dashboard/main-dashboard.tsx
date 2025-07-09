"use client";

import { useState, useEffect, useCallback } from "react";
import { type CallData } from "@/lib/types";

import MetricsDashboard from "@/components/dashboard/metrics-dashboard";
import AiSummary from "@/components/dashboard/ai-summary";
import AnomalyDetector from "@/components/dashboard/anomaly-detector";
import CallAnalyticsTabs from "@/components/dashboard/call-analytics-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import AdvancedSettingsDialog from "./advanced-settings-dialog";
import { cn } from "@/lib/utils";
import RawDataInput from "./raw-data-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function MainDashboard() {
  const [callData, setCallData] = useState<CallData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dataReceived, setDataReceived] = useState(false);
  const { toast } = useToast();

  const fetchCallData = useCallback(async () => {
    try {
      const response = await fetch('/api/call-data');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: CallData[] = await response.json();
      setCallData(data);
      if (data.length > 0) {
        setDataReceived(true);
      }
    } catch (error) {
      console.error("Failed to fetch call data:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch real-time data from the server.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Fetch initial data
    fetchCallData();

    // Poll for new data every 3 seconds
    const intervalId = setInterval(fetchCallData, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchCallData]);


  const handleDataUpdateFromInput = (newData: CallData[]) => {
    setCallData(newData);
     if (newData.length > 0) {
        setDataReceived(true);
      }
  };

  return (
    <div className="flex flex-col min-h-screen dark bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background/80 backdrop-blur-sm md:px-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Call Center Analytics
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-3 w-3 rounded-full animate-pulse",
                  dataReceived ? "bg-green-500" : "bg-red-500"
                )}
              ></span>
              <span className="text-sm text-muted-foreground">
                {dataReceived ? "Receiving Data" : "No Data"}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="data_input">Manual Data Input</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            {isLoading && callData.length === 0 ? (
              <DashboardSkeleton />
            ) : (
              <div className="flex flex-col gap-8">
                <MetricsDashboard data={callData} />
                <div className="grid gap-8 lg:grid-cols-2">
                  <AiSummary data={callData} dataLength={callData.length} />
                  <AnomalyDetector data={callData} dataLength={callData.length} />
                </div>
                <CallAnalyticsTabs data={callData} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="data_input">
            <RawDataInput onDataUpdate={handleDataUpdateFromInput} />
          </TabsContent>
        </Tabs>
      </main>
      <AdvancedSettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
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
