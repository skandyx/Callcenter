"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type AgentStatusData } from "@/lib/types";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

const ROWS_PER_PAGE = 10;

export default function AgentStatusLog() {
  const [data, setData] = useState<AgentStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAgentStatusData = useCallback(async () => {
    try {
      const response = await fetch('/api/agent-status-data');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const fetchedData: AgentStatusData[] = await response.json();
      setData(fetchedData);
    } catch (error) {
      console.error("Failed to fetch agent status data:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch agent status data from the server.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAgentStatusData();
    const intervalId = setInterval(fetchAgentStatusData, 5000); 
    return () => clearInterval(intervalId);
  }, [fetchAgentStatusData]);


  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.user.toLowerCase().includes(filter.toLowerCase()) ||
        item.email.toLowerCase().includes(filter.toLowerCase()) ||
        item.queuename.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );
  
  if(isLoading) {
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
        <CardTitle>Agent Status Log</CardTitle>
        <CardDescription>
          Live status of agent connections and availability.
        </CardDescription>
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
          <Input
            placeholder="Filter by agent, email, or queue..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Hour</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead>Logged In (min)</TableHead>
                <TableHead>Logged Out (min)</TableHead>
                <TableHead>Idle (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={`${item.user_id}-${item.queue_id}-${item.date}-${item.hour}-${index}`}>
                    <TableCell>
                      {item.date}
                    </TableCell>
                    <TableCell>
                      {item.hour}:00
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.user}
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.queuename}</TableCell>
                    <TableCell>{item.loggedIn}</TableCell>
                    <TableCell>{item.loggedOut}</TableCell>
                    <TableCell>{item.idle}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No agent status data received yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
