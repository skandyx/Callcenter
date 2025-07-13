
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useState } from "react";
import { Copy, Trash2, Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";

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
    id: "advanced-calls",
    label: "Données d'appel avancées",
    description: "Plusieurs enregistrements possibles par appel (transferts, tentatives, etc.).",
    path: "/api/stream/advanced-calls",
  },
  {
    id: "agent-status",
    label: "Disponibilité des agents et connexions",
    description: "Statistiques sur les connexions aux files d'attente et l'état des agents.",
    path: "/api/stream/agent-status",
  }
];

export default function AdvancedSettingsDialog({
  isOpen,
  onOpenChange,
}: AdvancedSettingsDialogProps) {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("");
  const [isClearing, setIsClearing] = useState(false);

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

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      const response = await fetch('/api/clear-data', {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue.');
      }
      toast({
        title: "Succès !",
        description: result.message,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paramètres Avancés</DialogTitle>
          <DialogDescription>
            Gérez les URLs de transmission et les données de l'application.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">URLs de Transmission</h3>
              <div className="space-y-4">
                {urlItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg bg-background/50">
                    <Label htmlFor={item.id} className="text-base font-semibold text-foreground mb-2">
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
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Gestion des Données</h3>
              <div className="p-4 border rounded-lg bg-background/50">
                 <Label className="text-base font-semibold text-foreground mb-2">
                  Zone de Danger
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Cette action est irréversible. Toutes les données d'appel actuelles (simplifiées et avancées) seront définitivement supprimées.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isClearing}>
                      {isClearing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Vider les Données
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action ne peut pas être annulée. Cela supprimera définitivement toutes les données d'appel du serveur.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearData}>
                        Oui, vider les données
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
