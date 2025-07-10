
"use client";

import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from 'react-simple-maps';
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type CallData } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
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

const countryCoordinates: { [key: string]: [number, number] } = {
  USA: [-98.5795, 39.8283], CAN: [-106.3468, 56.1304], FRA: [2.3522, 48.8566], BEL: [4.3517, 50.8503],
  DEU: [10.4515, 51.1657], GBR: [-3.4360, 55.3781], ESP: [-3.7038, 40.4168],
  ITA: [12.5674, 41.8719], CHE: [8.2275, 46.8182], MAR: [-7.0926, 31.7917],
  DZA: [1.6596, 28.0339], TUN: [9.5375, 33.8869], SEN: [-14.4524, 14.4974],
  CHN: [104.1954, 35.8617]
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
  const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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
        name: code,
        size: stats.received + stats.emitted,
      }))
      .filter(c => c.size > 0)
      .sort((a, b) => b.size - a.size);
  }, [callCountsByCountry]);
  
  const filteredCalls = useMemo(() => {
    if (!selectedCountryCode) return data;
    return data.filter(call => {
      const countryInfo = getCountryInfoFromNumber(call.calling_number);
      return countryInfo?.code === selectedCountryCode;
    });
  }, [data, selectedCountryCode]);

  const getMarkerColor = (stats: CallStats) => {
    if (!stats || (stats.received === 0 && stats.emitted === 0)) {
        return "rgba(107, 114, 128, 0.5)";
    }
    return stats.emitted > stats.received ? "#EF4444" : "#22C55E";
  }

  const handleTreemapClick = (item: any) => {
    if (item && item.name) {
      setSelectedCountryCode(item.name);
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


  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Distribution by Country</CardTitle>
        <CardDescription>
          Visualisation géographique des appels. Cliquez sur un pays dans la treemap pour filtrer le journal d'appels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 w-full h-[600px]" data-tip="">
              <ComposableMap projectionConfig={{ scale: 160 }} >
              <ZoomableGroup center={[0, 20]} zoom={1}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map(geo => {
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#E5E7EB"
                          stroke="#FFF"
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      )
                    })
                  }
                </Geographies>
                {Object.entries(callCountsByCountry).map(([countryCode, stats]) => {
                    const totalCalls = stats.received + stats.emitted;
                    if (totalCalls === 0 || !countryCoordinates[countryCode]) return null;
                    const size = 5 + Math.log1p(totalCalls) * 3;
                    return (
                      <Marker key={countryCode} coordinates={countryCoordinates[countryCode]}>
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                              <TooltipTrigger>
                                <circle
                                  r={size}
                                  fill={getMarkerColor(stats)}
                                  stroke="#FFF"
                                  strokeWidth={1}
                                  className="transition-all hover:r-[calc(var(--r,8)*1.2)]"
                                  style={{'--r': size} as any}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                  <div className="flex flex-col gap-1 text-sm">
                                     <p className="font-bold text-base">{stats.countryName} ({countryCode})</p>
                                     <p><span className="text-green-600 font-semibold">● Reçus:</span> {stats.received}</p>
                                     <p><span className="text-red-600 font-semibold">● Émis:</span> {stats.emitted}</p>
                                     <p><span className="text-muted-foreground">Durée totale:</span> {(stats.totalDuration / 60).toFixed(1)} min</p>
                                  </div>
                              </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Marker>
                    )
                })}
              </ZoomableGroup>
              </ComposableMap>
          </div>
          <div className="md:col-span-1 h-[600px]">
            <h4 className="text-lg font-semibold mb-2">Summary by Country</h4>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
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
        </div>

        <div>
           <div className="flex items-center justify-between mb-4">
             <h4 className="text-lg font-semibold">
               Call Log {selectedCountryCode && `(Filtered by: ${callCountsByCountry[selectedCountryCode]?.countryName || selectedCountryCode})`}
             </h4>
             {selectedCountryCode && (
               <Button variant="ghost" onClick={() => setSelectedCountryCode(null)}>
                 Clear selection
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
                             No calls found for this country.
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
