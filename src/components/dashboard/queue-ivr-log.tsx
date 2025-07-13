
"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { type QueueIvrData, type CallData } from "@/lib/types";
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
import { Badge } from "../ui/badge";
import { ArrowRight, PhoneOff, Keyboard, CheckCircle, PhoneCall, History } from "lucide-react";
import KpiCard from "./kpi-card";


const ROWS_PER_PAGE = 10;

interface QueueIvrLogProps {
  data: QueueIvrData[];
  callData: CallData[];
}

export default function QueueIvrLog({ data, callData }: QueueIvrLogProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { kpis, filteredData } = useMemo(() => {
    const sortedData = data ? [...data].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()) : [];

    const lowercasedFilter = filter.toLowerCase();
    const finalFilteredData = filter 
      ? sortedData.filter(item => Object.values(item).some(value => value && value.toString().toLowerCase().includes(lowercasedFilter)))
      : sortedData;

    const uniqueCallIdsInIvr = new Set(data.map(d => d.call_id));
    const totalEvents = data.length;
    const keyPressEvents = data.filter(d => d.event_type === 'KeyPress').length;
    const connectedCalls = data.filter(d => d.event_type === 'ExitIVR' && d.event_detail.toLowerCase().includes('connected to agent')).length;
    const hangupCalls = data.filter(d => d.event_type === 'Hangup' || d.event_type === 'Timeout').length;
    const uniqueCalls = uniqueCallIdsInIvr.size;

    const kpiMetrics = {
        totalEvents,
        uniqueCalls,
        keyPressEvents,
        connectedCalls,
        hangupCalls
    };

    return { kpis: kpiMetrics, filteredData: finalFilteredData };
  }, [data, filter]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );
  
  const getEventTypeVariant = (type: QueueIvrData['event_type']): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "EnterQueue":
      case "EnterIVR":
        return "default";
      case "KeyPress":
        return "secondary";
      case "ExitIVR":
        return "outline";
      case "Hangup":
      case "Timeout":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  const findFinalAgentForCall = (callId: string) => {
    const conversationCalls = callData.filter(c => c.parent_call_id === callId || c.call_id === callId);
    const lastCompleted = conversationCalls
        .filter(c => c.status === 'Completed' && c.agent)
        .sort((a,b) => new Date(b.enter_datetime).getTime() - new Date(a.enter_datetime).getTime());
    
    return lastCompleted.length > 0 ? lastCompleted[0].agent : null;
  }

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
        <CardTitle>Queue & IVR Log</CardTitle>
        <CardDescription>
          Tracez le parcours de l'appelant à travers les menus vocaux interactifs et les files d'attente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <KpiCard title="Total Events" value={kpis.totalEvents.toLocaleString()} Icon={History} description="Total logs from IVR" />
            <KpiCard title="Unique Calls" value={kpis.uniqueCalls.toLocaleString()} Icon={PhoneCall} description="Distinct calls in IVR" />
            <KpiCard title="User Interactions" value={kpis.keyPressEvents.toLocaleString()} Icon={Keyboard} description="Total key presses" />
            <KpiCard title="Connected Calls" value={kpis.connectedCalls.toLocaleString()} Icon={CheckCircle} description="Calls exited to agent" />
            <KpiCard title="IVR Hangups" value={kpis.hangupCalls.toLocaleString()} Icon={PhoneOff} description="Calls hung up in IVR" />
        </div>

        <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
          <Input
            placeholder="Filter by Call ID, number, event..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Caller Number</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>IVR Path</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Duration (s)</TableHead>
                <TableHead>Call ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={`${item.call_id}-${item.datetime}-${index}`}>
                    <TableCell>
                      <div>{new Date(item.datetime).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                      <div className="text-muted-foreground text-xs">{new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
                    </TableCell>
                    <TableCell className="font-medium">{item.calling_number}</TableCell>
                    <TableCell>
                        <Badge variant={getEventTypeVariant(item.event_type)}>{item.event_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.ivr_path.split(' -> ').map((path, i, arr) => (
                          <React.Fragment key={i}>
                            <Badge variant="outline">{path}</Badge>
                            {i < arr.length -1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                        {item.event_type === 'ExitIVR' && item.event_detail.toLowerCase().includes('connected to agent')
                            ? `Connected to agent ${findFinalAgentForCall(item.call_id) || item.queue_name}`
                            : item.event_detail
                        }
                    </TableCell>
                    <TableCell>{item.duration !== undefined ? item.duration.toFixed(0) : '-'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.call_id}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No Queue/IVR data received.
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
