
"use client";

import { useState, useMemo } from "react";
import { type CallData } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, ArrowUpCircle, Users } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";

const ROWS_PER_PAGE = 10;

export default function CallLog({ data }: { data: CallData[] }) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(b.enter_datetime).getTime() - new Date(a.enter_datetime).getTime());
    
    const lowercasedFilter = filter.toLowerCase();

    return sortedData
      .filter((call) =>
        statusFilter === "all" ? true : call.status.trim().toLowerCase() === statusFilter.trim().toLowerCase()
      )
      .filter(
        (call) => {
          if (!filter) return true;
          // Check all relevant fields for a match
          return Object.values(call).some(value => 
            value && value.toString().toLowerCase().includes(lowercasedFilter)
          );
        }
      );
  }, [data, filter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const getStatusVariant = (
    status: CallData["status"]
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Completed":
        return "default";
      case "Abandoned":
        return "destructive";
      case "Redirected":
        return "secondary";
      case "Direct call":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Log</CardTitle>
        <CardDescription>
          Vue détaillée des appels individuels pour la journée en cours.
        </CardDescription>
        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
          <Input
            placeholder="Filter across all columns..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Abandoned">Abandoned</SelectItem>
              <SelectItem value="Redirected">Redirected</SelectItem>
              <SelectItem value="Direct call">Direct Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Queue</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead>Talk Time</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((call, index) => {
                  const isOutgoingWithPresentedCli = 
                      call.status_detail?.toLowerCase().includes("outgoing") &&
                      call.presented_number && 
                      call.agent_number && 
                      call.presented_number !== call.agent_number;

                  return (
                  <TableRow key={`${call.call_id}-${index}`}>
                     <TableCell>
                      {new Date(call.enter_datetime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(call.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {call.status_detail?.toLowerCase().includes("incoming") && (
                                <ArrowDownCircle className="h-4 w-4 text-green-500" />
                              )}
                              {isOutgoingWithPresentedCli ? (
                                <Users className="h-4 w-4 text-blue-500" />
                               ) : (
                                call.status_detail?.toLowerCase().includes("outgoing") && (
                                <ArrowUpCircle className="h-4 w-4 text-red-500" />
                               )
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                               {isOutgoingWithPresentedCli ? (
                                  <p>Présenté : {call.presented_number} (Agent : {call.agent_number})</p>
                                ) : (
                                  <p>{call.status_detail}</p>
                                )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span>{call.calling_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{call.queue_name || "Direct call"}</TableCell>
                    <TableCell>{call.agent || "N/A"}</TableCell>
                    <TableCell>{call.time_in_queue_seconds || 0}s</TableCell>
                    <TableCell>{call.processing_time_seconds || 0}s</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusVariant(call.status)}>
                        {call.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No results found.
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
