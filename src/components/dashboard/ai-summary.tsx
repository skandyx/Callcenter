"use client";

import { useState, useEffect } from "react";
import { type CallData } from "@/lib/types";
import { generateDailySummary } from "@/ai/flows/daily-executive-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AiSummaryProps {
  data: CallData[];
  dataLength: number;
}

export default function AiSummary({ data, dataLength }: AiSummaryProps) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSummary = async () => {
      setIsLoading(true);
      try {
        const result = await generateDailySummary({
          callData: JSON.stringify(data),
        });
        setSummary(result.summary);
      } catch (error) {
        console.error("Error generating AI summary:", error);
        toast({
          variant: "destructive",
          title: "AI Summary Error",
          description: "Could not generate the daily executive summary.",
        });
        setSummary("Failed to generate summary. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (data.length > 0) {
      getSummary();
    } else {
      setSummary("No data available to generate a summary.");
      setIsLoading(false);
    }
  }, [dataLength, toast]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Lightbulb className="w-6 h-6 text-accent" />
        <CardTitle>Daily Executive Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
