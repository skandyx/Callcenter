
"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ProfileAvailabilityData } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";

interface ProfileAvailabilityChartProps {
  data: ProfileAvailabilityData[];
}

const COLORS = [
  "#22c55e", // Available (green)
  "#f97316", // Lunch (orange)
  "#3b82f6", // Meeting (blue)
  "#64748b", // Left for the day (slate)
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f",
  "#ffbb28", "#ff7300", "#a4de6c", "#d0ed57", "#ffc658", "#8dd1e1",
  "#83a6ed", "#8e44ad", "#c0392b", "#16a085", "#27ae60", "#2980b9",
  "#f1c40f", "#e67e22", "#d35400"
];

const knownStatuses = ["Available", "Lunch", "Meeting", "Left for the day", "OTHER"];
const pStatuses = Array.from({ length: 21 }, (_, i) => `P${i + 4}`);
const allStatuses = [...knownStatuses, ...pStatuses];

export default function ProfileAvailabilityChart({ data }: ProfileAvailabilityChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const userTime: { [key: string]: any } = {};

    data.forEach((entry) => {
      const user = entry.user || "Unknown";
      if (!userTime[user]) {
        userTime[user] = { user };
      }

      for (const key in entry) {
        if (allStatuses.includes(key) && typeof (entry as any)[key] === 'number') {
            userTime[user][key] = (userTime[user][key] || 0) + (entry as any)[key];
        }
      }
    });

    return Object.values(userTime).map(user => {
      // Convert all seconds to minutes for readability
      for(const key in user) {
        if(key !== 'user') {
          user[key] = (user[key] / 60).toFixed(2);
        }
      }
      return user;
    });

  }, [data]);

  const activeStatuses = useMemo(() => {
     const statusSet = new Set<string>();
     chartData.forEach(d => {
       Object.keys(d).forEach(key => {
         if(key !== 'user' && parseFloat(d[key]) > 0) {
           statusSet.add(key);
         }
       })
     });
     // Ensure a consistent order
     return allStatuses.filter(s => statusSet.has(s));
  }, [chartData]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse de la Disponibilité par Profil</CardTitle>
          <CardDescription>
            Temps total (en minutes) passé par chaque utilisateur dans les différents profils.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée de disponibilité de profil reçue pour la date sélectionnée.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse de la Disponibilité par Profil</CardTitle>
        <CardDescription>
          Temps total (en minutes) passé par chaque utilisateur dans les différents profils de disponibilité.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full h-[500px]">
          <ResponsiveContainer width="100%" height={Math.max(500, chartData.length * 50)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 30,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit=" min" />
              <YAxis dataKey="user" type="category" width={150} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name) => [`${value} minutes`, name]} />
              <Legend />
              {activeStatuses.map((status, index) => (
                  <Bar 
                    key={status} 
                    dataKey={status} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                  />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
