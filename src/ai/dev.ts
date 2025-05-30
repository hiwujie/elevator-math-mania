import { config } from 'dotenv';
config();

// No Genkit flows are actively used for game logic in this version of the game.
// The generate-math-problem flow has been replaced with a local algorithm.
// If you add new Genkit flows in the future, import them here.
// e.g., import '@/ai/flows/your-new-flow.ts';

console.log("Genkit development server started. No game-specific flows registered for this app currently.");
