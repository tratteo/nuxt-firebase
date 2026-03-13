import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";
import { isSignedIn, onCallGenkit } from "firebase-functions/https";
import { paraphraseTextFlow } from "./flows/paraphrase_text";

export const FUNCTIONS_REGION = "europe-west3";

setGlobalOptions({ region: FUNCTIONS_REGION, memory: "512MiB", timeoutSeconds: 600 });
admin.initializeApp();

const cors = process.env.FUNCTIONS_EMULATOR === "true" ? true : /https:\/\//;
console.log("CORS status:", cors);
export const paraphraseText = onCallGenkit({ cors: cors, authPolicy: isSignedIn() }, paraphraseTextFlow);
