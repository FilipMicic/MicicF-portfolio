const commentSection = document.getElementById('comments');

const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const submitComment = document.getElementById('submitComment');

const loginToComment = document.getElementById('loginToComment');
const commentList = document.getElementById('commentList');
const commentsCount = document.getElementById('commentsCount');
const commentMessage = document.getElementById('commentMessage');

const projectSlug = commentSection.dataset.projectSlug;

let currentUser = null;
let currentProfile = null;


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
        commentList.textContent = 'Nema komentara. Budi prvi koji će ostaviti komentar!';
        return;
    }

    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';

        const commentTop = document.createElement('div');
        commentTop.className = 'comment-top';

        const commentUser = document.createElement('span');
        commentUser.className = 'comment-user';
        commentUser.textContent = comment.profiles?.username || 'Korisnik';

        commentTop.appendChild(commentUser);

        if(comment.profiles?.role === 'admin')
        {
            const adminBadge = document.createElement('span');
            adminBadge.className = 'comment-admin';
            adminBadge.textContent = 'ADMIN';
            commentTop.appendChild(adminBadge);
        }

        const commentDate = document.createElement('span');
        commentDate.className = 'comment-date';
        commentDate.textContent = new Date(comment.created_at).toLocaleString('sr-RS');

        commentTop.appendChild(commentDate);

        const commentContent = document.createElement('p');
        commentContent.className = 'comment-content';
        commentContent.textContent = comment.content;

        commentElement.appendChild(commentTop);
        commentElement.appendChild(commentContent);


        const isOwner = currentUser && currentUser.id === comment.user_id;

        const isAdmin = currentProfile?.role === 'admin';

        if(isOwner || isAdmin)
        {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'comment-delete';
            deleteButton.textContent = 'Obriši';

            deleteButton.addEventListener('click', () => {
                deleteComment(comment.id);
            });

            commentElement.appendChild(deleteButton);
        }

        commentList.appendChild(commentElement);

    });
        
}



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
    commentMessage.textContent = 'Komentar je uspešno dodat.';

    await loadComments();

}


async function deleteComment(commentId)
{
    const confirmed = confirm('Da li ste sigurni da želite da obrišete ovaj komentar?');

    if(!confirmed)
    {
        return;
    }

    const { error } = await supabaseClient
        .from('comments')
        .delete()
        .eq('id', commentId);

    if(error)
    {
        console.error(error);
        commentMessage.textContent = 'Greška prilikom brisanja komentara.';
        return;
    }   

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