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
            <u-page-card v-for="n in notes" variant="soft" :title="n.payload.title" :to="`/app/notes/${n.id}`" :ui="{ header: 'w-full' }"> </u-page-card>
        </div>

        <modal ref="noteModalEl" title="Add a new note" @open="() => (newNodeData = <NoteData>{ content: '' })">
            <template #body>
                <div class="flex items-stretch gap-2 flex-col w-full">
                    <u-form-field label="Title">
                        <u-input v-model="newNodeData.title"></u-input>
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
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
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

async function addNote() {
    newNodeData.value.editedAt = new Date().getTime();
    const notesColl = collection($firestore, "users", user.userData!.id, "notes");
    await setDoc(doc(notesColl), newNodeData.value);
    await refresh();
    noteModalEl.value?.close();
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
