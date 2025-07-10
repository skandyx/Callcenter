
"use client";

import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from 'react-simple-maps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type CallData } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

const countryPrefixes: { [key: string]: string } = {
  '1': 'USA', '33': 'FRA', '32': 'BEL', '49': 'DEU', '44': 'GBR', '34': 'ESP', '39': 'ITA',
  '41': 'CHE', '212': 'MAR', '213': 'DZA', '216': 'TUN', '221': 'SEN'
};

const countryCoordinates: { [key: string]: [number, number] } = {
  USA: [-98.5795, 39.8283], FRA: [2.3522, 48.8566], BEL: [4.3517, 50.8503],
  DEU: [10.4515, 51.1657], GBR: [-3.4360, 55.3781], ESP: [-3.7038, 40.4168],
  ITA: [12.5674, 41.8719], CHE: [8.2275, 46.8182], MAR: [-7.0926, 31.7917],
  DZA: [1.6596, 28.0339], TUN: [9.5375, 33.8869], SEN: [-14.4524, 14.4974]
};


const getCountryFromNumber = (phoneNumber: string): string | null => {
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

const WorldMapChart = ({ data }: WorldMapChartProps) => {
  const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  const callCountsByCountry = useMemo(() => {
    const counts: { [key: string]: CallStats } = {};
    data.forEach(call => {
      const countryCode = getCountryFromNumber(call.calling_number);
      if (countryCode) {
        if (!counts[countryCode]) {
          counts[countryCode] = { received: 0, emitted: 0, totalDuration: 0, countryName: '' };
        }
        
        const isEmitted = call.status_detail === 'Outgoing';

        if (isEmitted) {
          counts[countryCode].emitted += 1;
        } else {
          counts[countryCode].received += 1;
        }

        counts[countryCode].totalDuration += call.processing_time_seconds || 0;
      }
    });
    return counts;
  }, [data]);
  
  const maxCalls = Math.max(0, ...Object.values(callCountsByCountry).map(c => c.received + c.emitted));
  
  const getMarkerColor = (stats: CallStats) => {
    if (!stats || (stats.received === 0 && stats.emitted === 0)) {
        return "rgba(107, 114, 128, 0.5)"; // Neutral grey
    }
    return stats.emitted > stats.received ? "#EF4444" : "#22C55E";
  }

  const legendData = useMemo(() => {
      return Object.entries(callCountsByCountry)
          .map(([code, stats]) => ({ code, ...stats }))
          .filter(c => (c.received + c.emitted) > 0)
          .sort((a, b) => (b.received + b.emitted) - (a.received + a.emitted));
  }, [callCountsByCountry]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Distribution by Country</CardTitle>
        <CardDescription>
          Visualisation géographique des appels entrants et sortants. Survolez un pays ou un marqueur pour plus de détails.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
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
                                   <p className="font-bold text-base">{countryCode}</p>
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
        <div className="md:col-span-1">
          <h4 className="text-lg font-semibold mb-2">Summary by Country</h4>
          <ScrollArea className="h-[550px] border rounded-lg">
             <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead>Pays</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Reçus</TableHead>
                        <TableHead>Émis</TableHead>
                        <TableHead>Durée (min)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {legendData.map(({code, received, emitted, totalDuration}) => (
                       <TableRow key={code}>
                           <TableCell className="font-medium">{code}</TableCell>
                           <TableCell>{received + emitted}</TableCell>
                           <TableCell className="text-green-600">{received}</TableCell>
                           <TableCell className="text-red-600">{emitted}</TableCell>
                           <TableCell>{(totalDuration / 60).toFixed(1)}</TableCell>
                       </TableRow>
                   ))}
                </TableBody>
             </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMapChart;
