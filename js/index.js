async function loadRandomQuote() {
            try
            {
                const response = await fetch("citati.json");
                const quotes = await response.json();

                const randomIndex = Math.floor(Math.random()*quotes.length);
                const selectedQuote = quotes[randomIndex];

                document.getElementById("citat-tekst").textContent=  `"${selectedQuote.quote}"`;

                document.getElementById("citat-autor").textContent = "——" + selectedQuote.author;

                document.getElementById("citat-img").src = selectedQuote.image;
            }catch(error)
            {
                console.error("Greska pri ucitavanju:",error);
            }
        }

            loadRandomQuote();