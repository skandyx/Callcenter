
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { type CallData, type AdvancedCallData, type AgentStatusData, type QueueIvrData, type ProfileAvailabilityData } from "@/lib/types";
import { format } from "date-fns";
import Link from 'next/link';

import MetricsDashboard from "@/components/dashboard/metrics-dashboard";
import AiSummary from "@/components/dashboard/ai-summary";
import AnomalyDetector from "@/components/dashboard/anomaly-detector";
import CallAnalyticsTabs from "@/components/dashboard/call-analytics-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Calendar as CalendarIcon, Settings, Tv } from "lucide-react";
import AdvancedSettingsDialog from "./advanced-settings-dialog";
import { cn } from "@/lib/utils";
import RawDataInput from "./raw-data-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "@/components/ui/calendar";

type DataReceivingStatus = 'inactive' | 'idle' | 'receiving' | 'error';

export default function MainDashboard() {
  const [allCallData, setAllCallData] = useState<CallData[]>([]);
  const [allAdvancedCallData, setAllAdvancedCallData] = useState<AdvancedCallData[]>([]);
  const [allAgentStatusData, setAllAgentStatusData] = useState<AgentStatusData[]>([]);
  const [allQueueIvrData, setAllQueueIvrData] = useState<QueueIvrData[]>([]);
  const [allProfileAvailabilityData, setAllProfileAvailabilityData] = useState<ProfileAvailabilityData[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDataFetchingEnabled, setIsDataFetchingEnabled] = useState(true);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dataReceivingStatus, setDataReceivingStatus] = useState<DataReceivingStatus>('idle');
  const { toast } = useToast();

  const fetchCallData = useCallback(async () => {
    let dataReceived = false;
    try {
      const response = await fetch('/api/stream');
      if (!response.ok) throw new Error('Network response was not ok for call data');
      const data: CallData[] = await response.json();
      setAllCallData(prevData => {
        if (JSON.stringify(data) !== JSON.stringify(prevData)) {
          dataReceived = true;
          return data;
        }
        return prevData;
      });
    } catch (error) {
      console.error("Failed to fetch call data:", error);
      setDataReceivingStatus('error');
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch real-time data from the server.",
      });
    }
    return dataReceived;
  }, [toast]);

  const fetchAdvancedCallData = useCallback(async () => {
    let dataReceived = false;
    try {
      const response = await fetch('/api/advanced-call-data');
      if (!response.ok) throw new Error('Network response was not ok for advanced call data');
      const data: AdvancedCallData[] = await response.json();
      setAllAdvancedCallData(prevData => {
        if (JSON.stringify(data) !== JSON.stringify(prevData)) {
          dataReceived = true;
          return data;
        }
        return prevData;
      });
    } catch (error) {
       console.error("Failed to fetch advanced call data:", error);
    }
    return dataReceived;
  }, []);

  const fetchAgentStatusData = useCallback(async () => {
    let dataReceived = false;
    try {
      const response = await fetch('/api/agent-status-data');
      if (!response.ok) throw new Error('Network response was not ok for agent status data');
      const data: AgentStatusData[] = await response.json();
      setAllAgentStatusData(prevData => {
        if (JSON.stringify(data) !== JSON.stringify(prevData)) {
          dataReceived = true;
          return data;
        }
        return prevData;
      });
    } catch (error) {
       console.error("Failed to fetch agent status data:", error);
    }
    return dataReceived;
  }, []);
  
  const fetchQueueIvrData = useCallback(async () => {
    let dataReceived = false;
    try {
      const response = await fetch('/api/queue-ivr-data');
      if (!response.ok) throw new Error('Network response was not ok for queue/IVR data');
      const data: QueueIvrData[] = await response.json();
      setAllQueueIvrData(prevData => {
        if (JSON.stringify(data) !== JSON.stringify(prevData)) {
          dataReceived = true;
          return data;
        }
        return prevData;
      });
    } catch (error) {
       console.error("Failed to fetch queue/IVR data:", error);
    }
    return dataReceived;
  }, []);

  const fetchProfileAvailabilityData = useCallback(async () => {
    // This endpoint doesn't exist yet as GET, so we just log for now
    // In a future step, a GET endpoint would be created.
    return false;
  }, []);


  const fetchAllData = useCallback(async () => {
    if (!isDataFetchingEnabled) {
      setDataReceivingStatus('inactive');
      return;
    }
    setDataReceivingStatus('idle');
    const results = await Promise.all([
      fetchCallData(),
      fetchAdvancedCallData(),
      fetchAgentStatusData(),
      fetchQueueIvrData(),
      fetchProfileAvailabilityData(),
    ]);

    const anyDataReceived = results.some(r => r);

    if (anyDataReceived) {
      setDataReceivingStatus('receiving');
      setTimeout(() => {
        if(isDataFetchingEnabled) setDataReceivingStatus('idle');
      }, 1000); // Green for 1 second then back to orange
    }

    if (isLoading) {
      setIsLoading(false);
    }
  }, [fetchCallData, fetchAdvancedCallData, fetchAgentStatusData, fetchQueueIvrData, fetchProfileAvailabilityData, isDataFetchingEnabled, isLoading]);
  
  useEffect(() => {
    if (isDataFetchingEnabled) {
      setDataReceivingStatus('idle');
      fetchAllData(); // Fetch initial data
      const intervalId = setInterval(fetchAllData, 3000);
      return () => clearInterval(intervalId);
    } else {
      setDataReceivingStatus('inactive');
    }
  }, [isDataFetchingEnabled, fetchAllData]);

  const handleDataUpdateFromInput = (newData: CallData[]) => {
    setAllCallData(newData);
  };

  const filteredCallData = useMemo(() => {
    if (!selectedDate) return allCallData;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return allCallData.filter(d => d.enter_date === formattedDate);
  }, [allCallData, selectedDate]);
  
  const filteredAdvancedCallData = useMemo(() => {
    if (!selectedDate) return allAdvancedCallData;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return allAdvancedCallData.filter(d => d.enter_date === formattedDate);
  }, [allAdvancedCallData, selectedDate]);

  const filteredAgentStatusData = useMemo(() => {
    if (!selectedDate) return allAgentStatusData;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return allAgentStatusData.filter(d => d.date === formattedDate);
  }, [allAgentStatusData, selectedDate]);
  
  const filteredQueueIvrData = useMemo(() => {
    if (!selectedDate) return allQueueIvrData;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    return allQueueIvrData.filter(d => new Date(d.datetime).toISOString().split('T')[0] === formattedDate);
  }, [allQueueIvrData, selectedDate]);

  const ledColorClass = {
    inactive: 'bg-red-500',
    idle: 'bg-orange-400',
    receiving: 'bg-green-500',
    error: 'bg-red-500 animate-ping'
  }[dataReceivingStatus];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between h-auto min-h-16 px-4 py-2 border-b shrink-0 bg-background/80 backdrop-blur-sm md:px-6">
        <h1 className="text-lg font-semibold tracking-tight md:text-2xl">
          Call Center Analytics
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-full transition-colors", ledColorClass)}></span>
            <Label htmlFor="fetching-switch" className="text-sm text-muted-foreground">Live</Label>
            <Switch
              id="fetching-switch"
              checked={isDataFetchingEnabled}
              onCheckedChange={setIsDataFetchingEnabled}
              aria-label="Toggle real-time data fetching"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="ai-switch" className="text-sm text-muted-foreground">IA</Label>
            <Switch
              id="ai-switch"
              checked={isAiEnabled}
              onCheckedChange={setIsAiEnabled}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full max-w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
               <Button 
                variant="link" 
                className="w-full"
                onClick={() => setSelectedDate(undefined)}>
                  Clear selection
               </Button>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/wallboard" aria-label="Open Wallboard">
                <Tv className="w-5 h-5" />
              </Link>
            </Button>
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
            {isLoading && allCallData.length === 0 ? (
              <DashboardSkeleton />
            ) : (
              <div className="flex flex-col gap-8">
                <MetricsDashboard data={filteredCallData} />
                {isAiEnabled && (
                  <div className="grid gap-8 lg:grid-cols-2">
                    <AiSummary data={filteredCallData} dataLength={filteredCallData.length} />
                    <AnomalyDetector data={filteredCallData} dataLength={filteredCallData.length} />
                  </div>
                )}
                <CallAnalyticsTabs 
                    callData={filteredCallData}
                    advancedCallData={filteredAdvancedCallData}
                    agentStatusData={filteredAgentStatusData}
                    queueIvrData={filteredQueueIvrData}
                />
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
    {true && (
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )}
    <Skeleton className="h-96 rounded-lg" />
  </div>
);
