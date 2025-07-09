"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";

interface AdvancedSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  url: z.string().url({ message: "Veuillez entrer une URL valide." }),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Saving Power BI URL:", values);
    toast({
      title: "Paramètres enregistrés",
      description: "L'URL de destination des données a été mise à jour.",
    });
    onOpenChange(false);
    form.reset();
  }

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
                    Utilisez l'URL ci-dessous dans votre système PBX pour pousser les données d'appel vers cette application. L'application s'attend à recevoir des requêtes POST avec un corps JSON.
                </p>
                <div className="flex items-center space-x-2">
                    <Input
                        id="pbx-push-url"
                        value={pushUrl}
                        readOnly
                        className="flex-1"
                    />
                    <Button variant="secondary" size="icon" onClick={copyToClipboard} aria-label="Copier l'URL">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Section for this app to push data to Power BI */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                        Connecter à Microsoft Power BI
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Suivez ces étapes pour envoyer les données de cette application vers votre espace de travail Power BI.
                    </p>
                </div>

                <div className="p-4 space-y-3 border rounded-md bg-muted/50">
                <h3 className="font-semibold text-foreground">
                    Étape 1: Accéder à votre espace de travail
                </h3>
                <p className="text-sm text-muted-foreground">
                    Connectez-vous à Power BI. Si c'est votre première fois, cliquez sur le bouton de menu en haut à gauche et sélectionnez « Mon espace de travail ».
                </p>
                </div>

                <div className="p-4 space-y-3 border rounded-md bg-muted/50">
                <h3 className="font-semibold text-foreground">
                    Étape 2: Créer un jeu de données en continu
                </h3>
                <p className="text-sm text-muted-foreground">
                    Dans le coin supérieur droit, cliquez sur « + Créer », puis sélectionnez « Jeu de données en continu ». Choisissez « API » comme source de données et cliquez sur « Suivant ».
                </p>
                </div>

                <div className="p-4 space-y-3 border rounded-md bg-muted/50">
                    <h3 className="font-semibold text-foreground">
                        Étape 3: Configurer votre flux de données
                    </h3>
                    <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                        <li>
                        Donnez un nom à votre jeu de données (par exemple, "Statistiques Centre d'Appel").
                        </li>
                        <li>
                        Activez l'option « Analyse des données historiques ».
                        </li>
                        <li>
                        Ajoutez tous les champs requis comme indiqué dans le didacticiel.
                        </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                        Une fois tous les champs saisis, cliquez sur « Créer ». Power BI vous fournira une « URL de transmission (Push URL) ».
                    </p>
                </div>

                <div className="space-y-2 pt-2">
                    <h3 className="font-semibold text-foreground">
                        Étape 4: Connecter cette application à Power BI
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Copiez l'« URL de transmission (Push URL) » que Power BI vient de vous donner et collez-la dans le champ ci-dessous.
                    </p>
                </div>

                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL de Transmission Power BI</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="Collez ici l'URL de Power BI"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Alert variant="default" className="bg-muted/50">
                    <AlertDescription className="text-xs text-muted-foreground">
                        La finalisation de la synchronisation des anciennes données
                        pourrait prendre du temps.
                    </AlertDescription>
                    </Alert>
                    <DialogFooter>
                    <Button type="submit" disabled={!form.formState.isValid}>
                        Enregistrer l'URL
                    </Button>
                    </DialogFooter>
                </form>
                </Form>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
