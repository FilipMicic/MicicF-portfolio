 const homeScreen = document.getElementById('home-screen');
            const categorySelection = document.getElementById('category-selection');
            const gameScreen = document.getElementById('quiz-screen');
            const resultScreen = document.getElementById('result-screen');
            
            
            const categoryModeButton = document.getElementById('category-mode');
            const randomModeButton = document.getElementById('random-mode');
            const marathonModeButton = document.getElementById('marathon-mode');

            const questiontext = document.getElementById('question-text');
            const answerButtons = document.querySelectorAll('.answer-button');

            const timerElement = document.getElementById('timer');
            const questionCounter = document.getElementById('question-counter');
            const scoreElement = document.getElementById('score');
            const progressFill = document.getElementById('progress-fill');

            let currentQuestions = [];
            let currentQuestionIndex = 0;
            let score = 0;
            let timerLeft = 15;
            let timerInterval;
            let selectedCategory = null;
            let answered = false;

           let categories = {};

           async function loadQuestions() {
    
                    const response = await fetch('./pitanja.json');

                    if (!response.ok) {
                        throw new Error('Greška pri učitavanju pitanja.');
                    }

                    categories = await response.json();

                    return true;
          
            }

            const questionPromise = loadQuestions().catch(error => {
                console.error('Greška pri učitavanju pitanja:', error);
                alert('Došlo je do greške pri učitavanju pitanja. Molimo pokušajte ponovo kasnije.');
                return false;
            });

           

            // Promena ekrana

            function showScreen(screen) {
                homeScreen.classList.add('hidden');
                categorySelection.classList.add('hidden');
                gameScreen.classList.add('hidden');
                resultScreen.classList.add('hidden');

                screen.classList.remove('hidden');
            }


            //Izbor igre

            categoryModeButton.addEventListener('click', async () => {
                const loaded = await questionPromise;
                
                if (!loaded) {
                    return;
                }

                showScreen(categorySelection);
            });

            randomModeButton.addEventListener('click', async () => {
                const loaded = await questionPromise;
                
                if (!loaded) {
                    return;
                }

                const allQuestions = Object.values(categories).flatMap(category => category.questions.map
                (question => ({ ...question, category: "NASUMIČNO" }))
            );

                const randomQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 10);

                selectedCategory = "random";
                startGame(randomQuestions);
            });

            marathonModeButton.addEventListener('click', async () => {
                const loaded = await questionPromise;

                if (!loaded) {
                    return;
                }

                const allQuestions = Object.values(categories).flatMap(category => category.questions.map
                (question => ({ ...question, category: "MARATON" }))
            );

                const marathonQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 50);

                selectedCategory = "marathon";
                startGame(marathonQuestions);
            });



            //Izbor kategorije

            document.querySelectorAll('.category-button').forEach(button => {
                button.addEventListener('click', async () => {

                    const loaded = await questionPromise;
                    if (!loaded) {
                        return;
                    }
                    selectedCategory = button.dataset.category;
                    
                    const questions = categories[selectedCategory].questions.map(question => 
                    ({ ...question, category: categories[selectedCategory].name }));

                    startGame(questions);
                });
            });


            //Pocetak igre

            function startGame(questions) {

                clearInterval(timerInterval);

                currentQuestions = [...questions].sort(() => Math.random() - 0.5);
                currentQuestionIndex = 0;
                score = 0;

                scoreElement.textContent = score;

                gameScreen.className = 'quiz-container';

                if(selectedCategory !== "random") {
                    gameScreen.classList.add(selectedCategory);
                }

                showScreen(gameScreen);
                loadQuestion();
            }

            //Ucitavanje pitanja

            function loadQuestion() {

                clearInterval(timerInterval);

                answered = false;
                timerLeft = 15;

                const currentQuestion = currentQuestions[currentQuestionIndex];

                questiontext.textContent = currentQuestion.question;

                questionCounter.textContent = `${currentQuestionIndex + 1}/${currentQuestions.length}`;
                
                timerElement.textContent = timerLeft;
                
                progressFill.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;

                document.getElementById('game-category').textContent = currentQuestion.category;

                answerButtons.forEach((button, index) => {
                    button.textContent = currentQuestion.answers[index];
                    button.disabled=false;
                    button.classList.remove('correct', 'incorrect');
                });

                startTimer();

            }
            
            //Tajmer

            function startTimer() {
                timerInterval = setInterval(() => {
                    timerLeft--;
                    timerElement.textContent = timerLeft;

                    if(timerLeft <= 0) {
                        clearInterval(timerInterval);
                        checkAnswer(-1);
                    }
                }, 1000);
            }

            //Provera odgovora

            answerButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    checkAnswer(index);
                });
            });

            function checkAnswer(selectedIndex) {
                if(answered) return;
                answered = true;

                clearInterval(timerInterval);

                const currentQuestion = currentQuestions[currentQuestionIndex];

                answerButtons.forEach((button, index) => {
                    button.disabled = true;
                    if(index === currentQuestion.correctAnswer) {
                        button.classList.add('correct');
                    } else if(index === selectedIndex && selectedIndex !== currentQuestion.correctAnswer) {
                        button.classList.add('incorrect');
                    }
                });

                if(selectedIndex === currentQuestion.correctAnswer) {
                    score++;
                    scoreElement.textContent = score;
                }

                setTimeout(() => {
                    currentQuestionIndex++;
                    if(currentQuestionIndex < currentQuestions.length) {
                        loadQuestion();
                    } else {
                        showResult();
                    }
                }, 1200);
            }   
            

            //Prikaz rezultata
            function showResult() {

                clearInterval(timerInterval);

                showScreen(resultScreen);

                document.getElementById('final-score').textContent = score;

                const precentage = (score / currentQuestions.length) * 100;

                let title = "Može bolje!";

                if(precentage ===100) {
                  title = "Savršen rezultat!";
                } else if(precentage >= 80) {
                    title = "Odličan rezultat!";
                } else if(precentage >= 50) {
                    title = "Dobar rezultat!";
                } else {
                    title = "Može bolje!";
                }

                document.getElementById('result-title').textContent = title;
                 
            }

            //Ponovno pokretanje kviza

            document.getElementById('play-again').addEventListener('click', () => {
                startGame(currentQuestions);
            });

            //Povratak na pocetni meni
            
            document.getElementById('back-to-quiz').addEventListener('click', () => {
                showScreen(homeScreen);
            });

            document.getElementById('back-to-menu').addEventListener('click', () => {
                clearInterval(timerInterval);
                showScreen(homeScreen);
            });

            document.getElementById('quit-button').addEventListener('click', () => {
                clearInterval(timerInterval);
                showScreen(homeScreen);
            });