import {create} from 'zustand';

type SessionStatus = 'checking' | 'signedIn' | 'signedOut';

type SessionState = {
    status: SessionStatus;
    username: string | null;
    signIn: (username: string) => void;
    signOut: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
    status: 'checking',
    username: null,
    signIn: (username: string) => set({status: 'signedIn', username}),
    signOut: () => set({status: 'signedOut', username: null}),
}));

