
"use client";

import React from 'react';
import { User, Phone, PhoneOutgoing, Clock, BarChart } from 'lucide-react';

const UserWallboard = () => {
  // Mock data for demonstration purposes
  const agents = [
    { name: "Luffy Monkey D", status: "In Call", callsAnswered: 15, callsOut: 5, avgTalkTime: "3m 45s", totalTalkTime: "56m 15s" },
    { name: "Zoro Roronoa", status: "Available", callsAnswered: 12, callsOut: 2, avgTalkTime: "4m 10s", totalTalkTime: "50m 00s" },
    { name: "Alex 777", status: "Wrap-up", callsAnswered: 20, callsOut: 8, avgTalkTime: "2m 55s", totalTalkTime: "58m 20s" },
    { name: "Sanji Vinsmoke", status: "Away", callsAnswered: 10, callsOut: 1, avgTalkTime: "5m 02s", totalTalkTime: "50m 20s" }
  ];

  const headerIcons = [
    { Icon: User, label: "Status" },
    { Icon: Phone, label: "Calls Answered" },
    { Icon: PhoneOutgoing, label: "Outbound Calls" },
    { Icon: Clock, label: "Avg. Talk Time" },
    { Icon: BarChart, label: "Total Talk Time" },
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
      <div className="grid grid-cols-[3fr_repeat(5,_1fr)] gap-2 mb-2 items-end">
          <div />
          {headerIcons.map(({ Icon }, index) => (
               <div key={index} className="flex justify-center">
                  <Icon className="h-6 w-6 text-gray-400" />
               </div>
          ))}
      </div>

      {/* Agent Rows */}
      <div className="space-y-3 flex-1">
          {agents.map((agent, agentIndex) => (
              <div key={agentIndex} className="grid grid-cols-[3fr_repeat(5,_1fr)] gap-2 items-center">
                  <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col justify-center">
                      <div className="text-2xl font-bold">{agent.name}</div>
                  </div>
                   <div className={`${getStatusColor(agent.status)} rounded-lg p-4 h-full flex items-center justify-center text-xl font-semibold`}>
                       {agent.status}
                   </div>
                   <MetricBox value={agent.callsAnswered} />
                   <MetricBox value={agent.callsOut} />
                   <MetricBox value={agent.avgTalkTime} />
                   <MetricBox value={agent.totalTalkTime} />
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
}

const MetricBox: React.FC<MetricBoxProps> = ({ value }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center text-3xl font-semibold">
            {value}
        </div>
    )
}

export default UserWallboard;
