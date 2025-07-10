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
  
  const [tooltipContent, setTooltipContent] = useState('');

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
      if (count === 0) return "#E5E7EB"; // A neutral grey color
      // Scale color from light blue to dark blue
      const intensity = Math.min(1, Math.log1p(count) / Math.log1p(maxCalls > 0 ? maxCalls : 1));
      const blue = 255;
      const redGreen = 230 - intensity * 180;
      return `rgb(${redGreen},${redGreen},${blue})`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Distribution by Country</CardTitle>
        <CardDescription>
          Geographic visualization of incoming call origins. Hover over a country for details.
        </CardDescription>
      </CardHeader>
      <CardContent style={{ width: '100%', height: '600px' }} data-tip="">
        <ComposableMap projectionConfig={{ scale: 160 }} >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => {
                  const countryCode = geo.properties.iso_a3;
                  const callCount = callCountsByCountry[countryCode] || 0;
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
                        {callCount > 0 && (
                          <TooltipContent>
                            <p>{geo.properties.name}: {callCount} call(s)</p>
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
      </CardContent>
    </Card>
  );
};

export default WorldMapChart;
