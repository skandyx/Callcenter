"use client";

import { useState, useMemo } from "react";
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
import { Skeleton } from "../ui/skeleton";

const ROWS_PER_PAGE = 10;

interface AgentStatusLogProps {
  data: AgentStatusData[];
}

export default function AgentStatusLog({ data }: AgentStatusLogProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(`${a.date}T${String(a.hour).padStart(2, '0')}:00:00`);
        const dateB = new Date(`${b.date}T${String(b.hour).padStart(2, '0')}:00:00`);
        return dateB.getTime() - dateA.getTime();
    });

    if (!filter) {
        return sortedData;
    }
    
    const lowercasedFilter = filter.toLowerCase();

    return sortedData.filter(
      (item) => {
        // Check all relevant fields for a match
        return Object.values(item).some(value => 
            value && value.toString().toLowerCase().includes(lowercasedFilter)
        );
      }
    );
  }, [data, filter]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );
  
  if(!data) {
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
          Statut en direct des connexions et de la disponibilité des agents.
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
                    No agent status data received for the selected date.
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
