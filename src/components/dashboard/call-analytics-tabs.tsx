"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CallLog from "./call-log";
import StatusDetailsChart from "./status-details-chart";
import { type CallData } from "@/lib/types";

interface CallAnalyticsTabsProps {
  data: CallData[];
}

export default function CallAnalyticsTabs({ data }: CallAnalyticsTabsProps) {
  return (
    <Tabs defaultValue="log">
      <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="log">Call Log</TabsTrigger>
        <TabsTrigger value="status">Status Details</TabsTrigger>
      </TabsList>
      <TabsContent value="log">
        <CallLog data={data} />
      </TabsContent>
      <TabsContent value="status">
        <StatusDetailsChart data={data} />
      </TabsContent>
    </Tabs>
  );
}
