"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";

interface AdvancedSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type UrlItem = {
  id: string;
  label: string;
  description: string;
  path: string;
};

const urlItems: UrlItem[] = [
  {
    id: "simplified-calls",
    label: "Données d'appel simplifiées",
    description: "Un enregistrement par appel.",
    path: "/api/stream",
  },
  {
    id: "agent-status",
    label: "Disponibilité des agents et connexions",
    description: "Statistiques sur les connexions aux files d'attente et l'état des agents.",
    path: "/api/stream/agent-status",
  },
  {
    id: "profile-availability",
    label: "Disponibilité des profils",
    description: "Statistiques sur le temps passé par les utilisateurs dans chaque profil.",
    path: "/api/stream/profile-availability",
  },
];

export default function AdvancedSettingsDialog({
  isOpen,
  onOpenChange,
}: AdvancedSettingsDialogProps) {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const copyToClipboard = (path: string) => {
    const fullUrl = `${baseUrl}${path}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Copié !",
      description: "L'URL de transmission a été copiée dans le presse-papiers.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paramètres Avancés</DialogTitle>
          <DialogDescription>
            Configurez votre PBX pour envoyer des données à cette application en
            utilisant les URLs de transmission ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6">
            {urlItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <Label htmlFor={item.id} className="text-lg font-semibold text-foreground mb-2">
                  {item.label}
                </Label>
                 <p className="text-sm text-muted-foreground mb-4">
                  {item.description}
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    id={item.id}
                    value={`${baseUrl}${item.path}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => copyToClipboard(item.path)}
                    aria-label={`Copier l'URL pour ${item.label}`}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
