import { useUser } from "~/composables/stores/user";

export default defineNuxtPlugin({
    setup(nuxtApp) {
        const user = useUser();
        user.subscribe();
    },
    enforce: "post",
});
