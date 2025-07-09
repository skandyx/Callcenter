"use client";

import { useState, useEffect } from "react";
import { type CallData } from "@/lib/types";
import { detectCallAnomalies } from "@/ai/flows/anomaly-detection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnomalyDetectorProps {
  data: CallData[];
}

export default function AnomalyDetector({ data }: AnomalyDetectorProps) {
  const [anomalies, setAnomalies] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getAnomalies = async () => {
      setIsLoading(true);
      try {
        const result = await detectCallAnomalies({
          callData: JSON.stringify(data),
        });
        setAnomalies(result.summary);
      } catch (error) {
        console.error("Error detecting anomalies:", error);
        toast({
          variant: "destructive",
          title: "AI Anomaly Detection Error",
          description: "Could not perform anomaly detection.",
        });
        setAnomalies("Failed to detect anomalies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (data.length > 0) {
      getAnomalies();
    }
  }, [data, toast]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <CardTitle>Anomaly Detection</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {anomalies}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
