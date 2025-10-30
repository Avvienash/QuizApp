import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createUser = async (uid, name) => {
  console.log('Creating user with UID:', uid, 'and name:', name);
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ uid, name }])
    .select();
  
  return { data, error };
};

export const checkUserExists = async (uid) => {
  console.log('Checking existence for UID:', uid);
  const { data, error } = await supabase
    .from('profiles')
    .select('uid')
    .eq('uid', uid)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // No rows returned
    return { exists: false, error: null };
  }
  console.log('User existence check result:', data);
  return { exists: !!data, error };
};


export const getUserData = async (uid, fieldName = '*') => {
  const { data, error } = await supabase
    .from('profiles')
    .select(fieldName)
    .eq('uid', uid)
    .single();
  
  return { data, error };
};

export const editUserData = async (uid, fieldName, value) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ [fieldName]: value })
    .eq('uid', uid)
    .select();
  
  return { data, error };
};