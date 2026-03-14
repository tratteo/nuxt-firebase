import { enableFirebaseTelemetry } from "@genkit-ai/firebase";
import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";

enableFirebaseTelemetry();

export const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model("gemini-2.5-flash"),
});

// Register flows

require("./flows/paraphrase_text");
