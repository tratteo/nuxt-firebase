import { definePerson } from "nuxt-schema-org/schema";
import appMeta from "./app/app.meta";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    fonts: {
        defaults: {
            weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        },
    },
    site: {
        name: appMeta.name,
        url: appMeta.url,
        defaultLocale: "en",
    },
    schemaOrg: {
        identity: definePerson(appMeta.author),
    },
    image: {
        providers: {
            shields: {
                name: "shields",
                provider: "~/providers/shields.ts",
            },
            favicon: {
                name: "favicon",
                provider: "~/providers/favicon.ts",
            },
        },
    },
    content: {
        build: {
            markdown: {
                toc: {
                    depth: 3,
                    searchDepth: 2,
                },
                remarkPlugins: {
                    "remark-reading-time": {},
                },
            },
        },
    },
    appConfig: {
        firebase: {
            emulators: false,
        },
    },
    runtimeConfig: {
        firebaseServiceAccount: process.env.NUXT_FIREBASE_SERVICE_ACCOUNT,
        public: {
            firebaseApiKey: process.env.NUXT_FIREBASE_API_KEY,
            firebaseAuthDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
            firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID,
            firebaseStorageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
            firebaseMessagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
            firebaseAppId: process.env.NUXT_FIREBASE_APP_ID,
        },
    },
    modules: ["@nuxt/ui", "@nuxt/image", "@nuxtjs/mdc", "motion-v/nuxt", "@nuxt/content", "@nuxtjs/seo", "@vueuse/nuxt", "@pinia/nuxt"],
});