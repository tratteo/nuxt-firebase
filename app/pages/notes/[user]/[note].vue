<template>
    <div class="mt-4">
        <u-empty v-if="status === 'pending'" icon="svg-spinners:180-ring-with-bg" title="Fetching data"></u-empty>
        <u-empty v-else-if="data === undefined" icon="lucide:triangle-alert" title="Note not found" description="The note could not be found, it might have been deleted"></u-empty>
        <u-card v-else class="flex items-stretch gap-2 flex-col w-full" variant="subtle">
            <template #header>
                <div class="flex items-center gap-2 flex-wrap">
                    <p class="typ-sublabel">Last edited {{ dayjs(data.note.editedAt).format("DD MMM, HH:mm") }}</p>
                    <client-only>
                        <u-user :name="data.user.fullName" :avatar="{ src: data.user.photoUrl }" class="ml-auto"></u-user>
                    </client-only>
                </div>
            </template>
            <u-form-field label="Title">
                <u-input v-model="data.note.title" readonly></u-input>
            </u-form-field>
            <u-form-field label="Content">
                <u-textarea autoresize v-model="data.note.content" readonly></u-textarea>
            </u-form-field>
        </u-card>
    </div>
</template>

<script lang="ts" setup>
import dayjs from "dayjs";

const route = useRoute();
const userId = route.params.user as string;
const noteId = route.params.note as string;

const { data, status } = await useFetch("/api/note", { query: { user: userId, note: noteId } });
console.log(data.value);

useSeoMeta({ title: data.value?.note.title ?? "Note not found" });
</script>

<style></style>
