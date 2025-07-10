"use client";

import { useMemo } from "react";
import { ResponsiveContainer, Treemap } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type CallData } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

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
  const chartData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    data.forEach((call) => {
      const detail = call.status_detail || "N/A";
      statusCounts[detail] = (statusCounts[detail] || 0) + 1;
    });

    return Object.entries(statusCounts)
      .map(([name, count]) => ({ name, size: count })) // Treemap uses 'size' instead of 'count'
      .sort((a, b) => b.size - a.size);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Status Breakdown</CardTitle>
        <CardDescription>
          Distribution des résultats d'appel détaillés pour la journée.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              />
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No data to display.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
