
"use client";

import React, { useMemo } from 'react';
import { Headset, Phone, Clock, Check, PhoneMissed, Star, Users } from 'lucide-react';
import { type AgentStatusData, type AdvancedCallData } from '@/lib/types';


interface QueueWallboardProps {
    agentStatusData: AgentStatusData[];
    advancedCallData: AdvancedCallData[];
}

const QueueWallboard = ({ agentStatusData, advancedCallData }: QueueWallboardProps) => {

  const queueStats = useMemo(() => {
    if (!advancedCallData || !agentStatusData) return {};

    const stats: { [key: string]: { 
        name: string,
        status: string, // For now, always "Open" if data exists
        inQueue: number,
        currentWait: string,
        avgWait: string,
        received: number,
        missed: number,
        serviceLevel: string,
        connectedAgents: number
     } } = {};

    // 1. Get all unique queue names from both datasets
    const queueNames = new Set([
        ...agentStatusData.map(d => d.queuename),
        ...advancedCallData.map(d => d.queue_name).filter((q): q is string => !!q)
    ]);


    // 2. Initialize stats for each queue
    queueNames.forEach(name => {
        if (name) {
            stats[name] = {
                name: name,
                status: "Open",
                inQueue: 0, // Mocked for now
                currentWait: "0s", // Mocked for now
                avgWait: "0s", // Mocked for now
                received: 0,
                missed: 0,
                serviceLevel: "100%", // Mocked for now
                connectedAgents: 0
            };
        }
    });

    // 3. Calculate connected agents from agentStatusData
    const latestAgentStatus: { [key: string]: AgentStatusData } = {};
    agentStatusData.forEach(status => {
      const key = `${status.user_id}-${status.queuename}`;
      const existing = latestAgentStatus[key];
      if (!existing || new Date(`${status.date}T${String(status.hour).padStart(2,'0')}:00:00`) > new Date(`${existing.date}T${String(existing.hour).padStart(2,'0')}:00:00`)) {
        latestAgentStatus[key] = status;
      }
    });

    Object.values(latestAgentStatus).forEach(status => {
        if (stats[status.queuename] && status.loggedIn > 0) {
            stats[status.queuename].connectedAgents++;
        }
    });

    // 4. Calculate received and missed calls from advancedCallData
    advancedCallData.forEach(call => {
        if (call.queue_name && stats[call.queue_name]) {
            if(call.status === "Completed") {
                stats[call.queue_name].received++;
            } else if (call.status === "Abandoned") {
                stats[call.queue_name].missed++;
            }
        }
    });

    return stats;
  }, [agentStatusData, advancedCallData]);
    
  const queues = Object.values(queueStats);

  const headerIcons = [
    { Icon: Users, label: "Agents connectés" },
    { Icon: Phone, label: "Appels en file" },
    { Icon: Clock, label: "Temps d'attente max" },
    { Icon: Clock, label: "Temps d'attente moyen" },
    { Icon: Check, label: "Appels reçus" },
    { Icon: PhoneMissed, label: "Appels manqués" },
    { Icon: Star, label: "Niveau de service" }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header Row */}
      <div className="grid grid-cols-[2fr_repeat(7,_1fr)] gap-2 mb-2 items-end">
          <div />
          {headerIcons.map(({ Icon }, index) => (
               <div key={index} className="flex justify-center">
                  <Icon className="h-6 w-6 text-gray-400" />
               </div>
          ))}
      </div>

      {/* Queue Rows */}
      <div className="space-y-3 flex-1">
          {queues.length > 0 ? queues.map((queue, queueIndex) => (
              <div key={queueIndex} className="grid grid-cols-[2fr_repeat(7,_1fr)] gap-2 items-center">
                  <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col justify-center">
                      <div className="text-2xl font-bold">{queue.name}</div>
                      <div className="text-gray-400">{queue.status}</div>
                  </div>
                   <MetricBox value={queue.connectedAgents} isHighlighted={queue.connectedAgents > 0} />
                   <MetricBox value={queue.inQueue} isHighlighted={queue.inQueue > 0} />
                   <MetricBox value={queue.currentWait} />
                   <MetricBox value={queue.avgWait} />
                   <MetricBox value={queue.received} />
                   <MetricBox value={queue.missed} isAlert={queue.missed > 0} />
                   <MetricBox value={queue.serviceLevel} />
              </div>
          )) : (
            <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <p className="text-gray-400">Aucune donnée de file d'attente à afficher.</p>
            </div>
          )}
      </div>

      <footer className="mt-8 shrink-0">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-400">
            {headerIcons.map(({ Icon, label }, index) => (
                 <div key={index} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                 </div>
            ))}
        </div>
      </footer>
    </div>
  );
};

interface MetricBoxProps {
    value: string | number;
    isHighlighted?: boolean;
    isAlert?: boolean;
}

const MetricBox: React.FC<MetricBoxProps> = ({ value, isHighlighted = false, isAlert = false }) => {
    const baseClasses = "bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center text-3xl font-semibold";
    const highlightedClasses = isHighlighted ? "bg-blue-600" : "";
    const alertClasses = isAlert ? "bg-red-600" : "";
    
    return (
        <div className={`${baseClasses} ${alertClasses || highlightedClasses}`}>
            {value}
        </div>
    )
}

export default QueueWallboard;
