
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
        callGroups[parentId] = { parent: call, children: [] };
      }
    });

    // Second pass: correctly assign parents and children
    const finalGroups: { [key: string]: GroupedCall } = {};
    data.forEach(call => {
      const isParent = !call.parent_call_id;
      if (isParent) {
        if (!finalGroups[call.call_id]) {
          finalGroups[call.call_id] = { parent: call, children: [] };
        } else {
          // It was already created as a placeholder, now set the correct parent
          finalGroups[call.call_id].parent = call;
        }
      } else { // It's a child
        const rootParent = data.find(p => p.call_id === call.parent_call_id);
        const rootParentId = rootParent?.parent_call_id || rootParent?.call_id || call.parent_call_id!;
        
        if (!finalGroups[rootParentId]) {
           // Parent might not be in the data set, so create a placeholder
           const bestParent = rootParent || call;
           finalGroups[rootParentId] = { parent: bestParent, children: [] };
        }
        if (finalGroups[rootParentId].parent.call_id !== call.call_id){
           finalGroups[rootParentId].children.push(call);
        }
      }
    });

    // Sort children by date within each group
    Object.values(finalGroups).forEach(group => {
      group.children.sort((a, b) => new Date(a.enter_datetime).getTime() - new Date(b.enter_datetime).getTime());
    });

    // Flatten the groups for rendering and filtering
    const flatList: (AdvancedCallData & { isChild?: boolean; isFirstChild?: boolean, hasChildren?: boolean })[] = [];
    Object.values(finalGroups)
      .sort((a, b) => new Date(b.parent.enter_datetime).getTime() - new Date(a.parent.enter_datetime).getTime())
      .forEach(group => {
        flatList.push({...group.parent, hasChildren: group.children.length > 0});
        group.children.forEach((child, index) => {
          flatList.push({ ...child, isChild: true, isFirstChild: index === 0 });
        });
      });

    if (!filter) {
      return flatList;
    }
    
    const lowercasedFilter = filter.toLowerCase();

    // Filter based on the parent of each group
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
                  paginatedData.map((item, index) => (
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
                              <div>{new Date(item.enter_datetime).toLocaleDateString()}</div>
                              <div className="text-muted-foreground text-xs">{new Date(item.enter_datetime).toLocaleTimeString()}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium align-top">
                        {item.calling_number}
                      </TableCell>
                      <TableCell className="align-top">{item.queue_name || "N/A"}</TableCell>
                      <TableCell className="align-top">{item.agent || "N/A"}</TableCell>
                      <TableCell className="align-top">
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="align-top">{item.status_detail}</TableCell>
                      <TableCell className="align-top">{item.processing_time_seconds || 0}s</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground align-top">
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
