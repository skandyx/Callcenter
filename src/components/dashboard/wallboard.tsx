

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueueWallboard from './queue-wallboard';
import UserWallboard from './user-wallboard';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { type AdvancedCallData, type AgentStatusData } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const Wallboard = () => {
  const [advancedCallData, setAdvancedCallData] = useState<AdvancedCallData[]>([]);
  const [agentStatusData, setAgentStatusData] = useState<AgentStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [advCallsRes, agentStatusRes] = await Promise.all([
        fetch('/api/advanced-call-data'),
        fetch('/api/agent-status-data')
      ]);

      if (!advCallsRes.ok || !agentStatusRes.ok) {
        throw new Error('Failed to fetch wallboard data');
      }

      const advCalls = await advCallsRes.json();
      const agentStatus = await agentStatusRes.json();

      setAdvancedCallData(advCalls);
      setAgentStatusData(agentStatus);
    } catch (error) {
      console.error("Error fetching wallboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans flex flex-col">
      <header className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-3xl font-bold uppercase">WALLBOARD</h1>
        <div className="flex items-center gap-2">
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/wallboard" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-6 w-6 text-gray-400" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ouvrir dans un nouvel onglet</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <X className="h-6 w-6 text-gray-400" />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Fermer le Wallboard</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      </header>
      
      <main className="flex-1">
        <Tabs defaultValue="queues" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="queues">Queues</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>
          {isLoading ? (
            <div className="flex-1 mt-4 space-y-3">
              <div className="grid grid-cols-[2fr_repeat(7,_1fr)] gap-2">
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
              </div>
               <div className="grid grid-cols-[2fr_repeat(7,_1fr)] gap-2">
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
                  <Skeleton className="h-24 rounded-lg bg-gray-800/50" />
              </div>
            </div>
          ) : (
          <>
            <TabsContent value="queues" className="flex-1 mt-4">
              <QueueWallboard agentStatusData={agentStatusData} />
            </TabsContent>
            <TabsContent value="agents" className="flex-1 mt-4">
              <UserWallboard advancedCallData={advancedCallData} />
            </TabsContent>
          </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Wallboard;
