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
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";

interface AdvancedSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AdvancedSettingsDialog({
  isOpen,
  onOpenChange,
}: AdvancedSettingsDialogProps) {
  const { toast } = useToast();
  const [pushUrl, setPushUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPushUrl(`${window.location.origin}/api/stream`);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pushUrl);
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
            Configurez les intégrations pour envoyer et recevoir des données.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6">
            {/* Section for PBX to push data to this app */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Recevoir des données de votre PBX
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Utilisez l'URL ci-dessous dans votre système PBX pour pousser les
                données d'appel vers cette application. L'application s'attend à
                recevoir des requêtes POST avec un corps JSON.
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  id="pbx-push-url"
                  value={pushUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={copyToClipboard}
                  aria-label="Copier l'URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
