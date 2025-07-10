"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type AdvancedCallData } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { ArrowRightLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const ROWS_PER_PAGE = 10;

export default function AdvancedCallLog() {
  const [data, setData] = useState<AdvancedCallData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAdvancedCallData = useCallback(async () => {
    try {
      const response = await fetch('/api/advanced-call-data');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fetchedData: AdvancedCallData[] = await response.json();
      setData(fetchedData);
    } catch (error) {
      console.error("Failed to fetch advanced call data:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch advanced call data from the server.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdvancedCallData();
    const intervalId = setInterval(fetchAdvancedCallData, 3000); 
    return () => clearInterval(intervalId);
  }, [fetchAdvancedCallData]);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.calling_number.toLowerCase().includes(filter.toLowerCase()) ||
        (item.agent || "").toLowerCase().includes(filter.toLowerCase()) ||
        (item.queue_name || "").toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );
  
  const getStatusVariant = (status: AdvancedCallData["status"]): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Completed": return "default";
      case "Abandoned": return "destructive";
      case "Redirected": return "secondary";
      case "Direct call": return "outline";
      default: return "secondary";
    }
  };

  if (isLoading) {
      return (
          <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Call Log</CardTitle>
        <CardDescription>
          Detailed event logs for each call, including transfers and attempts.
        </CardDescription>
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
          <Input
            placeholder="Filter by number, agent, or queue..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Detail</TableHead>
                  <TableHead>Transfer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <TableRow key={`${item.call_id}-${index}`}>
                      <TableCell>
                        {new Date(item.enter_datetime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(item.enter_datetime).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.calling_number}
                      </TableCell>
                      <TableCell>{item.queue_name || "N/A"}</TableCell>
                      <TableCell>{item.agent || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{item.status_detail}</TableCell>
                      <TableCell>
                        {item.parent_call_id && (
                          <Tooltip>
                            <TooltipTrigger>
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Transferred from: {item.parent_call_id}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No advanced call data received yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-end pt-4 space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
