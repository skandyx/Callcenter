"use client";

import React, { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type CallData } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// A simplified map of country prefixes to ISO 3166-1 alpha-3 country codes
// This is not exhaustive and is for demonstration purposes.
const countryPrefixes: { [key: string]: string } = {
  '1': 'USA', // United States & Canada
  '33': 'FRA', // France
  '32': 'BEL', // Belgium
  '49': 'DEU', // Germany
  '44': 'GBR', // United Kingdom
  '34': 'ESP', // Spain
  '39': 'ITA', // Italy
  '41': 'CHE', // Switzerland
  '212': 'MAR', // Morocco
  '213': 'DZA', // Algeria
  '216': 'TUN', // Tunisia
  '221': 'SEN', // Senegal
};

const getCountryFromNumber = (phoneNumber: string): string | null => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  for (let i = 3; i > 0; i--) {
    const prefix = cleanNumber.substring(0, i);
    if (countryPrefixes[prefix]) {
      return countryPrefixes[prefix];
    }
  }
  return null;
};

interface WorldMapChartProps {
  data: CallData[];
}

const WorldMapChart = ({ data }: WorldMapChartProps) => {
  const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  const callCountsByCountry = useMemo(() => {
    const counts: { [key: string]: number } = {};
    data.forEach(call => {
      const country = getCountryFromNumber(call.calling_number);
      if (country) {
        counts[country] = (counts[country] || 0) + 1;
      }
    });
    return counts;
  }, [data]);

  const maxCalls = Math.max(0, ...Object.values(callCountsByCountry));
  
  const getColor = (countryCode: string) => {
      const count = callCountsByCountry[countryCode] || 0;
      if (count === 0) return "#DDD";
      const intensity = Math.min(1, count / (maxCalls > 0 ? maxCalls : 1));
      const r = 220 - intensity * 120; // from blue to light blue
      const g = 230 - intensity * 120;
      const b = 255;
      return `rgb(${r},${g},${b})`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Distribution by Country</CardTitle>
        <CardDescription>
          Geographic visualization of incoming call origins.
        </CardDescription>
      </CardHeader>
      <CardContent style={{ width: '100%', height: '600px' }}>
          <TooltipProvider>
            <ComposableMap projectionConfig={{ scale: 160 }} >
                 <ZoomableGroup center={[0, 0]} zoom={1}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                        geographies.map(geo => {
                            const countryCode = geo.properties.iso_a3;
                            const callCount = callCountsByCountry[countryCode] || 0;
                            return (
                                <Tooltip key={geo.rsmKey}>
                                    <TooltipTrigger asChild>
                                        <Geography
                                            geography={geo}
                                            fill={getColor(countryCode)}
                                            stroke="#FFF"
                                            style={{
                                                default: { outline: "none" },
                                                hover: { outline: "none", fill: "hsl(var(--primary))" },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    </TooltipTrigger>
                                    {callCount > 0 && (
                                         <TooltipContent>
                                            <p>{geo.properties.name}: {callCount} call(s)</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            )
                        })
                        }
                    </Geographies>
                 </ZoomableGroup>
            </ComposableMap>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default WorldMapChart;
