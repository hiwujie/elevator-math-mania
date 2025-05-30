
'use server';

/**
 * @fileOverview Generates start and target floors for an elevator math game.
 *
 * - generateMathProblem - A function that generates start and target floors.
 * - GenerateMathProblemInput - The input type for the generateMathProblem function.
 * - GenerateMathProblemOutput - The return type for the generateMathProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMathProblemInputSchema = z.object({
  difficulty: z
    .number()
    .describe(
      'The difficulty level of the math problem, where 1 is easiest and 10 is hardest.'
    ),
});
export type GenerateMathProblemInput = z.infer<typeof GenerateMathProblemInputSchema>;

const GenerateMathProblemOutputSchema = z.object({
  startFloor: z.number().describe('The integer floor the monkey is currently on.'),
  targetFloor: z.number().describe('The integer floor the monkey wants to go to.'),
});
export type GenerateMathProblemOutput = z.infer<typeof GenerateMathProblemOutputSchema>;

export async function generateMathProblem(
  input: GenerateMathProblemInput
): Promise<GenerateMathProblemOutput> {
  return generateMathProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMathProblemPrompt',
  input: {schema: GenerateMathProblemInputSchema},
  output: {schema: GenerateMathProblemOutputSchema},
  prompt: `You are a math problem generator for an elementary school elevator game. The monkey is on a 'startFloor' and wants to go to a 'targetFloor'.
Generate integer values for startFloor and targetFloor.

Constraints:
1.  startFloor must be between -5 and 5, inclusive.
2.  targetFloor must be between -10 and 10, inclusive.
3.  startFloor and targetFloor MUST be different values.
4.  The absolute difference between startFloor and targetFloor (i.e., abs(targetFloor - startFloor)) MUST be between 1 and 10, inclusive. This is the number of floors the elevator will move.

Adjust the problem based on the difficulty level (1-10). For higher difficulty:
-   The absolute values of startFloor and targetFloor can be larger (closer to the extremes of their ranges).
-   The absolute difference (number of floors to move) can be larger (closer to 10).

Difficulty Level: {{{difficulty}}}
`,
});

const generateMathProblemFlow = ai.defineFlow(
  {
    name: 'generateMathProblemFlow',
    inputSchema: GenerateMathProblemInputSchema,
    outputSchema: GenerateMathProblemOutputSchema,
  },
  async input => {
    // In a real scenario, you might want to add a loop here to re-call the prompt
    // if it fails to meet constraints (e.g. startFloor === targetFloor, or abs diff not 1-10)
    // For simplicity, we're relying on the prompt to be good.
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('AI failed to generate a problem.');
    }
    // Additional validation can be added here if necessary
    if (output.startFloor === output.targetFloor) {
        console.warn("AI generated same start and target floor, attempting to fix or re-generate might be needed.");
        // Simple fix: make targetFloor different if possible, or throw to retry.
        // This part could be more robust.
        output.targetFloor = output.startFloor + (output.startFloor < 10 ? 1 : -1);
        if (Math.abs(output.targetFloor - output.startFloor) > 10 || Math.abs(output.targetFloor - output.startFloor) < 1) {
            //This fix is too naive, ideally re-prompt or better logic
             throw new Error('AI generated invalid problem, constraints violated after simple fix.');
        }
    }
    if (Math.abs(output.targetFloor - output.startFloor) > 10 || Math.abs(output.targetFloor - output.startFloor) < 1) {
        console.warn("AI generated problem with invalid floor difference.");
        // This is a critical constraint, ideally re-prompt.
        throw new Error('AI generated invalid problem, floor difference constraint violated.');
    }

    return output;
  }
);
