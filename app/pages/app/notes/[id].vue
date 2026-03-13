<template>
    <u-container class="my-4">
        <u-empty icon="svg-spinners:180-ring-with-bg" v-if="!data"></u-empty>
        <u-card v-else-if="data" variant="outline">
            <template #header>
                <p class="typ-sublabel">Last edited {{ dayjs(data!.note.editedAt).format("DD MMM, HH:mm") }}</p>
                <copyable-text class="w-full" :content="noteUrl()"></copyable-text>
            </template>
            <div class="flex items-stretch gap-2 flex-col w-full">
                <u-form-field label="Title">
                    <u-input v-model="data!.note.title"></u-input>
                </u-form-field>
                <u-editor
                    :key="data.note.content"
                    ref="editorEl"
                    v-model="data.note.content"
                    v-slot="{ editor }"
                    placeholder="Type anything..."
                    :ui="{ root: '', content: 'py-4 px-2' }"
                    class="w-full bg-elevated/50 rounded-md"
                    content-type="markdown"
                >
                    <u-editor-toolbar
                        :editor="editor"
                        :items="bubbleToolbarItems"
                        layout="bubble"
                        :should-show="
                            ({ editor, view, state }) => {
                                const { selection } = state;
                                return view.hasFocus() && !selection.empty;
                            }
                        "
                    >
                        <template #popover>
                            <fieldset :disabled="generating" class="flex flex-col gap-2 p-4 md:min-w-md">
                                <u-form-field label="What do you want to change?" description="Describe to the AI how you want to paraphrase the note text">
                                    <u-textarea autoresize v-model="instructions" :minlength="10" :maxlength="300"></u-textarea>
                                </u-form-field>
                                <u-button
                                    icon="lucide:sparkles"
                                    :disabled="isNullOrEmpty(instructions) || (instructions?.length || 0) < 10"
                                    :loading="generating"
                                    label="Submit"
                                    variant="subtle"
                                    @click="() => paraphraseNote()"
                                ></u-button>
                            </fieldset>
                        </template>
                    </u-editor-toolbar>
                    <u-editor-drag-handle v-slot="{ ui, onClick }" :editor="editor"> </u-editor-drag-handle>
                    <div class="flex items-center gap-2 justify-between border-b border-muted z-50 bg-default overflow-x-auto flex-wrap">
                        <u-editor-toolbar :editor="editor" :items="fixedToolbarItems" class="inset-x-0 py-2"> </u-editor-toolbar>
                    </div>
                </u-editor>
            </div>
            <template #footer>
                <div class="flex items-center gap-2">
                    <u-button label="Save" color="neutral" @click="() => editNote()"> </u-button>
                    <u-button label="Delete" variant="subtle" color="error" @click="() => deleteNote()"> </u-button>
                </div>
            </template>
        </u-card>
    </u-container>
</template>

<script lang="ts" setup>
import type { EditorToolbarItem, FormSchema, FormSubmitEvent } from "@nuxt/ui";
import dayjs from "dayjs";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useUser } from "~/composables/stores/user";
import type { ParaphraseTextFlowInput, ParaphraseTextFlowOutput } from "~~/functions/src/flows/paraphrase_text";

const route = useRoute();
const user = useUser();
const editor = useTemplateRef("editorEl");
const noteId = route.params.id as string;
const toast = useToast();
const instructions = ref<string>();
const generating = ref(false);
const { $firestore, $functions } = useNuxtApp();
const { data, status, refresh } = useFetch("/api/note", { query: { user: user.userData?.id, note: noteId } });

const fixedToolbarItems = [
    [
        {
            kind: "undo",
            icon: "i-lucide-undo",
            tooltip: { text: "undo" },
        },
        {
            kind: "redo",
            icon: "i-lucide-redo",
            tooltip: { text: "redo" },
        },
    ],
    [
        {
            icon: "i-lucide-heading",
            tooltip: { text: "headings" },
            content: {
                align: "start",
            },
            items: [
                {
                    kind: "heading",
                    level: 1,
                    icon: "i-lucide-heading-1",
                    label: "heading 1",
                },
                {
                    kind: "heading",
                    level: 2,
                    icon: "i-lucide-heading-2",
                    label: "heading 2",
                },
                {
                    kind: "heading",
                    level: 3,
                    icon: "i-lucide-heading-3",
                    label: "heading 3",
                },
                {
                    kind: "heading",
                    level: 4,
                    icon: "i-lucide-heading-4",
                    label: "heading 4",
                },
            ],
        },
        {
            icon: "i-lucide-list",
            tooltip: { text: "lists" },
            content: {
                align: "start",
            },
            items: [
                {
                    kind: "bulletList",
                    icon: "i-lucide-list",
                    label: "bullet list",
                },
                {
                    kind: "orderedList",
                    icon: "i-lucide-list-ordered",
                    label: "ordered list",
                },
            ],
        },
        {
            kind: "blockquote",
            icon: "i-lucide-text-quote",
            tooltip: { text: "blockquote" },
        },
        {
            kind: "codeBlock",
            icon: "i-lucide-square-code",
            tooltip: { text: "codeblock" },
        },
    ],
    [
        {
            kind: "mark",
            mark: "bold",
            icon: "i-lucide-bold",
            tooltip: { text: "bold" },
        },
        {
            kind: "mark",
            mark: "italic",
            icon: "i-lucide-italic",
            tooltip: { text: "italic" },
        },
        {
            kind: "mark",
            mark: "underline",
            icon: "i-lucide-underline",
            tooltip: { text: "underline" },
        },
        {
            kind: "mark",
            mark: "strike",
            icon: "i-lucide-strikethrough",
            tooltip: { text: "strikethrough" },
        },
        {
            kind: "mark",
            mark: "code",
            icon: "i-lucide-code",
            tooltip: { text: "code" },
        },
    ],
    [
        {
            slot: "link" as const,
            icon: "i-lucide-link",
        },
    ],
    [
        {
            icon: "i-lucide-align-justify",
            tooltip: { text: "text align" },
            content: {
                align: "end",
            },
            items: [
                {
                    kind: "textAlign",
                    align: "left",
                    icon: "i-lucide-align-left",
                    label: "left",
                },
                {
                    kind: "textAlign",
                    align: "center",
                    icon: "i-lucide-align-center",
                    label: "center",
                },
                {
                    kind: "textAlign",
                    align: "right",
                    icon: "i-lucide-align-right",
                    label: "right",
                },
                {
                    kind: "textAlign",
                    align: "justify",
                    icon: "i-lucide-align-justify",
                    label: "justify",
                },
            ],
        },
    ],
] satisfies EditorToolbarItem[][];

const bubbleToolbarItems = computed(() => [[{ slot: "popover" as const }]] satisfies EditorToolbarItem[][]);
function noteUrl() {
    return `${window.origin}/notes/${user.userData!.id}/${noteId}`;
}
async function paraphraseNote() {
    if (!instructions.value) return;
    const from = editor.value?.editor?.state.selection.from || 0;
    const to = editor.value?.editor?.state.selection.to || 0;
    const selectedText = editor.value?.editor?.state.doc.textBetween(from, to, " ");
    // console.log("selected text", selectedText);

    generating.value = true;
    try {
        const f = httpsCallable<ParaphraseTextFlowInput, ParaphraseTextFlowOutput>($functions, "paraphraseText");
        const res = await f({ text: selectedText ?? "", instructions: instructions.value });
        const responseText = res.data.text;
        const summary = res.data.summary;
        editor.value?.editor
            ?.chain()
            .focus() // Keeps the editor focused after the change
            .insertContent(responseText)
            .run();
        //const newContent = data.value!.note.content.slice(0, from) + " " + responseText + " " + data.value!.note.content.slice(to);
        //data.value!.note.content = newContent;
        await editNote(false);
        toast.add({ title: "Text edited with AI", description: summary });
    } catch (ex) {
        toast.add({ title: "Error paraphrasing note", color: "error" });
    } finally {
        console.log("expanded");
        generating.value = false;
        instructions.value = undefined;
    }
}
async function deleteNote() {
    const notesDoc = doc($firestore, "users", user.userData!.id, "notes", noteId);
    try {
        await deleteDoc(notesDoc);
        await refresh();
        navigateTo("/app");
    } catch (ex) {
        toast.add({ title: "Error deleting note", color: "warning" });
    }
}

async function editNote(showToast: boolean = true) {
    if (!data.value) return;
    const notesDoc = doc($firestore, "users", user.userData!.id, "notes", noteId);
    data.value.note.editedAt = new Date().getTime();
    try {
        await setDoc(notesDoc, data.value.note, { merge: true });
        await refresh();
        if (showToast) toast.add({ title: "Data saved", color: "success" });
    } catch (ex) {
        if (showToast) toast.add({ title: "Error saving data", color: "warning" });
    }
}

async function onSubmit(e: FormSubmitEvent<FormSchema>) {
    if (await user.patch(e.data)) {
        toast.add({ title: "Data saved", color: "success" });
    } else {
        toast.add({ title: "Error saving data", color: "warning" });
    }
}
</script>

<style></style>
