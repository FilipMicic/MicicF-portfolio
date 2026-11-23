const lightbox = document.getElementById("lightbox");
            const lbImg = document.getElementById("lightbox-img");
            const closeBtn = document.getElementById("lightbox-close");

            const galleryImages = document.querySelectorAll(".grid-one img, .grid-two img, .grid-tri img");

            galleryImages.forEach((img) => {
                img.addEventListener("click",()=>{
                    lbImg.src = img.src;
                    lightbox.classList.add("active");
                    document.body.style.overflow="hidden";
                });
            }); 


            function closeLightboc()
            {
                lightbox.classList.remove("active");
                document.body.style.overflow="";
            }

            closeBtn.addEventListener("click", closeLightboc);

            lightbox.addEventListener("click", (e) => {
                if(e.target === lightbox)
                {
                    closeLightboc();
                }            
             });

            document.addEventListener("keydown", (e) => {
                if(e.key === "Escape" && lightbox.classList.contains("active") )
                {
                    closeLightboc();
                }
            })