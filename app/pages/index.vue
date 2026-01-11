<template>
    <div class="flex flex-col items-center mt-4">
        <u-page-card class="w-full max-w-md" variant="soft">
            <div class="flex justify-center w-full">
                <u-tabs
                    :items="[
                        { label: 'Login', value: 'login' },
                        { label: 'Register', value: 'register' },
                    ]"
                    class="w-fit"
                    default-value="register"
                    @update:model-value="
                        (val) => {
                            registering = val === 'register';
                            error = undefined;
                        }
                    "
                ></u-tabs>
            </div>
            <u-auth-form
                v-if="!registering"
                :schema="loginSchema"
                title="Login"
                loading-auto
                :validate-on="['change']"
                :providers="providers"
                :fields="signinFields"
                :submit="{ label: 'Login' }"
                @submit="onSignInSubmit"
            >
                <template #validation>
                    <u-alert v-if="error" color="error" icon="i-lucide-info" title="Error accessing account" :description="error" />
                </template>
            </u-auth-form>
            <u-auth-form
                v-else
                :schema="registerSchema"
                title="Register"
                loading-auto
                :providers="providers"
                :validate-on="['change']"
                :fields="registerFields"
                @submit="onRegisterSubmit"
                :submit="{ label: 'Create account' }"
            >
                <template #validation>
                    <u-alert v-if="error" color="error" icon="i-lucide-info" title="Error creating account" :description="error" />
                </template>
            </u-auth-form>
        </u-page-card>
    </div>
</template>

<script lang="ts" setup>
import type { AuthFormField, ButtonProps, FormSubmitEvent } from "@nuxt/ui";
import { FirebaseError } from "firebase/app";
import { getAdditionalUserInfo, GoogleAuthProvider } from "firebase/auth";
import { z } from "zod";
import { useUser } from "~/composables/stores/user";

const userStore = useUser();
const registering = ref(true);
const error = ref();
const providers: ButtonProps[] = [
    {
        label: "Enter with Google",
        variant: "subtle",
        color: "neutral",
        icon: "logos:google-icon",
        onClick: onGoogleSignin,
    },
];
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
    remember: z.boolean(),
});
const registerSchema = z.object({
    name: z.string(),
    email: z.email(),
    password: z.string().min(8),
    remember: z.boolean(),
});
type LoginSchema = z.output<typeof loginSchema>;
type RegisterSchema = z.output<typeof registerSchema>;

const signinFields: AuthFormField[] = [
    {
        name: "email",
        type: "email",
        label: "Email",
        placeholder: "johndoe@gmail.com",
        required: true,
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
    },
    {
        name: "remember",
        label: "Remember me",
        type: "checkbox",
        defaultValue: true,
    },
];
const registerFields: AuthFormField[] = [
    {
        name: "name",
        type: "text",
        label: "Full name",
        placeholder: "John Doe",
        required: true,
    },
    {
        name: "email",
        type: "email",
        label: "Email",
        placeholder: "johndoe@gmail.com",
        required: true,
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
    },
    {
        name: "remember",
        label: "Remember me",
        type: "checkbox",
        defaultValue: true,
    },
];

watch(
    () => userStore.isLogged,
    () => {
        if (userStore.isLogged) navigateTo("/app");
    },
    { immediate: true }
);

async function onSignInSubmit(payload: FormSubmitEvent<LoginSchema>) {
    error.value = undefined;
    try {
        await userStore.login({ email: payload.data.email, password: payload.data.password, remember: payload.data.remember });
    } catch (ex) {
        error.value = authErrorToReadable(ex);
    }
}

async function onRegisterSubmit(payload: FormSubmitEvent<RegisterSchema>) {
    error.value = undefined;
    try {
        await userStore.register({
            email: payload.data.email,
            password: payload.data.password,
            remember: payload.data.remember,
            data: { fullName: payload.data.name },
        });
    } catch (ex) {
        error.value = authErrorToReadable(ex);
    }
}

async function onGoogleSignin() {
    try {
        const provider = new GoogleAuthProvider();
        provider.addScope("email");
        provider.addScope("profile");
        await userStore.authenticateWithProvider({
            provider: provider,
            userDataDelegate: (credentials) => {
                const info = getAdditionalUserInfo(credentials);
                return <UserData>{
                    fullName: credentials.user.displayName,
                    email: credentials.user.email,
                    id: credentials.user.uid,
                    photoUrl: credentials.user.photoURL,
                };
            },
        });
    } catch (ex) {
        error.value = authErrorToReadable(ex);
    }
}

function authErrorToReadable(error: any) {
    if (error instanceof FirebaseError) {
        switch (error.code) {
            case "auth/invalid-credential":
                return "Invalid credentials provided";
            case "auth/invalid-email":
                return "The provided email is not valid";
            case "auth/user-disabled":
                return "User has been disabled";
            case "auth/user-not-found":
                return "Account not found";
            case "auth/wrong-password":
                return "The provided password is wrong";
            case "auth/email-already-in-use":
                return "The email is already in use";
        }
    }
    return "Generic authentication error";
}
</script>

<style></style>
