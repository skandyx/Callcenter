"use client";

import { useState, useMemo } from "react";
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
import { Skeleton } from "../ui/skeleton";
import { ArrowRightLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const ROWS_PER_PAGE = 10;

interface AdvancedCallLogProps {
  data: AdvancedCallData[];
}

export default function AdvancedCallLog({ data }: AdvancedCallLogProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
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

  if (!data) {
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
          Journaux d'événements détaillés pour chaque appel, y compris les transferts et les tentatives.
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
                  <TableHead>Call ID</TableHead>
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
                        <div className="flex items-center gap-2">
                          <span>{item.calling_number}</span>
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
                        </div>
                      </TableCell>
                      <TableCell>{item.queue_name || "N/A"}</TableCell>
                      <TableCell>{item.agent || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{item.status_detail}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.call_id}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No advanced call data received for the selected date.
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
