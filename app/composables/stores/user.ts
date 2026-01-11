import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    inMemoryPersistence,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    type AuthProvider,
    type Unsubscribe,
    type UserCredential,
} from "firebase/auth";
import { doc, DocumentSnapshot, onSnapshot, setDoc, type DocumentData } from "firebase/firestore";
import { defineStore } from "pinia";
import type { UserData } from "~~/shared/types";

export const useUser = defineStore("user-store", () => {
    const { $auth, $firestore } = useNuxtApp();

    const userData = ref<UserData>();
    const isLogged = ref(false);

    var userDataSnapshotUnsub: Unsubscribe | undefined = undefined;

    const subscribe = () => {
        $auth.onAuthStateChanged(async (user) => {
            if (user) {
                userDataSnapshotUnsub = onSnapshot(doc($firestore, "users", user.uid), onUserDataSnapshot);
                isLogged.value = true;
            } else {
                console.log("out");
                isLogged.value = false;
                userData.value = undefined;
            }
        });
    };

    const register = async ({ email, password, data, remember = true }: { email: string; password: string; data: { fullName: string }; remember: boolean }) => {
        await rememberAuth(remember);
        const res = await createUserWithEmailAndPassword($auth, email, password);
        await patch({ email: email, fullName: data.fullName, id: res.user.uid });
        await updateProfile(res.user, { displayName: data.fullName });
    };

    const login = async ({ email, password, remember = true }: { email: string; password: string; remember: boolean }) => {
        await rememberAuth(remember);
        await signInWithEmailAndPassword($auth, email, password);
    };

    const authenticateWithProvider = async ({
        provider,
        remember = true,
        userDataDelegate,
    }: {
        provider: AuthProvider;
        remember?: boolean;
        userDataDelegate: (credential: UserCredential) => Partial<UserData>;
    }): Promise<void> => {
        await rememberAuth(remember);
        const res = await signInWithPopup($auth, provider);
        const userData = userDataDelegate(res);
        await patch(userData);
        await updateProfile(res.user, { displayName: userData.fullName, photoURL: userData.photoUrl });
    };

    const logout = async () => {
        userDataSnapshotUnsub?.();
        await $auth.signOut();
    };

    const patch = async (data: Partial<UserData>): Promise<boolean> => {
        if (!$auth.currentUser) return false;
        try {
            const document = doc($firestore, "users", $auth.currentUser.uid);
            await setDoc(document, data, { merge: true });
            console.log("user data patched");
        } catch (ex) {
            console.warn("error patching user data");
            return false;
        }
        return true;
    };

    async function onUserDataSnapshot(snapshot: DocumentSnapshot<DocumentData, DocumentData>) {
        const data = snapshot.data();
        if (!data) return;
        console.log("new user data snapshot", data);
        userData.value = data as UserData;
    }

    async function rememberAuth(remember: boolean) {
        if (remember) {
            await setPersistence($auth, browserLocalPersistence);
        } else {
            await setPersistence($auth, inMemoryPersistence);
        }
    }

    return { userData, isLogged, patch, logout, login, register, authenticateWithProvider, subscribe };
});
