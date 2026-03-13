import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import firebaseJson from "~~/firebase.json";
import type { FirebaseEmulatorsOptions } from "~~/shared/types";

export default defineNuxtPlugin({
    setup(nuxtApp) {
        const appConfig = useAppConfig();
        const runtimeConfig = useRuntimeConfig();
        const clientAppConfig = {
            apiKey: runtimeConfig.public.firebaseApiKey,
            authDomain: runtimeConfig.public.firebaseAuthDomain,
            projectId: runtimeConfig.public.firebaseProjectId,
            storageBucket: runtimeConfig.public.firebaseStorageBucket,
            messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
            appId: runtimeConfig.public.firebaseAppId,
        };
        const app = initializeApp(clientAppConfig);
        const auth = getAuth(app);
        const functions = getFunctions(app, "europe-west3");
        const firestore = initializeFirestore(app, { ignoreUndefinedProperties: true });

        const emulatorsConfig: boolean | FirebaseEmulatorsOptions = appConfig.firebase.emulators as any;
        if (process.env.NODE_ENV !== "production") {
            const authEmulator = emulatorsConfig === true || (emulatorsConfig as any)?.auth === true;
            const firestoreEmulator = emulatorsConfig === true || (emulatorsConfig as any)?.firestore === true;
            const functionsEmulator = emulatorsConfig === true || (emulatorsConfig as any)?.functions === true;

            if (authEmulator) connectAuthEmulator(auth, `http://127.0.0.1:${firebaseJson.emulators.auth.port}`);
            if (firestoreEmulator) connectFirestoreEmulator(firestore, "127.0.0.1", firebaseJson.emulators.firestore.port);
            if (functionsEmulator) connectFunctionsEmulator(functions, "127.0.0.1", firebaseJson.emulators.functions.port);
        }

        console.log(`[Firebase] initialized {emulators: ${JSON.stringify(emulatorsConfig)}}`);
        return {
            provide: {
                firestore: firestore,
                auth: auth,
                functions: functions,
            },
        };
    },
    enforce: "pre",
});
