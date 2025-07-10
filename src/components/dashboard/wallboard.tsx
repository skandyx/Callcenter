
"use client";

import React from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QueueWallboard from './queue-wallboard';
import UserWallboard from './user-wallboard';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';

const Wallboard = () => {
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
          <TabsContent value="queues" className="flex-1 mt-4">
            <QueueWallboard />
          </TabsContent>
          <TabsContent value="agents" className="flex-1 mt-4">
            <UserWallboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Wallboard;
