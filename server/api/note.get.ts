import { NoteData, UserData } from "~~/shared/types";
import { $firestore } from "../src/firebase_admin";

export default defineEventHandler(async (event) => {
    assertMethod(event, "GET");
    const query = getQuery(event);
    const userId = query.user as string;
    const noteId = query.note as string;
    const userDoc = $firestore.collection("users").doc(userId);
    if (!(await userDoc.get()).exists) {
        throw createError({ statusMessage: "User not found", statusCode: 404 });
    }
    const userData = (await userDoc.get()).data() as UserData;
    const note = await userDoc.collection("notes").doc(noteId).get();
    if (!note.exists) {
        throw createError({ statusMessage: "Note not found", statusCode: 404 });
    }
    return { user: userData, note: note.data() as NoteData };
});
