import {config} from 'dotenv';
config();

import {genkit, Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Déclarer une interface pour notre objet global personnalisé
interface MyGlobal extends NodeJS.Global {
    genkitAiInstance?: Genkit;
}

// Caster l'objet global pour y ajouter notre propriété
const customGlobal = global as MyGlobal;

function initializeGenkit() {
  return genkit({
    plugins: [
      googleAI({
        // Vous pouvez spécifier la clé API ici directement si vous préférez
        // apiKey: process.env.GOOGLE_API_KEY,
      }),
    ],
    logLevel: 'debug',
    flowStateStore: 'firebase',
    traceStore: 'firebase',
    model: 'googleai/gemini-1.5-flash',
  });
}

// S'assurer que Genkit n'est initialisé qu'une seule fois
if (!customGlobal.genkitAiInstance) {
  customGlobal.genkitAiInstance = initializeGenkit();
}

export const ai = customGlobal.genkitAiInstance;
