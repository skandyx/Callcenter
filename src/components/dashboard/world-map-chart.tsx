
"use client";

import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type CallData } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const countryPrefixes: { [key: string]: { code: string, name: string } } = {
  '1': { code: 'CAN', name: 'Canada' },
  '33': { code: 'FRA', name: 'France' },
  '32': { code: 'BEL', name: 'Belgium' },
  '49': { code: 'DEU', name: 'Germany' },
  '44': { code: 'GBR', name: 'United Kingdom' },
  '34': { code: 'ESP', name: 'Spain' },
  '39': { code: 'ITA', name: 'Italy' },
  '41': { code: 'CHE', name: 'Switzerland' },
  '212': { code: 'MAR', name: 'Morocco' },
  '213': { code: 'DZA', name: 'Algeria' },
  '216': { code: 'TUN', name: 'Tunisia' },
  '221': { code: 'SEN', name: 'Senegal' },
  '86': { code: 'CHN', name: 'China' },
};

const getCountryInfoFromNumber = (phoneNumber: string): { code: string, name: string } | null => {
  const cleanNumber = phoneNumber.replace(/^(00|\+)/, '').replace(/[^0-9]/g, '');
  for (let i = 3; i > 0; i--) {
    const prefix = cleanNumber.substring(0, i);
    if (countryPrefixes[prefix]) {
      return countryPrefixes[prefix];
    }
  }
  return null;
};

interface CallStats {
  received: number;
  emitted: number;
  totalDuration: number; // in seconds
  countryName: string;
}

interface WorldMapChartProps {
  data: CallData[];
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff7300'
];

const CustomizedTreemapContent = ({ root, depth, x, y, width, height, index, name, size }: any) => {
  if (width < 20 || height < 20) {
    return null;
  }
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        style={{ fill: COLORS[index % COLORS.length], stroke: '#fff', strokeWidth: 2 }}
      />
      <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
        {name} ({size})
      </text>
    </g>
  );
};


const WorldMapChart = ({ data }: WorldMapChartProps) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const callCountsByCountry = useMemo(() => {
    const counts: { [key: string]: CallStats } = {};
    data.forEach(call => {
      const countryInfo = getCountryInfoFromNumber(call.calling_number);
      if (countryInfo) {
        if (!counts[countryInfo.code]) {
          counts[countryInfo.code] = { received: 0, emitted: 0, totalDuration: 0, countryName: countryInfo.name };
        }
        
        const isEmitted = call.status_detail === 'Outgoing';

        if (isEmitted) {
          counts[countryInfo.code].emitted += 1;
        } else {
          counts[countryInfo.code].received += 1;
        }

        counts[countryInfo.code].totalDuration += call.processing_time_seconds || 0;
      }
    });
    return counts;
  }, [data]);
  
  const treemapData = useMemo(() => {
    return Object.entries(callCountsByCountry)
      .map(([code, stats]) => ({
        name: stats.countryName,
        code: code,
        size: stats.received + stats.emitted,
      }))
      .filter(c => c.size > 0)
      .sort((a, b) => b.size - a.size);
  }, [callCountsByCountry]);

  const agentsForSelectedCountry = useMemo(() => {
    if (!selectedCountryCode) return [];
    const agentSet = new Set<string>();
    data.forEach(call => {
      const countryInfo = getCountryInfoFromNumber(call.calling_number);
      if (countryInfo?.code === selectedCountryCode && call.agent) {
        agentSet.add(call.agent);
      }
    });
    return Array.from(agentSet).sort();
  }, [data, selectedCountryCode]);
  
  const filteredCalls = useMemo(() => {
    return data.filter(call => {
        const countryInfo = getCountryInfoFromNumber(call.calling_number);
        const countryMatch = selectedCountryCode ? countryInfo?.code === selectedCountryCode : true;
        const agentMatch = selectedAgent ? call.agent === selectedAgent : true;
        return countryMatch && agentMatch;
    });
  }, [data, selectedCountryCode, selectedAgent]);

  const handleTreemapClick = (item: any) => {
    if (item && item.code) {
        if (selectedCountryCode === item.code) {
            setSelectedCountryCode(null);
            setSelectedAgent(null);
        } else {
            setSelectedCountryCode(item.code);
            setSelectedAgent(null);
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
    setSelectedCountryCode(null);
    setSelectedAgent(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Distribution by Country</CardTitle>
        <CardDescription>
          Visualisation géographique des appels. Cliquez sur un pays pour filtrer le journal d'appels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full h-[400px]">
          <h4 className="text-lg font-semibold mb-2 text-center">Summary by Country</h4>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                nameKey="name"
                ratio={4 / 3}
                stroke="#fff"
                fill="hsl(var(--primary))"
                content={<CustomizedTreemapContent />}
                onClick={handleTreemapClick}
                isAnimationActive={false}
              >
                  <RechartsTooltip formatter={(value, name) => [value, `Total Calls`]}/>
              </Treemap>
            </ResponsiveContainer>
        </div>

        {selectedCountryCode && agentsForSelectedCountry.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="mb-2 text-sm font-semibold">
                    Filter by agent for country: <span className="font-bold">{callCountsByCountry[selectedCountryCode]?.countryName}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                    {agentsForSelectedCountry.map(agent => (
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
               {selectedCountryCode && ` (Filtered by: ${callCountsByCountry[selectedCountryCode]?.countryName || selectedCountryCode}`}
               {selectedAgent && ` & ${selectedAgent}`}
               {selectedCountryCode && `)`}
             </h4>
             {(selectedCountryCode || selectedAgent) && (
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
                         <TableHead>Caller Number</TableHead>
                         <TableHead>Agent</TableHead>
                         <TableHead>Queue</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead>Status Detail</TableHead>
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
                            <TableCell>{call.status_detail}</TableCell>
                            <TableCell>{call.processing_time_seconds ?? 0}s</TableCell>
                        </TableRow>
                    )) : (
                      <TableRow>
                         <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
};

export default WorldMapChart;
