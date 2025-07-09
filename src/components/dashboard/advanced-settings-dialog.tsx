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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Intégration Power BI</DialogTitle>
          <DialogDescription>
            Connectez vos données d'appel à Microsoft Power BI pour créer des
            tableaux de bord personnalisés.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Suivez ces étapes pour commencer en moins de 5 minutes. Pour un guide
            plus détaillé, consultez notre{" "}
            <a href="#" className="underline text-primary">
              didacticiel complet
            </a>
            .
          </p>
          <div className="p-4 space-y-3 border rounded-md bg-muted/50">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 font-bold rounded-full bg-primary text-primary-foreground shrink-0">
                1
              </div>
              <p>
                Inscrivez-vous à Power BI. Ne vous inquiétez pas, l'inscription
                est gratuite !
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 font-bold rounded-full bg-primary text-primary-foreground shrink-0">
                2
              </div>
              <p>
                Choisissez « Nouveau flux de données » et ajoutez une nouvelle
                sélection.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 font-bold rounded-full bg-primary text-primary-foreground shrink-0">
                3
              </div>
              <p>
                Ajoutez tous les champs requis comme indiqué dans le
                didacticiel.
              </p>
            </div>
          </div>

          <Separator />

          <p className="font-semibold text-foreground">
            Étape 4 : Connectez Power BI à cette application
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Collez ici l'URL du flux de données Power BI"
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
      </DialogContent>
    </Dialog>
  );
}
