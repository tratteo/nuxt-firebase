import admin, { ServiceAccount } from "firebase-admin";
import { cert } from "firebase-admin/app";
import firebaseJson from "~~/firebase.json";
import { FirebaseEmulatorsOptions } from "~~/shared/types";

const runtimeConfig = useRuntimeConfig();
const appConfig = useAppConfig();
const serviceAccount: ServiceAccount = JSON.parse(JSON.stringify(runtimeConfig.firebaseServiceAccount)) as ServiceAccount;

const emulatorsConfig: boolean | FirebaseEmulatorsOptions = appConfig.firebase.emulators;
if (process.env.NODE_ENV !== "production") {
    const authEmulator = emulatorsConfig === true || (emulatorsConfig as any)?.auth === true;
    const firestoreEmulator = emulatorsConfig === true || (emulatorsConfig as any)?.firestore === true;

    if (authEmulator) process.env["FIREBASE_AUTH_EMULATOR_HOST"] = `127.0.0.1:${firebaseJson.emulators.auth.port}`;
    if (firestoreEmulator) process.env["FIRESTORE_EMULATOR_HOST"] = `127.0.0.1:${firebaseJson.emulators.firestore.port}`;
}
console.log(`[Firebase admin app] connected {emulators: ${JSON.stringify(emulatorsConfig)}}`);

const $adminApp = admin.initializeApp({
    credential: cert(serviceAccount),
});

const $firestore = $adminApp.firestore();
$firestore.settings({ ignoreUndefinedProperties: true });

const $auth = $adminApp.auth();

export { $auth, $firestore };
export default $adminApp;
