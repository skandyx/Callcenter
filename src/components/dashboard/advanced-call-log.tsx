
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
import { cn } from "@/lib/utils";
import { ArrowRightLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


const ROWS_PER_PAGE = 10;

interface AdvancedCallLogProps {
  data: AdvancedCallData[];
}

type GroupedCall = {
  parent: AdvancedCallData;
  children: AdvancedCallData[];
};

export default function AdvancedCallLog({ data }: AdvancedCallLogProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const groupedAndFilteredData = useMemo(() => {
    // Group calls by their ultimate parent ID
    const callGroups: { [key: string]: GroupedCall } = {};

    // First pass: identify all items and their potential parents
    data.forEach(call => {
      const parentId = call.parent_call_id || call.call_id;
      if (!callGroups[parentId]) {
        // Find the ultimate parent in the dataset
        let ultimateParent = call;
        let currentCall = call;
        const visitedIds = new Set();
        while(currentCall.parent_call_id && !visitedIds.has(currentCall.call_id)) {
            visitedIds.add(currentCall.call_id);
            const parentInData = data.find(p => p.call_id === currentCall.parent_call_id);
            if (parentInData) {
                ultimateParent = parentInData;
                currentCall = parentInData;
            } else {
                break;
            }
        }
        callGroups[ultimateParent.call_id] = { parent: ultimateParent, children: [] };
      }
    });

    // Second pass: correctly assign parents and children
    const finalGroups: { [key: string]: GroupedCall } = {};
    data.forEach(call => {
        let ultimateParent = call;
        let currentCall = call;
        const visitedIds = new Set();
        while(currentCall.parent_call_id && !visitedIds.has(currentCall.call_id)) {
            visitedIds.add(currentCall.call_id);
            const parentInData = data.find(p => p.call_id === currentCall.parent_call_id);
            if (parentInData) {
                ultimateParent = parentInData;
                currentCall = parentInData;
            } else {
                break;
            }
        }

        if (!finalGroups[ultimateParent.call_id]) {
          finalGroups[ultimateParent.call_id] = { parent: ultimateParent, children: [] };
        }
        if (ultimateParent.call_id !== call.call_id) {
          finalGroups[ultimateParent.call_id].children.push(call);
        }
    });

    // Sort children by date within each group
    Object.values(finalGroups).forEach(group => {
      group.children.sort((a, b) => new Date(a.enter_datetime).getTime() - new Date(b.enter_datetime).getTime());
    });

    const flatList = Object.values(finalGroups)
      .sort((a, b) => new Date(b.parent.enter_datetime).getTime() - new Date(a.parent.enter_datetime).getTime())
      .flatMap(group => {
         const children = group.children.map((child, index) => ({...child, isChild: true, isFirstChild: index === 0}));
         return [{...group.parent, hasChildren: group.children.length > 0}, ...children];
      });

    if (!filter) {
      return flatList;
    }
    
    const lowercasedFilter = filter.toLowerCase();

    return Object.values(finalGroups)
      .filter(group => {
        const parentMatch = Object.values(group.parent).some(val => val?.toString().toLowerCase().includes(lowercasedFilter));
        const childrenMatch = group.children.some(child => Object.values(child).some(val => val?.toString().toLowerCase().includes(lowercasedFilter)));
        return parentMatch || childrenMatch;
      })
      .sort((a, b) => new Date(b.parent.enter_datetime).getTime() - new Date(a.parent.enter_datetime).getTime())
      .flatMap(group => {
         const children = group.children.map((child, index) => ({...child, isChild: true, isFirstChild: index === 0}));
         return [{...group.parent, hasChildren: group.children.length > 0}, ...children];
      });

  }, [data, filter]);

  const totalPages = Math.ceil(groupedAndFilteredData.length / ROWS_PER_PAGE);
  const paginatedData = groupedAndFilteredData.slice(
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

  const findParent = (parentId: string | null | undefined) => {
    if (!parentId) return null;
    return data.find(c => c.call_id === parentId) || null;
  }

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
          Journaux d'événements détaillés pour chaque appel, y compris les transferts et les tentatives. Idéal pour une analyse forensique.
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Detail</TableHead>
                  <TableHead>Talk Time</TableHead>
                  <TableHead>Call ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => {
                    const parentCall = findParent(item.parent_call_id);
                    // If this is a parent call that has children, its status should be considered "Completed"
                    // as the agent successfully completed their action (transferring).
                    const displayStatus = (!item.isChild && item.hasChildren) ? "Completed" : item.status;
                    const isActualTransfer = item.status_detail.toLowerCase().includes('transfer');

                    return (
                    <TableRow 
                      key={`${item.call_id}-${index}`}
                      className={cn(!item.isChild && item.hasChildren && "bg-muted/50")}
                    >
                      <TableCell className="align-top">
                        <div className="flex items-center">
                          {item.isChild && (
                            <div className="relative w-8 h-full mr-2">
                                <div className="absolute left-1/2 w-px h-full bg-border -translate-x-1/2"></div>
                                <div className="absolute top-1/2 w-4 h-px bg-border -translate-y-1/2"></div>
                            </div>
                          )}
                           <div className={cn("flex-1", item.isChild && "pl-0")}>
                              <div>{new Date(item.enter_datetime).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                              <div className="text-muted-foreground text-xs">{new Date(item.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium align-top">
                        <div className="flex items-center gap-2">
                          <span>{item.calling_number}</span>
                          {item.parent_call_id && isActualTransfer && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Transfert de : {parentCall?.calling_number || "Inconnu"}</p>
                                  <p className="text-xs text-muted-foreground">ID: {item.parent_call_id}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">{item.queue_name || "Direct call"}</TableCell>
                      <TableCell className="align-top">{item.agent || "N/A"}</TableCell>
                      <TableCell className="align-top">
                        <Badge variant={getStatusVariant(displayStatus)}>{displayStatus}</Badge>
                      </TableCell>
                      <TableCell className="align-top">{item.status_detail}</TableCell>
                      <TableCell className="align-top">{item.processing_time_seconds ?? 0}s</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground align-top">
                        {item.call_id}
                      </TableCell>
                    </TableRow>
                  )})
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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
