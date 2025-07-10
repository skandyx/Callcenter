
"use client";

import React from 'react';
import { Headset, Phone, Clock, Check, PhoneMissed, Star } from 'lucide-react';

const QueueWallboard = () => {
  // Mock data for demonstration purposes
  const queues = [
    { name: "A-1", status: "Open", loggedIn: 0, inQueue: 0, currentWait: "0s", avgWait: "0s", received: 0, missed: 0, serviceLevel: "100%" },
    { name: "HELPDESK", status: "Open", loggedIn: 2, inQueue: 0, currentWait: "0s", avgWait: "0s", received: 0, missed: 0, serviceLevel: "100%" },
    { name: "Sales FR", status: "Closed", loggedIn: 5, inQueue: 3, currentWait: "1m 32s", avgWait: "45s", received: 25, missed: 2, serviceLevel: "92%" },
    { name: "Support EN", status: "Open", loggedIn: 3, inQueue: 1, currentWait: "22s", avgWait: "30s", received: 18, missed: 1, serviceLevel: "95%" }
  ];

  const headerIcons = [
    { Icon: Headset, label: "Logged in" },
    { Icon: Phone, label: "Calls in queue" },
    { Icon: Clock, label: "Current wait time" },
    { Icon: Clock, label: "Average wait time" },
    { Icon: Check, label: "Received calls" },
    { Icon: PhoneMissed, label: "Missed calls" },
    { Icon: Star, label: "Service level" }
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
                   <MetricBox value={queue.loggedIn} isHighlighted={queue.loggedIn > 0} />
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
