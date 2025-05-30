'use server';

/**
 * @fileOverview Generates math problems dynamically, tailoring difficulty to the player's progress.
 *
 * - generateMathProblem - A function that generates math problems.
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
  problem: z.string().describe('The math problem to be displayed to the user.'),
  answer: z.number().describe('The correct answer to the math problem.'),
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
  prompt: `You are a math problem generator for an elementary school game.

    Generate a math problem suitable for elementary school students.
    The problem should focus on addition and subtraction with both positive and negative numbers.
    The difficulty of the problem should be adjusted based on the difficulty level.

    Difficulty Level: {{{difficulty}}}

    Problem: {{problem}}
    Answer: {{answer}}`,
});

const generateMathProblemFlow = ai.defineFlow(
  {
    name: 'generateMathProblemFlow',
    inputSchema: GenerateMathProblemInputSchema,
    outputSchema: GenerateMathProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
