
"use client";

import { useState, useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CallData } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";


// Helper function to generate a color palette
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff7300'
];

// Custom content renderer for the Treemap
const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, rank, name, size }: any) => {
  if (width < 20 || height < 20) {
    return null;
  }
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
        style={{ pointerEvents: 'none' }}
      >
        {name}
      </text>
      <text
         x={x + width / 2}
         y={y + height / 2 + 20}
         textAnchor="middle"
         fill="#fff"
         fontSize={12}
         fontWeight="bold"
         style={{ pointerEvents: 'none' }}
       >
        {size}
      </text>
    </g>
  );
};


export default function StatusDetailsChart({ data }: { data: CallData[] }) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    data.forEach((call) => {
      const detail = call.status_detail || "N/A";
      statusCounts[detail] = (statusCounts[detail] || 0) + 1;
    });

    return Object.entries(statusCounts)
      .map(([name, count]) => ({ name, size: count }))
      .sort((a, b) => b.size - a.size);
  }, [data]);

  const agentsForSelectedStatus = useMemo(() => {
    if (!selectedStatus) return [];
    const agentSet = new Set<string>();
    data.forEach(call => {
      if ((call.status_detail || "N/A") === selectedStatus && call.agent) {
        agentSet.add(call.agent);
      }
    });
    return Array.from(agentSet).sort();
  }, [data, selectedStatus]);

  const filteredCalls = useMemo(() => {
    return data.filter(call => {
        const statusMatch = selectedStatus ? (call.status_detail || "N/A") === selectedStatus : true;
        const agentMatch = selectedAgent ? call.agent === selectedAgent : true;
        return statusMatch && agentMatch;
    });
  }, [data, selectedStatus, selectedAgent]);

  const handleTreemapClick = (item: any) => {
    if (item && item.name) {
      if (selectedStatus === item.name) {
        // If clicking the same status, reset everything
        setSelectedStatus(null);
        setSelectedAgent(null);
      } else {
        setSelectedStatus(item.name);
        setSelectedAgent(null); // Reset agent when status changes
      }
    }
  };
  
  const getStatusVariant = (
    status: CallData["status"]
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Completed": return "default";
      case "Abandoned": return "destructive";
      case "Redirected": return "secondary";
      case "Direct call": return "outline";
      default: return "secondary";
    }
  };

  const clearFilters = () => {
    setSelectedStatus(null);
    setSelectedAgent(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Status Breakdown</CardTitle>
        <CardDescription>
          Distribution des résultats d'appel détaillés. Cliquez sur un carré pour filtrer la liste ci-dessous.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={chartData}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="hsl(var(--primary))"
                content={<CustomizedContent />}
                onClick={handleTreemapClick}
                isAnimationActive={false}
              >
                  <RechartsTooltip formatter={(value, name) => [value, 'Total Calls']} />
              </Treemap>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No data to display.</p>
            </div>
          )}
        </div>
        
        {selectedStatus && agentsForSelectedStatus.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="mb-2 text-sm font-semibold">
                    Filter by agent for status: <span className="font-bold">{selectedStatus}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                    {agentsForSelectedStatus.map(agent => (
                        <Button
                            key={agent}
                            size="sm"
                            variant={selectedAgent === agent ? "default" : "outline"}
                            onClick={() => setSelectedAgent(prev => prev === agent ? null : agent)}
                        >
                            {agent}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold">
              Call Log
              {selectedStatus && ` (Filtered by: ${selectedStatus}`}
              {selectedAgent && ` & ${selectedAgent}`}
              {selectedStatus && `)`}
            </h4>
            {(selectedStatus || selectedAgent) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
          <ScrollArea className="h-[400px] border rounded-lg">
             <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur">
                    <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Caller</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Queue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredCalls.length > 0 ? filteredCalls.map((call) => (
                       <TableRow key={call.call_id}>
                           <TableCell>{new Date(call.enter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</TableCell>
                           <TableCell>{call.calling_number}</TableCell>
                           <TableCell>{call.agent || "N/A"}</TableCell>
                           <TableCell>{call.queue_name || "Direct call"}</TableCell>
                           <TableCell><Badge variant={getStatusVariant(call.status)}>{call.status}</Badge></TableCell>
                           <TableCell>{call.processing_time_seconds ?? 0}s</TableCell>
                       </TableRow>
                   )) : (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No calls found for this filter combination.
                        </TableCell>
                     </TableRow>
                   )}
                </TableBody>
             </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
