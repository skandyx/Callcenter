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
    "enter_datetime": "2024-07-31T15:30:00Z",
    "enter_hour": 15,
    "enter_year": 2024,
    "enter_month": 202407,
    "time_in_queue_seconds": 25,
    "processing_time_seconds": 180,
    "less_than_30s_waittime": 1,
    "less_than_60s_waittime": 1,
    "less_than_120s_waittime": 1,
    "version": 4,
    "call_id": "call-abc-123-xyz",
    "queue_name": "Support Technique",
    "enter_date": "2024-07-31",
    "enter_time": "15:30:00",
    "enter_weekday": "3 Mercredi",
    "calling_number": "+33123456789",
    "calling_forward": null,
    "agent": "Alice Martin",
    "status": "Completed",
    "status_detail": "Completed by answers",
    "calling_name": "Société Dupont",
    "enter_week": "202431",
    "internal_call": "No",
    "agent_id": "agent-789",
    "agent_number": "202",
    "parent_call_id": null
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

      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit data to server.');
      }
      
      const result = await response.json();
      onDataUpdate(result.data); // Update dashboard with the full data from server

      toast({
        title: "Data Submitted!",
        description: "Your data has been sent to the server and the dashboard is updated.",
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
