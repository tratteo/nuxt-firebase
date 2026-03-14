import z from "zod";
import { ai } from "../genkit";

const flowInputObject = z.object({
    text: z.string().describe("The text to paraphrase"),
    instructions: z.string().describe("The instructions to use to edit the text"),
});

const flowOutputObject = z.object({
    text: z.string().describe("The edited text"),
    summary: z
        .string()
        .describe('A very brief explanation in first person of what changes were applied and why. Example: "I have condensed the definition in a single meaningful line"'),
});

export type ParaphraseTextFlowInput = z.infer<typeof flowInputObject>;
export type ParaphraseTextFlowOutput = z.infer<typeof flowOutputObject>;

const ParaphraseTextInputSchema = ai.defineSchema("ParaphraseTextInputSchema", flowInputObject);
const ParaphraseTextOutputSchema = ai.defineSchema("ParaphraseTextOutputSchema", flowOutputObject);
const prompt = ai.prompt<typeof ParaphraseTextInputSchema, typeof ParaphraseTextOutputSchema>("paraphraseText");

export const paraphraseTextFlow = ai.defineFlow(
    {
        name: "paraphraseText",
        inputSchema: flowInputObject,
        outputSchema: flowOutputObject,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (output == null) {
            throw new Error("Response doesn't satisfy schema.");
        }
        return output;
    },
);
