const commentSection = document.getElementById('comments');

const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const submitComment = document.getElementById('submitComment');

const loginToComment = document.getElementById('loginToComment');
const commentList = document.getElementById('commentList');
const commentsCount = document.getElementById('commentsCount');
const commentMessage = document.getElementById('commentMessage');

const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

const projectSlug = commentSection.dataset.projectSlug;

let currentUser = null;
let currentProfile = null;
let selectedCommentId = null;


async function checkUser()
{
    const { data: {session}, error} = 
        await supabaseClient.auth.getSession();

    if(error)
    {
        console.error(error);
        return;
    }

    currentUser = session?.user || null;

    commentForm.hidden = !currentUser;
    loginToComment.hidden = !!currentUser;

    if(currentUser)
    {
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('username, role')
            .eq('id', currentUser.id)
            .maybeSingle();

        if(profileError)
        {
            console.error(profileError);
        }

        currentProfile = profile;
    } else
    {
        currentProfile = null;
    }


}




function updateCommentsCount(count)
{
    if (count === 1)
    {
        commentsCount.textContent = '1 komentar';
    }
    else if (count >= 2 && count <= 4)
    {
        commentsCount.textContent = `${count} komentara`;
    }

    else
    {
        commentsCount.textContent = `${count} komentara`;
    }
}


async function loadComments()
{


    const { data: comments, error } = await supabaseClient
        .from('comments')
        .select('id, user_id, content, created_at, profiles(username, role)')
        .eq('project_slug', projectSlug)
        .order('created_at', { ascending: false });

    if(error)
    {
        console.error('Greška prilikom učitavanja komentara:', error);
        commentList.textContent= 'Greška prilikom učitavanja komentara.';
        return;
    }

    commentList.replaceChildren();

    updateCommentsCount(comments.length);

    if(comments.length === 0)
    {   
        const noCommentsMessage = document.createElement('p');
        noCommentsMessage.textContent = 'Nema komentara. Budi prvi koji će ostaviti komentar!';
        noCommentsMessage.className = 'no-comments-message';
        commentList.appendChild(noCommentsMessage);
    }

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';

        const commentTop = document.createElement('div');
        commentTop.className = 'comment-top';

        const avatar = document.createElement('div');
        avatar.className = 'comment-avatar';
        avatar.innerHTML = '<i class="fa-solid fa-user"></i>';

        const userInfo = document.createElement('div');
        userInfo.className = 'comment-user-info';

        const username=document.createElement('span');
        username.className='comment-user';
        username.textContent=comment.profiles?.username || 'Korisnik';


        if(comment.profiles?.role === 'admin')
        {
            const adminBadge = document.createElement('span');
            adminBadge.className = 'comment-admin';
            adminBadge.textContent = 'ADMIN';
            username.appendChild(adminBadge);
        }

        const commentDate = document.createElement('span');
        commentDate.className = 'comment-date';
        commentDate.textContent = new Date(comment.created_at).toLocaleString('sr-RS');

        userInfo.append(username,commentDate);

        commentTop.append(avatar, userInfo);

        const commentContent = document.createElement('p');
        commentContent.className = 'comment-content';   
        commentContent.textContent = comment.content;

        commentElement.appendChild(commentTop);
        commentElement.appendChild(commentContent);


        const isOwner = currentUser && currentUser.id === comment.user_id;

        const isAdmin = currentProfile?.role === 'admin';

        if(isOwner || isAdmin)
        {
            const actions = document.createElement('div');
            actions.className = 'comment-actions';

            const toggle = document.createElement('button');
            toggle.className = 'comment-menu-toggle';
            toggle.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';
            toggle.setAttribute('aria-label', 'Opcije komentara');

            const menu = document.createElement('div');
            menu.className = 'comment-menu';
            menu.hidden = true;

            const editButton = document.createElement('button');
            //editButton.className = 'comment-edit';
            editButton.innerHTML = '<i class="fa-solid fa-pen"></i> Izmeni';
            editButton.disabled = true; // Onemogućeno dok se ne implementira edit funkcija

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-option';
            deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> Obriši';

            toggle.addEventListener('click', () => {
                menu.hidden = !menu.hidden;
            });

            deleteButton.addEventListener('click', async () => {
                menu.hidden = true;
                openDeleteModal(comment.id);
            });



            menu.append(editButton , deleteButton);
            actions.append(toggle, menu);
            commentElement.appendChild(actions);

        }

        commentList.appendChild(commentElement);

    });
        
}

document.addEventListener('click', (event) => {
    if(!event.target.closest('.comment-menu') && !event.target.closest('.comment-menu-toggle')) {
        document.querySelectorAll('.comment-menu').forEach(menu => {
            menu.hidden = true;
        });
    }
});



async function addComment()
{
    const content = commentInput.value.trim();

    if(!content)
    {
        commentMessage.textContent = 'Komentar ne može biti prazan.';
        return;
    }

    if(content.length > 1000)
    {
        commentMessage.textContent = 'Komentar ne može biti duži od 1000 karaktera.';
        return;
    }
    
    submitComment.disabled = true;
    commentMessage.textContent = '';

    const { error } = await supabaseClient
        .from('comments')
        .insert({
            project_slug: projectSlug,
            user_id: currentUser.id,
            content: content
        });

    submitComment.disabled = false;

    if(error)
    {
        console.error(error);
        commentMessage.textContent = 'Greška prilikom dodavanja komentara.';
        return;
    }

    commentInput.value = '';


    await loadComments();

}




submitComment.addEventListener('click', addComment);


async function initComments()
{
    await checkUser();
    await loadComments();
}

initComments();

supabaseClient.auth.onAuthStateChange(async () => {
    await checkUser();
    await loadComments();
});


function openDeleteModal(commentId)
{
    selectedCommentId = commentId;
    deleteModal.hidden = false;
}

function closeDeleteModal()
{
    deleteModal.hidden = true;
    selectedCommentId = null;
    confirmDelete.disabled=false;
    confirmDelete.textContent='Obriši';
}


cancelDelete.addEventListener('click', closeDeleteModal);


deleteModal.addEventListener('click', event => {
    if(event.target === deleteModal)
    {
        closeDeleteModal();
    }
});


confirmDelete.addEventListener('click', async () => {
    if(selectedCommentId === null) return;

    confirmDelete.disabled=true;
    confirmDelete.textContent='Brisanje...';

    const { error } = await supabaseClient
        .from('comments')
        .delete()
        .eq('id', selectedCommentId);

    if(error)
    {
        console.error(error);
        
        confirmDelete.disabled=false;
        confirmDelete.textContent='Pokušajte ponovo';

        return;
    }

    closeDeleteModal();
    await loadComments();
});