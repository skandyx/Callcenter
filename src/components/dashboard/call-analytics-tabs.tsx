"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CallLog from "./call-log";
import StatusDetailsChart from "./status-details-chart";
import AgentStatusLog from "./agent-status-log";
import AdvancedCallLog from "./advanced-call-log";
import WorldMapChart from "./world-map-chart";
import { type CallData } from "@/lib/types";

interface CallAnalyticsTabsProps {
  data: CallData[];
}

export default function CallAnalyticsTabs({ data }: CallAnalyticsTabsProps) {
  return (
    <Tabs defaultValue="log">
      <TabsList className="grid w-full grid-cols-5 md:w-[800px]">
        <TabsTrigger value="log">Call Log</TabsTrigger>
        <TabsTrigger value="status">Status Details</TabsTrigger>
        <TabsTrigger value="agent-status">Agent Status</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="map">World Map</TabsTrigger>
      </TabsList>
      <TabsContent value="log">
        <CallLog data={data} />
      </TabsContent>
      <TabsContent value="status">
        <StatusDetailsChart data={data} />
      </TabsContent>
       <TabsContent value="agent-status">
        <AgentStatusLog />
      </TabsContent>
      <TabsContent value="advanced">
        <AdvancedCallLog />
      </TabsContent>
      <TabsContent value="map">
        <WorldMapChart data={data} />
      </TabsContent>
    </Tabs>
  );
}
