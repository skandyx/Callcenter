
"use client";

import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type CallData } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const countryPrefixes: { [key: string]: string } = {
  '1': 'USA', '33': 'FRA', '32': 'BEL', '49': 'DEU', '44': 'GBR', '34': 'ESP', '39': 'ITA',
  '41': 'CHE', '212': 'MAR', '213': 'DZA', '216': 'TUN', '221': 'SEN'
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
}

interface WorldMapChartProps {
  data: CallData[];
}

const WorldMapChart = ({ data }: WorldMapChartProps) => {
  const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  const callCountsByCountry = useMemo(() => {
    const counts: { [key: string]: CallStats } = {};
    data.forEach(call => {
      const country = getCountryFromNumber(call.calling_number);
      if (country) {
        if (!counts[country]) {
          counts[country] = { received: 0, emitted: 0, totalDuration: 0 };
        }
        
        const isEmitted = call.status_detail === 'Outgoing';

        if (isEmitted) {
          counts[country].emitted += 1;
        } else {
          counts[country].received += 1;
        }

        counts[country].totalDuration += call.processing_time_seconds || 0;
      }
    });
    return counts;
  }, [data]);

  const maxCalls = Math.max(0, ...Object.values(callCountsByCountry).map(c => c.received + c.emitted));
  
  const getColor = (countryCode: string) => {
      const stats = callCountsByCountry[countryCode];
      if (!stats || (stats.received === 0 && stats.emitted === 0)) {
          return "#E5E7EB"; // Neutral grey
      }

      const totalCalls = stats.received + stats.emitted;
      const intensity = Math.min(1, Math.log1p(totalCalls) / Math.log1p(maxCalls > 0 ? maxCalls : 1));

      if (stats.emitted > stats.received) {
          // Red for emitted
          const greenBlue = 230 - intensity * 180;
          return `rgb(255, ${greenBlue}, ${greenBlue})`;
      } else {
          // Green for received
          const redBlue = 230 - intensity * 180;
          return `rgb(${redBlue}, 255, ${redBlue})`;
      }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Distribution by Country</CardTitle>
        <CardDescription>
          Visualisation géographique des appels entrants et sortants. Survolez un pays pour plus de détails.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full h-[600px] flex flex-col items-center">
        <div style={{ width: '100%', height: 'calc(100% - 40px)' }} data-tip="">
            <ComposableMap projectionConfig={{ scale: 160 }} >
            <ZoomableGroup center={[0, 20]} zoom={1}>
                <Geographies geography={geoUrl}>
                {({ geographies }) =>
                    geographies.map(geo => {
                    const countryCode = geo.properties.iso_a3;
                    const stats = callCountsByCountry[countryCode];
                    const hasData = stats && (stats.received > 0 || stats.emitted > 0);

                    return (
                        <TooltipProvider key={geo.rsmKey} delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Geography
                                geography={geo}
                                fill={getColor(countryCode)}
                                stroke="#FFF"
                                style={{
                                default: { outline: "none", transition: "fill 0.3s ease" },
                                hover: { outline: "none", fill: "hsl(var(--primary))" },
                                pressed: { outline: "none" },
                                }}
                            />
                            </TooltipTrigger>
                            {hasData && (
                            <TooltipContent>
                                <div className="flex flex-col gap-1 text-sm">
                                   <p className="font-bold text-base">{geo.properties.name}</p>
                                   <p><span className="text-green-600 font-semibold">● Reçus:</span> {stats.received}</p>
                                   <p><span className="text-red-600 font-semibold">● Émis:</span> {stats.emitted}</p>
                                   <p><span className="text-muted-foreground">Durée totale:</span> {(stats.totalDuration / 60).toFixed(1)} min</p>
                                </div>
                            </TooltipContent>
                            )}
                        </Tooltip>
                        </TooltipProvider>
                    )
                    })
                }
                </Geographies>
            </ZoomableGroup>
            </ComposableMap>
        </div>
        <div className="flex items-center justify-center gap-6 pt-4 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Appels Reçus</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Appels Émis</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldMapChart;
