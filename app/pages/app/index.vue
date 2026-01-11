<template>
    <div class="flex flex-col gap-4">
        <u-card class="my-4" variant="subtle">
            <template #header>
                <div class="flex items-center gap-2 flex-wrap">
                    <p class="typ-subtitle">Hello 👋</p>
                    <u-user :name="user.userData?.fullName" :avatar="{ src: user.userData?.photoUrl }" class="ml-auto"></u-user>
                </div>
            </template>
            <u-form v-if="user.userData" :schema="formSchema" :state="user.userData" @submit="onSubmit" class="flex flex-col gap-4">
                <u-form-field label="Full name" required name="fullName">
                    <u-input v-model="user.userData.fullName"></u-input>
                </u-form-field>
                <u-form-field label="Role" name="role">
                    <u-select
                        :items="[
                            { value: 'developer', label: 'Developer', icon: 'lucide:code' },
                            { value: 'management', label: 'Management', icon: 'lucide:line-chart' },
                            { value: 'marketing', label: 'Marketing', icon: 'lucide:megaphone' },
                        ]"
                        v-model="user.userData.role"
                    ></u-select>
                </u-form-field>
                <u-button type="submit" label="Save" variant="subtle" class="w-fit ml-auto"></u-button>
            </u-form>

            <template #footer>
                <u-button label="Logout" icon="lucide:log-out" @click="logout" color="neutral" variant="soft"></u-button>
            </template>
        </u-card>
        <div class="flex items-center gap-2 flex-wrap">
            <p class="typ-subtitle">Notes</p>
            <div class="flex items-center gap-2 ml-auto">
                <u-button label="Add" icon="lucide:plus" @click="() => noteModalEl?.open()"></u-button>
                <u-button icon="lucide:refresh-ccw" @click="() => refresh()" color="neutral" variant="subtle"></u-button>
            </div>
        </div>

        <u-empty v-if="status === 'error'" title="Error fetching notes" icon="lucide:book-alert" variant="naked"></u-empty>
        <u-empty v-else-if="!(notes?.length || 0)" title="No notes found" variant="naked"></u-empty>
        <div v-else class="flex flex-col gap-2">
            <u-card v-for="n in notes" variant="soft">
                <template #header>
                    <p class="typ-sublabel">Last edited {{ dayjs(n.payload.editedAt).format("DD MMM, HH:mm") }}</p>
                    <copyable-text class="w-full" :content="noteUrl(n.id)"></copyable-text>
                </template>
                <div class="flex items-stretch gap-2 flex-col w-full">
                    <u-form-field label="Title">
                        <u-input v-model="n.payload.title"></u-input>
                    </u-form-field>
                    <u-form-field label="Content">
                        <u-textarea autoresize v-model="n.payload.content"></u-textarea>
                    </u-form-field>
                </div>
                <template #footer>
                    <div class="flex items-center gap-2">
                        <u-button label="Save" @click="() => editNote(n.id, n.payload)"> </u-button>
                        <u-button label="Delete" variant="soft" color="error" @click="() => deleteNote(n.id)"> </u-button>
                    </div>
                </template>
            </u-card>
        </div>
        <modal ref="noteModalEl" title="Add a new note" @open="() => (newNodeData = <NoteData>{})">
            <template #body>
                <div class="flex items-stretch gap-2 flex-col w-full">
                    <u-form-field label="Title">
                        <u-input v-model="newNodeData.title"></u-input>
                    </u-form-field>
                    <u-form-field label="Content">
                        <u-textarea autoresize v-model="newNodeData.content"></u-textarea>
                    </u-form-field>
                </div>
            </template>
            <template #footer>
                <u-button label="Add" icon="lucide:plus" @click="addNote"></u-button>
            </template>
        </modal>
    </div>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from "@nuxt/ui";
import dayjs from "dayjs";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import z from "zod";
import { useUser } from "~/composables/stores/user";

const formSchema = z.object({ fullName: z.string().nonempty(), role: z.string().optional() });
type FormSchema = z.infer<typeof formSchema>;

const { $firestore } = useNuxtApp();
const newNodeData = ref<NoteData>(<NoteData>{});
const noteModalEl = useTemplateRef("noteModalEl");
const toast = useToast();
const user = useUser();
const {
    data: notes,
    status,
    refresh,
} = useAsyncData(`${user.userData!.id}-notes`, async () => {
    const notes = await getDocs(collection($firestore, "users", user.userData!.id, "notes"));
    return notes.docs.map((d) => <WithId<NoteData>>{ id: d.id, payload: d.data() as NoteData });
});

function noteUrl(id: string) {
    return `${window.origin}/notes/${user.userData!.id}/${id}`;
}

async function addNote() {
    newNodeData.value.editedAt = new Date().getTime();
    const notesColl = collection($firestore, "users", user.userData!.id, "notes");
    await setDoc(doc(notesColl), newNodeData.value);
    await refresh();
    noteModalEl.value?.close();
}

async function deleteNote(id: string) {
    const notesDoc = doc($firestore, "users", user.userData!.id, "notes", id);
    try {
        await deleteDoc(notesDoc);
        await refresh();
        toast.add({ title: "Note deleted", color: "success" });
    } catch (ex) {
        toast.add({ title: "Error deleting note", color: "warning" });
    }
}

async function editNote(id: string, data: NoteData) {
    const notesDoc = doc($firestore, "users", user.userData!.id, "notes", id);
    data.editedAt = new Date().getTime();
    try {
        await setDoc(notesDoc, data, { merge: true });
        await refresh();
        toast.add({ title: "Data saved", color: "success" });
    } catch (ex) {
        toast.add({ title: "Error saving data", color: "warning" });
    }
}

async function onSubmit(e: FormSubmitEvent<FormSchema>) {
    if (await user.patch(e.data)) {
        toast.add({ title: "Data saved", color: "success" });
    } else {
        toast.add({ title: "Error saving data", color: "warning" });
    }
}

async function logout() {
    await user.logout();
    navigateTo("/");
}
</script>

<style></style>
