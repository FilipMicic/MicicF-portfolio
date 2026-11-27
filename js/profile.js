const loginLink = document.getElementById('loginLink');
const profileToggle = document.getElementById('profileToggle');
const userDropdown = document.getElementById('userDropdown');
const logoutButton = document.getElementById('logoutButton');
const userMenu = document.getElementById('user-menu');

const profileUsername = document.getElementById('userName');
const profileEmail = document.getElementById('userEmail');

async function updateUserMenu(session) 
{
    if (!session) 
        {
            loginLink.hidden = false;
            profileToggle.hidden = true;
            userDropdown.hidden = true;
            return;
        }

        loginLink.hidden = true;
        profileToggle.hidden = false;


        const { data: profile,error  } = await supabaseClient
            .from('profiles')
            .select('username, role')
            .eq('id', session.user.id)
            .maybeSingle();

        if (error)
        {
            console.error('Greška prilikom učitavanja korisničkog profila:', error);
        }

        profileUsername.textContent = profile?.username || 'Korisnik';
        profileEmail.textContent = session.user.email || '';


        if(adminBadge)
        {
            adminBadge.hidden = profile?.role !== 'admin';
        }
}


async function checkSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error('Greška prilikom provere sesije:', error);
        return;
    }

    await updateUserMenu(data.session);
}

checkSession();

supabaseClient.auth.onAuthStateChange((event, session) => {
    setTimeout(() => {
        updateUserMenu(session);
    },0);
});






profileToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        userDropdown.hidden = !userDropdown.hidden;
    
   
});


document.addEventListener('click', (event) => {
    if(!userMenu.contains(event.target))
    {
        userDropdown.hidden = true;
    }
});


logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;

    const { error } = await supabaseClient.auth.signOut();

    if(error)
    {
        console.error('Greška prilikom odjave:', error);
        alert('Došlo je do greške prilikom odjave. Molimo pokušajte ponovo.');
        logoutButton.disabled = false;
        return;
    }

    window.location.href = '#';
});


console.log({
  loginLink: document.getElementById('loginLink'),
  profileToggle: document.getElementById('profileToggle'),
  userDropdown: document.getElementById('userDropdown'),
  userMenu: document.getElementById('user-menu'),
  supabaseClient: typeof supabaseClient
});

