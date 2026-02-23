'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating personalized product recommendations.
 *
 * - personalizedProductRecommendations - A function that generates product recommendations based on browsing history.
 * - PersonalizedProductRecommendationsInput - The input type for the personalizedProductRecommendations function.
 * - PersonalizedProductRecommendationsOutput - The return type for the personalizedProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedProductRecommendationsInputSchema = z.object({
  browsingHistory: z
    .array(z.string())
    .describe(
      'A list of product names or categories that the user has recently viewed.'
    ),
  numRecommendations: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe('The number of product recommendations to generate.'),
});
export type PersonalizedProductRecommendationsInput = z.infer<
  typeof PersonalizedProductRecommendationsInputSchema
>;

const PersonalizedProductRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('A list of recommended product names or IDs.'),
});
export type PersonalizedProductRecommendationsOutput = z.infer<
  typeof PersonalizedProductRecommendationsOutputSchema
>;

export async function personalizedProductRecommendations(
  input: PersonalizedProductRecommendationsInput
): Promise<PersonalizedProductRecommendationsOutput> {
  return personalizedProductRecommendationsFlow(input);
}

const recommendationsPrompt = ai.definePrompt({
  name: 'personalizedProductRecommendationsPrompt',
  input: {schema: PersonalizedProductRecommendationsInputSchema},
  output: {schema: PersonalizedProductRecommendationsOutputSchema},
  prompt: `You are an AI-powered e-commerce recommendation engine for an electronics store named Souk Electra.
Your goal is to suggest relevant products to a customer based on their recent browsing history.

Here is the customer's browsing history:
{{#each browsingHistory}}
- {{{this}}}
{{/each}}

Based on this history, please recommend {{numRecommendations}} additional products that the user might be interested in.
Focus on products that are similar in category, price range, or complementary to the items they have viewed.

Provide the recommendations as a JSON array of product names, like this:
{
  "recommendations": [
    "Product A",
    "Product B",
    "Product C"
  ]
}
`,
});

const personalizedProductRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedProductRecommendationsFlow',
    inputSchema: PersonalizedProductRecommendationsInputSchema,
    outputSchema: PersonalizedProductRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await recommendationsPrompt(input);
    if (!output) {
      throw new Error('No recommendations were generated.');
    }
    return output;
  }
);
