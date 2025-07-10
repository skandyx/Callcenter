
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type CallData } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface RawDataInputProps {
  onDataUpdate: (data: CallData[]) => void;
}

const exampleData = [
    {
        "enter_datetime": "2025-07-10T16:00:00Z",
        "enter_hour": 16, "enter_year": 2025, "enter_month": 202507,
        "time_in_queue_seconds": null, "processing_time_seconds": 120,
        "less_than_30s_waittime": null, "version": 5, "call_id": "outgoing-tunisia-1",
        "queue_name": null, "enter_date": "2025-07-10", "enter_time": "16:00:00",
        "enter_weekday": "4.Thursday", "calling_number": "+21671123456",
        "agent": "Zoro Roronoa", "status": "Completed", "status_detail": "Outgoing",
        "calling_name": "Client Tunisie", "enter_week": "202528", "internal_call": "No",
        "agent_id": "deadbeef", "agent_number": "003228829677", "parent_call_id": null
    },
    {
        "enter_datetime": "2025-07-10T16:02:00Z",
        "enter_hour": 16, "enter_year": 2025, "enter_month": 202507,
        "time_in_queue_seconds": null, "processing_time_seconds": 90,
        "less_than_30s_waittime": null, "version": 5, "call_id": "outgoing-germany-1",
        "queue_name": null, "enter_date": "2025-07-10", "enter_time": "16:02:00",
        "enter_weekday": "4.Thursday", "calling_number": "+493012345678",
        "agent": "Zoro Roronoa", "status": "Completed", "status_detail": "Outgoing",
        "calling_name": "Client Allemagne", "enter_week": "202528", "internal_call": "No",
        "agent_id": "deadbeef", "agent_number": "003228829677", "parent_call_id": null
    },
    {
        "enter_datetime": "2025-07-10T16:05:00Z",
        "enter_hour": 16, "enter_year": 2025, "enter_month": 202507,
        "time_in_queue_seconds": null, "processing_time_seconds": 180,
        "less_than_30s_waittime": null, "version": 5, "call_id": "outgoing-canada-1",
        "queue_name": null, "enter_date": "2025-07-10", "enter_time": "16:05:00",
        "enter_weekday": "4.Thursday", "calling_number": "+15141234567",
        "agent": "Luffy Monkey D", "status": "Completed", "status_detail": "Outgoing",
        "calling_name": "Client Canada", "enter_week": "202528", "internal_call": "No",
        "agent_id": "1f5742da", "agent_number": "003228829631", "parent_call_id": null
    },
    {
        "enter_datetime": "2025-07-10T16:10:00Z",
        "enter_hour": 16, "enter_year": 2025, "enter_month": 202507,
        "time_in_queue_seconds": null, "processing_time_seconds": 240,
        "less_than_30s_waittime": null, "version": 5, "call_id": "outgoing-china-1",
        "queue_name": null, "enter_date": "2025-07-10", "enter_time": "16:10:00",
        "enter_weekday": "4.Thursday", "calling_number": "+861012345678",
        "agent": "Luffy Monkey D", "status": "Completed", "status_detail": "Outgoing",
        "calling_name": "Client Chine", "enter_week": "202528", "internal_call": "No",
        "agent_id": "1f5742da", "agent_number": "003228829631", "parent_call_id": null
    },
    {
        "enter_datetime": "2025-07-10T15:05:00.123Z",
        "enter_hour": 15, "enter_year": 2025, "enter_month": "202507",
        "time_in_queue_seconds": 15, "processing_time_seconds": 120,
        "less_than_30s_waittime": 1, "version": 5, "call_id": "f2a4b1c9-1e3d-4c5f-8a9b-0d1e2f3a4b5c",
        "queue_name": "Support", "enter_date": "2025-07-10", "enter_time": "15:05:00",
        "enter_weekday": "4.Thursday", "calling_number": "+33123456789",
        "agent": "Zoro Roronoa", "status": "Completed", "status_detail": "Incoming",
        "calling_name": "Client France", "enter_week": "202528", "internal_call": "No",
        "agent_id": "deadbeef", "agent_number": "003228829677", "parent_call_id": null
    }
];

export default function RawDataInput({ onDataUpdate }: RawDataInputProps) {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(exampleData, null, 2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleJsonUpdate = () => {
     try {
      const parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        throw new Error("Input data must be a JSON array.");
      }
      onDataUpdate(parsedData);
      toast({
        title: "Success!",
        description: "Dashboard has been updated with the pasted data.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: error.message || "Please check the format of your data.",
      });
    }
  }

  const handleSubmitToServer = async () => {
    setIsSubmitting(true);
    try {
      const parsedData = JSON.parse(jsonInput);
       if (!Array.isArray(parsedData)) {
        throw new Error("Input data must be a JSON array.");
      }

      // We can post to both endpoints to simulate a full data flow
      await Promise.all([
          fetch('/api/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedData),
          }),
          fetch('/api/stream/advanced-calls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedData),
          }),
      ]);

      toast({
        title: "Data Submitted!",
        description: "Your data has been sent to the server. The dashboard will update automatically.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: error.message || "Please check the format of your data and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Data Input</CardTitle>
        <CardDescription>
          Paste your call data as a JSON array below to update the dashboard.
          You can update the preview directly, or submit the data to the server to test the full `curl` flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={20}
          className="font-mono text-xs"
          placeholder="Paste your JSON array here..."
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleJsonUpdate}>Update Dashboard Preview</Button>
          <Button onClick={handleSubmitToServer} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit to Server (Simulate Curl)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
