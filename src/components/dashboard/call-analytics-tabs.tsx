"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CallLog from "./call-log";
import StatusDetailsChart from "./status-details-chart";
import { type CallData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface CallAnalyticsTabsProps {
  data: CallData[];
}

export default function CallAnalyticsTabs({ data }: CallAnalyticsTabsProps) {
  return (
    <Tabs defaultValue="log">
      <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
        <TabsTrigger value="log">Call Log</TabsTrigger>
        <TabsTrigger value="status">Status Details</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      <TabsContent value="log">
        <CallLog data={data} />
      </TabsContent>
      <TabsContent value="status">
        <StatusDetailsChart data={data} />
      </TabsContent>
      <TabsContent value="advanced">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section is under construction. What advanced data would you like to see here?
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
