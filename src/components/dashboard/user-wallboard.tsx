
"use client";

import React, { useMemo } from 'react';
import { User, Phone, PhoneOutgoing, Clock, BarChart, PhoneMissed } from 'lucide-react';
import { type AdvancedCallData } from '@/lib/types';


interface UserWallboardProps {
    advancedCallData: AdvancedCallData[];
}


const UserWallboard = ({ advancedCallData }: UserWallboardProps) => {

  const agentStats = useMemo(() => {
    if (!advancedCallData) return {};
    
    const stats: { [key: string]: { 
        name: string,
        status: string,
        timeInStatus: string,
        callsAnswered: number,
        callsOut: number,
        avgTalkTime: string,
        totalTalkTime: number,
        missedCalls: number 
    } } = {};

    // Define values that are not real agents to filter them out.
    const nonAgentNames = new Set(['sales', 'support', 'ivr', null, undefined]);
    
    const agentNames = new Set(
        advancedCallData
            .map(d => d.agent)
            .filter((a): a is string => !!a && !nonAgentNames.has(a.toLowerCase()))
    );


    agentNames.forEach(name => {
        stats[name] = {
            name: name,
            status: "Available", // Mocked for now
            timeInStatus: "0s", // Mocked for now
            callsAnswered: 0,
            callsOut: 0,
            avgTalkTime: "0s",
            totalTalkTime: 0,
            missedCalls: 0
        };
    });

    advancedCallData.forEach(call => {
        if (call.agent && stats[call.agent]) {
            const agentStat = stats[call.agent];
            
            if (call.status === 'Completed') {
                if(call.status_detail.toLowerCase().includes('incoming')) {
                    agentStat.callsAnswered++;
                } else if (call.status_detail.toLowerCase().includes('outgoing')) {
                    agentStat.callsOut++;
                }
            } else if (call.status === 'Abandoned' && call.status_detail && call.status_detail.toLowerCase().includes('missed')) {
                agentStat.missedCalls++;
            }
            
            if (call.processing_time_seconds) {
                agentStat.totalTalkTime += call.processing_time_seconds;
            }
        }
    });

    // Calculate Average Talk Time
    Object.values(stats).forEach(agentStat => {
        const totalCalls = agentStat.callsAnswered + agentStat.callsOut;
        if(totalCalls > 0) {
            const avgSeconds = Math.round(agentStat.totalTalkTime / totalCalls);
            const minutes = Math.floor(avgSeconds / 60);
            const seconds = avgSeconds % 60;
            agentStat.avgTalkTime = `${minutes}m ${seconds}s`;
        } else {
            agentStat.avgTalkTime = "0m 0s";
        }
    });


    return stats;
  }, [advancedCallData]);

  const agents = Object.values(agentStats);

  const headerIcons = [
    { Icon: User, label: "Statut" },
    { Icon: Clock, label: "Temps État Actuel" },
    { Icon: Phone, label: "Appels Répondus" },
    { Icon: PhoneOutgoing, label: "Appels Sortants" },
    { Icon: PhoneMissed, label: "Appels Manqués" },
    { Icon: Clock, label: "Temps Com. Moyen" },
    { Icon: BarChart, label: "Temps Com. Total (sec)" },
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
        case "In Call": return "bg-red-600";
        case "Available": return "bg-green-600";
        case "Wrap-up": return "bg-yellow-500";
        case "Away": return "bg-gray-500";
        default: return "bg-gray-700";
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Row */}
      <div className="grid grid-cols-[2.5fr_repeat(7,_1fr)] gap-2 mb-2 items-end">
          <div />
          {headerIcons.map(({ Icon }, index) => (
               <div key={index} className="flex justify-center">
                  <Icon className="h-6 w-6 text-gray-400" />
               </div>
          ))}
      </div>

      {/* Agent Rows */}
      <div className="space-y-3 flex-1">
          {agents.length > 0 ? agents.map((agent, agentIndex) => (
              <div key={agentIndex} className="grid grid-cols-[2.5fr_repeat(7,_1fr)] gap-2 items-center">
                  <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col justify-center">
                      <div className="text-2xl font-bold">{agent.name}</div>
                  </div>
                   <div className={`${getStatusColor(agent.status)} rounded-lg p-4 h-full flex items-center justify-center text-xl font-semibold`}>
                       {agent.status}
                   </div>
                   <MetricBox value={agent.timeInStatus} />
                   <MetricBox value={agent.callsAnswered} />
                   <MetricBox value={agent.callsOut} />
                   <MetricBox value={agent.missedCalls} isAlert={agent.missedCalls > 0} />
                   <MetricBox value={agent.avgTalkTime} />
                   <MetricBox value={agent.totalTalkTime} />
              </div>
          )) : (
             <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                <p className="text-gray-400">Aucune donnée d'agent à afficher.</p>
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
    isAlert?: boolean;
}

const MetricBox: React.FC<MetricBoxProps> = ({ value, isAlert = false }) => {
    const baseClasses = "bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center text-3xl font-semibold";
    const alertClasses = isAlert ? "bg-red-600" : "";
    
    return (
        <div className={`${baseClasses} ${alertClasses}`}>
            {value}
        </div>
    )
}

export default UserWallboard;
