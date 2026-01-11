import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
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
        const firestore = initializeFirestore(app, { ignoreUndefinedProperties: true });

        const emulatorsConfig: boolean | FirebaseEmulatorsOptions = appConfig.firebase.emulators;
        if (process.env.NODE_ENV !== "production") {
            const authEmulator = emulatorsConfig === true || (emulatorsConfig as any)?.auth === true;
            const firestoreEmulator = emulatorsConfig === true || (emulatorsConfig as any)?.firestore === true;

            if (authEmulator) connectAuthEmulator(auth, `http://127.0.0.1:${firebaseJson.emulators.auth.port}`);
            if (firestoreEmulator) connectFirestoreEmulator(firestore, "127.0.0.1", firebaseJson.emulators.firestore.port);
        }

        console.log(`[Firebase] initialized {emulators: ${JSON.stringify(emulatorsConfig)}}`);
        return {
            provide: {
                firestore: firestore,
                auth: auth,
            },
        };
    },
    enforce: "pre",
});
