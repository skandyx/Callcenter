
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CallLog from "./call-log";
import StatusDetailsChart from "./status-details-chart";
import AgentStatusLog from "./agent-status-log";
import AdvancedCallLog from "./advanced-call-log";
import WorldMapChart from "./world-map-chart";
import QueueIvrLog from "./queue-ivr-log";
import { type CallData, type AdvancedCallData, type AgentStatusData, type QueueIvrData } from "@/lib/types";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface CallAnalyticsTabsProps {
  callData: CallData[];
  advancedCallData: AdvancedCallData[];
  agentStatusData: AgentStatusData[];
  queueIvrData: QueueIvrData[];
}

export default function CallAnalyticsTabs({ callData, advancedCallData, agentStatusData, queueIvrData }: CallAnalyticsTabsProps) {
  return (
    <Tabs defaultValue="log">
      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="grid w-max grid-cols-6">
          <TabsTrigger value="log">Call Log</TabsTrigger>
          <TabsTrigger value="status">Status Details</TabsTrigger>
          <TabsTrigger value="agent-status">Agent Status</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="map">World Map</TabsTrigger>
          <TabsTrigger value="queue-ivr">Queue & IVR</TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="log" className="mt-4">
        <CallLog data={callData} />
      </TabsContent>
      <TabsContent value="status" className="mt-4">
        <StatusDetailsChart data={callData} />
      </TabsContent>
       <TabsContent value="agent-status" className="mt-4">
        <AgentStatusLog data={agentStatusData} />
      </TabsContent>
      <TabsContent value="advanced" className="mt-4">
        <AdvancedCallLog data={advancedCallData} />
      </TabsContent>
      <TabsContent value="map" className="mt-4">
        <WorldMapChart data={callData} />
      </TabsContent>
      <TabsContent value="queue-ivr" className="mt-4">
        <QueueIvrLog data={queueIvrData} callData={callData} />
      </TabsContent>
    </Tabs>
  );
}
