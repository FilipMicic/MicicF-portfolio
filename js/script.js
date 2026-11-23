const progresBar = document.getElementById("scroll-progress");

if(progresBar)
{
    window.addEventListener("scroll", () => {
        const scrollTop= window.scrollY;

        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;

        const scrollableHeight = documentHeight - windowHeight;

        const scrollPrecent = scrollableHeight > 0 ? (scrollTop/scrollableHeight) * 100 : 0;

        progresBar.style.width = scrollPrecent + "%"
    });
}