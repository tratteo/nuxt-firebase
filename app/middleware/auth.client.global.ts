import { useUser } from "~/composables/stores/user";

export default defineNuxtRouteMiddleware((to, from) => {
    const user = useUser();
    if (to.path === "/" && user.isLogged) {
        return navigateTo("/app");
    }
    if (to.path.startsWith("/app") && !user.isLogged) {
        return navigateTo("/");
    }
});
