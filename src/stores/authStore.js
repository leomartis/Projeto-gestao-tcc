import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const authIsReady = ref(false);


    const setUser = (payload) => {
        user.value = payload;
    }

    const setAuthIsReady = (status) => {
        authIsReady.value = status;
    }

    const logout = async () => {
        await signOut(auth);
        user.value = null;
    }


    return {
        user,
        authIsReady,
        setUser,
        setAuthIsReady,
        logout
    }
})

export { useAuthStore }