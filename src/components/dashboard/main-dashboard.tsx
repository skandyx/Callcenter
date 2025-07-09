"use client";

import { useState, useEffect } from "react";
import { type CallData } from "@/lib/types";

import MetricsDashboard from "@/components/dashboard/metrics-dashboard";
import AiSummary from "@/components/dashboard/ai-summary";
import AnomalyDetector from "@/components/dashboard/anomaly-detector";
import CallAnalyticsTabs from "@/components/dashboard/call-analytics-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import AdvancedSettingsDialog from "./advanced-settings-dialog";

export default function MainDashboard() {
  const [callData, setCallData] = useState<CallData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/call-data");
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let receivedData = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsLoading(false);
            break;
          }
          receivedData += decoder.decode(value, { stream: true });

          // Traiter les objets JSON complets reçus
          const jsonObjects = receivedData.split("\n");
          receivedData = jsonObjects.pop() || ""; // Garder la partie incomplète pour la prochaine itération

          for (const jsonObj of jsonObjects) {
            if (jsonObj) {
              try {
                const parsedChunk = JSON.parse(jsonObj);
                setCallData((prevData) => [...prevData, ...parsedChunk]);
              } catch (error) {
                console.error("Error parsing JSON chunk:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data stream:", error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen dark bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background/80 backdrop-blur-sm md:px-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Call Center Analytics
        </h1>
        <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="w-5 h-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        {isLoading && callData.length === 0 ? (
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
