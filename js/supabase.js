



const SUPABASE_URL = 'https://yqzoszwlvaybordaharr.supabase.co'

const SUPABASE_KEY = 'sb_publishable__rrWDQDGenqiazzLUCWA7A_3o9rBq6Z'

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log('Supabase konekcija je uspešno inicijalizovana!');
console.log(supabaseClient);