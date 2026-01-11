export interface WithId<T> {
    id: string;
    payload: T;
}

export interface FirebaseEmulatorsOptions {
    auth?: boolean;
    firestore?: boolean;
}

export interface UserData {
    id: string;
    email: string;
    fullName: string;
    photoUrl?: string;
    role?: string;
}

export interface NoteData {
    title: string;
    content: string;
    editedAt: number;
}
