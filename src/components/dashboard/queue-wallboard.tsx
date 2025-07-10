
"use client";

import React, { useMemo } from 'react';
import { Headset, Phone, Clock, Check, PhoneMissed, Star, Users } from 'lucide-react';
import { type AgentStatusData } from '@/lib/types';


interface QueueWallboardProps {
    agentStatusData: AgentStatusData[];
}

const QueueWallboard = ({ agentStatusData }: QueueWallboardProps) => {

  const agentsPerQueue = useMemo(() => {
    if (!agentStatusData) return {};
    const queueAgentCount: { [key: string]: number } = {};
    
    // Use the most recent status data for each agent per queue to determine if they are logged in
    const latestAgentStatus: { [key: string]: AgentStatusData } = {};
    agentStatusData.forEach(status => {
      const key = `${status.user_id}-${status.queuename}`;
      const existing = latestAgentStatus[key];
      if (!existing || new Date(`${status.date}T${String(status.hour).padStart(2,'0')}:00:00`) > new Date(`${existing.date}T${String(existing.hour).padStart(2,'0')}:00:00`)) {
        latestAgentStatus[key] = status;
      }
    });

    Object.values(latestAgentStatus).forEach(status => {
        if (status.loggedIn > 0) { // Consider agent connected if loggedIn time is positive
            if (!queueAgentCount[status.queuename]) {
                queueAgentCount[status.queuename] = 0;
            }
            queueAgentCount[status.queuename]++;
        }
    });

    return queueAgentCount;
  }, [agentStatusData]);
    
  // Mock data for demonstration purposes
  const queues = [
    { name: "A-1", status: "Open", inQueue: 0, currentWait: "0s", avgWait: "0s", received: 0, missed: 0, serviceLevel: "100%" },
    { name: "HELPDESK", status: "Open", inQueue: 0, currentWait: "0s", avgWait: "0s", received: 0, missed: 0, serviceLevel: "100%" },
    { name: "Ventes", status: "Closed", inQueue: 3, currentWait: "1m 32s", avgWait: "45s", received: 25, missed: 2, serviceLevel: "92%" },
    { name: "Support", status: "Open", inQueue: 1, currentWait: "22s", avgWait: "30s", received: 18, missed: 1, serviceLevel: "95%" }
  ];

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
          {queues.map((queue, queueIndex) => (
              <div key={queueIndex} className="grid grid-cols-[2fr_repeat(7,_1fr)] gap-2 items-center">
                  <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col justify-center">
                      <div className="text-2xl font-bold">{queue.name}</div>
                      <div className="text-gray-400">{queue.status}</div>
                  </div>
                   <MetricBox value={agentsPerQueue[queue.name] || 0} isHighlighted={(agentsPerQueue[queue.name] || 0) > 0} />
                   <MetricBox value={queue.inQueue} isHighlighted={queue.inQueue > 0} />
                   <MetricBox value={queue.currentWait} />
                   <MetricBox value={queue.avgWait} />
                   <MetricBox value={queue.received} />
                   <MetricBox value={queue.missed} isAlert={queue.missed > 0} />
                   <MetricBox value={queue.serviceLevel} />
              </div>
          ))}
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
