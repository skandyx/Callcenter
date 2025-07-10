"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CallLog from "./call-log";
import StatusDetailsChart from "./status-details-chart";
import AgentStatusLog from "./agent-status-log";
import AdvancedCallLog from "./advanced-call-log";
import WorldMapChart from "./world-map-chart";
import { type CallData, type AdvancedCallData, type AgentStatusData } from "@/lib/types";

interface CallAnalyticsTabsProps {
  callData: CallData[];
  advancedCallData: AdvancedCallData[];
  agentStatusData: AgentStatusData[];
}

export default function CallAnalyticsTabs({ callData, advancedCallData, agentStatusData }: CallAnalyticsTabsProps) {
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
        <CallLog data={callData} />
      </TabsContent>
      <TabsContent value="status">
        <StatusDetailsChart data={callData} />
      </TabsContent>
       <TabsContent value="agent-status">
        <AgentStatusLog data={agentStatusData} />
      </TabsContent>
      <TabsContent value="advanced">
        <AdvancedCallLog data={advancedCallData} />
      </TabsContent>
      <TabsContent value="map">
        <WorldMapChart data={callData} />
      </TabsContent>
    </Tabs>
  );
}
