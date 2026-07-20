import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are required');
}

// expo-secure-store is a native module (iOS Keychain / Android Keystore) with no web
// implementation — calling it in the browser throws. Fall back to localStorage there.
const authStorage =
  Platform.OS === 'web'
    ? {
        getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
        setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
        removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
      }
    : {
        getItem: (key) => SecureStore.getItemAsync(key),
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        removeItem: (key) => SecureStore.deleteItemAsync(key),
      };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
