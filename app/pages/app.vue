<template>
    <client-only>
        <u-empty v-if="!user.userData" icon="svg-spinners:180-ring-with-bg"> </u-empty>
        <nuxt-page v-else></nuxt-page>
    </client-only>
</template>

<script lang="ts" setup>
import { useUser } from "~/composables/stores/user";

const user = useUser();
</script>

<style></style>
