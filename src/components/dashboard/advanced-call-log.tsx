
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
import { ArrowRightLeft, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";


const ROWS_PER_PAGE = 20; // Increased to better show groups

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

  const groupedData = useMemo(() => {
    const callMap = new Map<string, AdvancedCallData>();
    data.forEach(call => callMap.set(call.call_id, call));

    const callGroups = new Map<string, GroupedCall>();
    const rootCalls: AdvancedCallData[] = [];

    // First pass: identify root calls and group children
    data.forEach(call => {
      if (!call.parent_call_id || !callMap.has(call.parent_call_id)) {
        // This is a root call
        rootCalls.push(call);
        if (!callGroups.has(call.call_id)) {
            callGroups.set(call.call_id, { parent: call, children: [] });
        }
      } else {
        // This is a child call, find its ultimate parent
        let currentCall = call;
        let ultimateParent = callMap.get(currentCall.parent_call_id);
        const visited = new Set<string>([currentCall.call_id]);

        while (ultimateParent && ultimateParent.parent_call_id && callMap.has(ultimateParent.parent_call_id)) {
          if (visited.has(ultimateParent.call_id)) break; // Cycle detected
          visited.add(ultimateParent.call_id);
          ultimateParent = callMap.get(ultimateParent.parent_call_id);
        }

        if (ultimateParent) {
            if (!callGroups.has(ultimateParent.call_id)) {
                callGroups.set(ultimateParent.call_id, { parent: ultimateParent, children: [] });
            }
            // Add the original call to children, not the intermediate parent
            callGroups.get(ultimateParent.call_id)!.children.push(call);
        }
      }
    });

    // Sort children chronologically within each group
    callGroups.forEach(group => {
      group.children.sort((a, b) => new Date(a.enter_datetime).getTime() - new Date(b.enter_datetime).getTime());
    });

    // Combine parent and sorted children into a final list of groups
    const finalGroups = Array.from(callGroups.values());

    // Sort the groups by the parent's datetime in descending order
    return finalGroups.sort((a, b) => new Date(b.parent.enter_datetime).getTime() - new Date(a.parent.enter_datetime).getTime());

  }, [data]);

  const filteredAndPaginatedData = useMemo(() => {
     const lowercasedFilter = filter.toLowerCase();
     let filteredGroups = groupedData;

     if (filter) {
        filteredGroups = groupedData.filter(group => {
            const parentMatch = Object.values(group.parent).some(val => String(val).toLowerCase().includes(lowercasedFilter));
            const childrenMatch = group.children.some(child => Object.values(child).some(val => String(val).toLowerCase().includes(lowercasedFilter)));
            return parentMatch || childrenMatch;
        });
     }
     
     return filteredGroups.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
     );
  }, [groupedData, filter, currentPage]);
  
  const totalPages = Math.ceil(groupedData.length / ROWS_PER_PAGE);

  const getStatusVariant = (status: AdvancedCallData["status"]): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Completed": return "default";
      case "Abandoned": return "destructive";
      case "Redirected": return "secondary";
      case "Direct call": return "outline";
      case "IVR": return "secondary";
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
  
  const renderCallRow = (item: AdvancedCallData, isChild: boolean) => {
    const isActualTransfer = item.status_detail.toLowerCase().includes('transfer');
    
    return (
       <TableRow 
            key={item.call_id}
            className={cn(!isChild && "bg-muted/50")}
       >
          <TableCell className="align-top whitespace-nowrap">
            <div className="flex items-start">
              {isChild && (
                <div className="relative w-8 h-full mr-2 self-stretch">
                    <div className="absolute left-3 w-px h-full bg-border"></div>
                    <div className="absolute top-4 w-4 h-px bg-border"></div>
                </div>
              )}
               <div className={cn("flex-1", isChild && "pl-0")}>
                  <div>{new Date(item.enter_datetime).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                  <div className="text-muted-foreground text-xs">{new Date(item.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
               </div>
            </div>
          </TableCell>
          <TableCell className="font-medium align-top">
            <div className="flex items-center gap-2">
               <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                      <>
                        {item.status_detail?.toLowerCase().includes("incoming") && (
                            <ArrowDownCircle className="h-4 w-4 text-green-500" />
                        )}
                        {item.status_detail?.toLowerCase().includes("outgoing") && (
                            <ArrowUpCircle className="h-4 w-4 text-red-500" />
                        )}
                        {item.parent_call_id && isActualTransfer && (
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{item.status_detail}</p>
                        {item.parent_call_id && isActualTransfer && (
                          <>
                            <p className="text-xs text-muted-foreground">ID: {item.parent_call_id}</p>
                          </>
                        )}
                    </TooltipContent>
                </Tooltip>
               </TooltipProvider>
              <span>{item.calling_number}</span>
            </div>
          </TableCell>
          <TableCell className="align-top">{item.queue_name || "N/A"}</TableCell>
          <TableCell className="align-top">{item.agent || "N/A"}</TableCell>
          <TableCell className="align-top">
            <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
          </TableCell>
          <TableCell className="align-top">{item.status_detail}</TableCell>
          <TableCell className="align-top">{item.processing_time_seconds ?? 0}s</TableCell>
          <TableCell className="font-mono text-xs text-muted-foreground align-top">
            {item.call_id}
          </TableCell>
        </TableRow>
    );
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
                {filteredAndPaginatedData.length > 0 ? (
                    filteredAndPaginatedData.map(group => (
                        <>
                            {renderCallRow(group.parent, false)}
                            {group.children.map(child => renderCallRow(child, true))}
                        </>
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
