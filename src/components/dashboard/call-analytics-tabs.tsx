
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
    <Tabs defaultValue="simplified">
      <ScrollArea className="w-full whitespace-nowrap">
        <TabsList className="grid w-max grid-cols-6">
          <TabsTrigger value="simplified">Données d'appel simplifiées</TabsTrigger>
          <TabsTrigger value="advanced">Données d'appel avancées</TabsTrigger>
          <TabsTrigger value="agent-status">Disponibilité des agents</TabsTrigger>
          <TabsTrigger value="queue-ivr">Parcours IVR (avancé)</TabsTrigger>
          <TabsTrigger value="status-details">Analyse par statut</TabsTrigger>
          <TabsTrigger value="map">Carte du monde</TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="simplified" className="mt-4">
        <CallLog data={callData} />
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
      <TabsContent value="status-details" className="mt-4">
        <StatusDetailsChart data={callData} />
      </TabsContent>
    </Tabs>
  );
}
