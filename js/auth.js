
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.parentElement.querySelector('input');

        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            toggle.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

function showMessage(message, type) {
    const authMessage = document.getElementById('authMessage');

    if(!authMessage) return;

    const icon = authMessage.querySelector('i');
    const text = authMessage.querySelector('span');

    text.textContent = message;

    authMessage.className = 'auth-message ' + type;

    if(type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else {
        icon.className = 'fas fa-exclamation-circle';
    }
}


const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        const authMessage = document.getElementById('authMessage');

        if(authMessage) {
            authMessage.querySelector('span').textContent = '';
            authMessage.className = 'auth-message';    
        }

        if (username.length < 3 ) {
            showMessage('Korisničko ime mora imati najmanje 3 karaktera.', 'error');
            return;
        }

        if(username.length > 20) {
            showMessage('Korisničko ime ne sme imati više od 20 karaktera.', 'error');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showMessage('Korisničko ime može sadržati samo slova, brojeve i donje crte.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Unesite ispravnu email adresu.', 'error');
            return;
        }

        if (password.length < 8) {
            showMessage('Lozinka mora imati najmanje 8 karaktera.', 'error');
            return;
        }

        if (!/[0-9]/.test(password)) {
            showMessage('Lozinka mora sadržati bar jednu cifru.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Lozinke se ne poklapaju.', 'error');
            return;
        }


        const button = registerForm.querySelector('.auth-btn');
        button.disabled=true;
        button.textContent='Registracija u toku...';


        

        try
        {

            const {data:existingUser, error:checkError} = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('username', username)
            .maybeSingle();

            if(checkError) {
                throw checkError;
            }

            if(existingUser) {
                showMessage('Korisničko ime je već zauzeto. Molimo izaberite drugo.', 'error');
                return;
            }


            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    },
                    emailRedirectTo: 'http://127.0.0.1:5500/login.html'
                }
            });

            if (error) throw error;



            if(!data.user)
            {
                throw new Error('Registracija nije uspela.');
            }


            if(data.user.identities && data.user.identities.length === 0) {
                showMessage('Ova email adresa je već registrovana.', 'error');
                return;
            }

            showMessage('Registracija uspešna! Proverite svoju email adresu i potvrdite svoj nalog.', 'success');

            registerForm.reset();


        }
        catch (error) {
            console.error('Greska prilikom registracije:', error);

            const errorMessage = error.message.toLowerCase();

            if(
                errorMessage.includes('already registered') ||
                errorMessage.includes('already exists') ||
                errorMessage.includes('user already')
            )
            {
                showMessage('Ova email adresa je već registrovana.', 'error');
            }

            else
            {
                showMessage('Došlo je do greške prilikom registracije. Pokušajte ponovo.' + error.message, 'error');
            }
        }

        finally
        {
            button.disabled=false;
            button.textContent='Registruj se';
        }

        
    });
}


const loginForm = document.getElementById('loginForm');

if(loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const authMessage = document.getElementById('authMessage');

        if(authMessage) {
            authMessage.querySelector('span').textContent = '';
            authMessage.className = 'auth-message';    
        }

        const button = loginForm.querySelector('.auth-btn');
        button.disabled=true;
        button.textContent='Prijavljivanje u toku...';

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            if(!data.user) {
                throw new Error('Prijavljivanje nije uspelo.');
            }

            showMessage('Uspešno ste prijavljeni! Preusmeravanje...', 'success');

            window.location.href = 'index.html';

        } catch (error) {
            console.error('Greska prilikom prijavljivanja:', error);
            
            if(error.message.toLowerCase().includes('email not confirmed')) {
                showMessage('Vaša email adresa nije potvrđena. Proverite svoj inbox i potvrdite svoj nalog.', 'error');
            }
            else if(error.message.toLowerCase().includes('invalid login credentials')) {
                showMessage('Neispravna email adresa ili lozinka.', 'error');
            }

            else {
                showMessage('Došlo je do greške prilikom prijavljivanja. Pokušajte ponovo.' + error.message, 'error');
            }
        }
        finally {
            button.disabled=false;
            button.textContent='Prijavi se';
        }
    });
}
