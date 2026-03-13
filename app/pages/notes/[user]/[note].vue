<template>
    <div class="mt-4">
        <u-empty v-if="status === 'pending'" icon="svg-spinners:180-ring-with-bg" title="Fetching data"></u-empty>
        <u-empty v-else-if="data === undefined" icon="lucide:triangle-alert" title="Note not found" description="The note could not be found, it might have been deleted"></u-empty>
        <div class="flex flex-col gap-4" v-else>
            <u-page-header :title="data.note.title">
                <template #description>
                    <div class="flex items-center gap-2 flex-wrap">
                        <p class="typ-sublabel">Last edited {{ dayjs(data.note.editedAt).format("DD MMM, HH:mm") }}</p>
                        <client-only>
                            <u-user :name="data.user.fullName" :avatar="{ src: data.user.photoUrl }" class="ml-auto"></u-user>
                        </client-only>
                    </div>
                </template>
            </u-page-header>
            <content-renderer v-if="parsedContent" id="content" :value="parsedContent"></content-renderer>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { MDCParserResult } from "@nuxtjs/mdc";
import dayjs from "dayjs";

const route = useRoute();
const userId = route.params.user as string;
const noteId = route.params.note as string;

const parsedContent = ref<MDCParserResult>();
const { data, status } = await useFetch("/api/note", { query: { user: userId, note: noteId } });

watch(
    data,
    async () => {
        if (data.value) {
            parsedContent.value = await parseMarkdown(data.value.note.content);
        }
    },
    { immediate: true },
);

useSeoMeta({ title: data.value?.note.title ?? "Note not found" });
</script>

<style></style>
