const cards = [
                { id: 1, image: '../slike/memorije/1.png' },
                { id: 2, image: '../slike/memorije/2.png' },
                { id: 3, image: '../slike/memorije/3.png' },
                { id: 4, image: '../slike/memorije/4.png' },
                { id: 5, image: '../slike/memorije/5.png' },
                { id: 6, image: '../slike/memorije/6.png' },
                { id: 7, image: '../slike/memorije/7.png' },
                { id: 8, image: '../slike/memorije/8.png' },
                { id: 9, image: '../slike/memorije/9.png' }
            ];

            const gameBoard = document.getElementById('game-board');

            const moveCountElement = document.getElementById('move-count');

            const pairsDisplayElement = document.getElementById('found-count');
            const gameMessagesElement = document.getElementById('gameMessages');

            let firstCard = null;
            let secondCard = null;

            let lockBoard = false;

            let moveCount = 0;
            let foundPairs = 0;

            function gameStart () {
                
                gameBoard.innerHTML = '';

                moveCount = 0;
                foundPairs = 0;

                firstCard = null;
                secondCard = null;

                lockBoard = false;

                moveCountElement.textContent = '0';
                pairsDisplayElement.textContent = '0';
                gameMessagesElement.textContent = '';

                let gameCards = [...cards, ...cards];
                gameCards.sort(() => Math.random() - 0.5);

                gameCards.forEach(card => {
                    const cardElement = document.createElement('button');

                    cardElement.classList.add('memory-card');

                    cardElement.dataset.id = card.id;
                    
                    cardElement.innerHTML = `
                        <div class="card-inner">
                            <div class="card-front"></div>
                            <div class="card-back">
                                <img src="${card.image}" alt="Card Image">
                            </div>
                        </div>
                    `;

                    cardElement.addEventListener('click', () => {
                        if (lockBoard) return;
                        if (cardElement === firstCard) return;
                        if (cardElement.classList.contains('matched')) return;

                        cardElement.classList.add('flipped');

                        if (!firstCard) {
                            firstCard = cardElement;
                            return;
                        }

                        secondCard = cardElement;
                        moveCount++;
                        moveCountElement.textContent = moveCount;

                        if (firstCard.dataset.id === secondCard.dataset.id) {
                            foundPairs++;
                            pairsDisplayElement.textContent = foundPairs;

                            firstCard.classList.add('matched');
                            secondCard.classList.add('matched');

                            firstCard = null;
                            secondCard = null;

                            if (foundPairs === cards.length) {
                                gameMessagesElement.textContent = 'Pobednik! Svi parovi su pronadjeni.';
                            }
                        } else {
                            lockBoard = true;
                            setTimeout(() => {
                                firstCard.classList.remove('flipped');
                                secondCard.classList.remove('flipped');

                                firstCard = null;
                                secondCard = null;
                                lockBoard = false;
                            }, 1000);
                        }
                    });


                    gameBoard.appendChild(cardElement);   
                });
            }

            document.getElementById('restart').addEventListener('click', gameStart);

            gameStart();