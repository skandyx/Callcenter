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

const ROWS_PER_PAGE = 10;

export default function CallLog({ data }: { data: CallData[] }) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return data
      .filter((call) =>
        statusFilter === "all" ? true : call.status === statusFilter
      )
      .filter(
        (call) =>
          call.calling_number.includes(filter) ||
          call.agent?.toLowerCase().includes(filter.toLowerCase()) ||
          call.queue_name.toLowerCase().includes(filter.toLowerCase())
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
          Detailed view of individual calls for the current day.
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
                paginatedData.map((call) => (
                  <TableRow key={call.call_id}>
                    <TableCell>
                      {new Date(call.enter_datetime).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {call.calling_number}
                    </TableCell>
                    <TableCell>{call.queue_name}</TableCell>
                    <TableCell>{call.agent || "N/A"}</TableCell>
                    <TableCell>{call.time_in_queue_seconds}s</TableCell>
                    <TableCell>{call.processing_time_seconds}s</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusVariant(call.status)}>
                        {call.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
