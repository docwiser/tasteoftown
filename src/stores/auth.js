import { ref } from 'vue';
import { onAuthChange } from '../firebase/auth';
import { getDocument, setDocument } from '../firebase/firestore';

const user = ref(null);
const userProfile = ref(null);
const loading = ref(true);

let unsubscribe = null;

export const useAuthStore = () => {
  const initAuth = () => {
    if (unsubscribe) return;

    unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };

        const { data, error } = await getDocument('users', firebaseUser.uid);
        if (!error && data) {
          userProfile.value = data;
        } else {
          const newProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            phone: '',
            addresses: [],
            role: 'customer'
          };
          await setDocument('users', firebaseUser.uid, newProfile);
          userProfile.value = newProfile;
        }
      } else {
        user.value = null;
        userProfile.value = null;
      }
      loading.value = false;
    });
  };

  const updateUserProfile = async (updates) => {
    if (!user.value) return { error: 'No user logged in' };

    const { error } = await setDocument('users', user.value.uid, updates);
    if (!error) {
      userProfile.value = { ...userProfile.value, ...updates };
    }
    return { error };
  };

  return {
    user,
    userProfile,
    loading,
    initAuth,
    updateUserProfile
  };
};
