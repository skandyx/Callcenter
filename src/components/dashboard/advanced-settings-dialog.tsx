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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Saving Power BI URL:", values);
    // Ici, vous feriez un appel API pour sauvegarder l'URL
    toast({
      title: "Paramètres enregistrés",
      description: "L'URL de destination des données a été mise à jour.",
    });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Configurer le flux de données Power BI</DialogTitle>
          <DialogDescription>
            Suivez ces étapes pour connecter vos données à Microsoft Power BI.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Grâce à Power BI de Microsoft, vos données prennent vie et vous
              donnent la capacité d'analyser en profondeur vos données en
              tenant compte de vos besoins particuliers.
            </p>

            <div className="p-4 space-y-3 border rounded-md bg-muted/50">
              <h3 className="font-semibold text-foreground">
                Étape 1: Accéder à votre espace de travail
              </h3>
              <p>
                Connectez-vous à Power BI. Si c'est votre première fois, cliquez sur le bouton de menu en haut à gauche et sélectionnez « Mon espace de travail ».
              </p>
            </div>

            <div className="p-4 space-y-3 border rounded-md bg-muted/50">
              <h3 className="font-semibold text-foreground">
                Étape 2: Créer un jeu de données en continu
              </h3>
              <p>
                Dans le coin supérieur droit, cliquez sur « + Créer », puis sélectionnez « Jeu de données en continu ».
              </p>
              <p>
                Choisissez « API » comme source de données et cliquez sur « Suivant ».
              </p>
            </div>

            <div className="p-4 space-y-3 border rounded-md bg-muted/50">
              <h3 className="font-semibold text-foreground">
                Étape 3: Configurer votre flux de données
              </h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  Donnez un nom à votre jeu de données (par exemple, "Statistiques Centre d'Appel").
                </li>
                <li>
                  Activez l'option « Analyse des données historiques ».
                </li>
                <li>
                  Ajoutez tous les champs requis comme indiqué dans le didacticiel (un lien sera fourni ici).
                </li>
              </ul>
              <p>
                Une fois tous les champs saisis, cliquez sur « Créer ». Power BI vous fournira une « URL de transmission (Push URL) ».
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                    Étape 4: Connecter cette application à Power BI
                </h3>
                <p>
                    Copiez l'« URL de transmission (Push URL) » que Power BI vient de vous donner et collez-la dans le champ ci-dessous.
                </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Collez ici l'URL de transmission de Power BI"
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
