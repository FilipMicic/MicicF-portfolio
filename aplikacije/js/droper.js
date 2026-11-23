const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');

            const container = document.querySelector('.game-container');
            const overlay = document.getElementById('gameOverlay');
            const startButton = document.getElementById('startButton');

            const scoreElement = document.getElementById('score');
            const missesElement = document.getElementById('misses');

            const WIDTH = canvas.width;
            const HEIGHT = canvas.height;

            let player = {
                x: WIDTH / 2,
                y: HEIGHT - 55,
                width: 70,
                speed: 7
            };

            let balls = [];

            let score = 0;
            let misses = 0;

            let gameRunning = false;
            let keys = {};

            let spawnTimer = 0;
            let animationId;

            function drawBackground() {

                const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT); 

                gradient.addColorStop(0, '#170909');
                gradient.addColorStop(1, '#080808');

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, WIDTH, HEIGHT);

                for(let i=0; i<35; i++){
                    ctx.fillStyle = 'rgba(180, 50, 50, 0.15)';
                    ctx.beginPath();
                    ctx.arc((i*137) % WIDTH, (i*83) % HEIGHT, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            function drawPlayer() {
                const glow = ctx.createRadialGradient
                (player.x, player.y - 10, 5, 
                player.x, player.y - 10, 65);

                glow.addColorStop(0, 'rgba(220, 50, 50, 0.3)');
                glow.addColorStop(1, 'rgba(220, 50, 50, 0)');

                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(player.x, player.y - 10, 65, 0, Math.PI * 2);
                ctx.fill();

                ctx.save();
                ctx.translate(player.x, player.y);
                

                ctx.shadowColor = '#ff3333';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#a52b2b';

                ctx.strokeStyle = '#ff7777';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.roundRect(-35, -8, 70, 15, 8);
                ctx.fill();
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffaaaa';
                ctx.fillRect(-20, -4, 40, 3);

                ctx.restore();

            }

            function createBall()
            {
                balls.push({
                    x: Math.random() * (WIDTH - 30) + 15    ,
                    y: -20,
                    radius: 13,
                    speed: 2.5 + Math.random() * 2
                });
            }

            function drawBalls()
            {
                ctx.fillStyle = '#e45b5b';
                balls.forEach(ball => {
                   const gradient = ctx.createRadialGradient(ball.x - 4 , ball.y - 5, 2, ball.x, ball.y, ball.radius);
                   gradient.addColorStop(0, '#ffaaaa');
                   gradient.addColorStop(0.4, '#d34c4c');
                   gradient.addColorStop(1, '#690d0d');

                   ctx.beginPath();
                   ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                   
                   ctx.fillStyle = gradient;
                   ctx.fill();

                   ctx.strokeStyle = '#ff7777';
                   ctx.lineWidth = 1;
                   ctx.stroke();
                });
            }

            function updateBalls()
            {
                for(let i = balls.length - 1; i >= 0; i--)
                {
                    let ball = balls[i];
                    ball.y += ball.speed;

                    if(ball.y + ball.radius >= player.y -40 &&
                        ball.y - ball.radius <= player.y &&
                        Math.abs(ball.x - player.x) < 45
                    )
                    {
                        balls.splice(i, 1);
                        score++;
                        scoreElement.textContent = score;

                        continue;
                    }

                    if(ball.y - ball.radius > HEIGHT+20)
                    {
                        balls.splice(i, 1);

                        misses++;
                        missesElement.textContent = misses;

                        if(misses >= 3)
                        {
                            endGame();
                            return;
                        }
                    }
                }
            }

            function updatePlayer()
            {
                if(keys['ArrowLeft'] && player.x - player.width / 2 > 0)
                {
                    player.x -= player.speed;
                }
                if(keys['ArrowRight'] && player.x + player.width / 2 < WIDTH)
                {
                    player.x += player.speed;
                }
            }

            function gameLoop()
            {
                if(!gameRunning) return;    

                drawBackground();
                ;
                
                
                updatePlayer();

                spawnTimer++;
                if(spawnTimer > 55)
                {
                    createBall();
                    spawnTimer = 0;
                }

                
                updateBalls();

                drawBalls();
                drawPlayer();

                if(gameRunning)
                {
                    animationId = requestAnimationFrame(gameLoop);
                }
                

            }

            function startGame()
            {
                cancelAnimationFrame(animationId);

                

                score = 0;
                misses = 0;

                balls = [];
                spawnTimer = 0;

                player.x = WIDTH / 2;

                scoreElement.textContent = score;
                missesElement.textContent = misses;
                
                gameRunning = true;
                container.classList.add('started');
                overlay.classList.add('hidden');
                
                

                gameLoop();
            }

            function endGame()
            {
                gameRunning = false;
                

                document.getElementById('overlayTitle').textContent = 'KRAJ IGRE';
                document.getElementById('overlay-description').textContent = `Vaš rezultat: ${score} poena`;

                startButton.textContent = 'POKRENI PONOVO';
                
                container.classList.remove('started');
                overlay.classList.remove('hidden');
            }

            startButton.addEventListener('click', startGame);

            
            document.addEventListener('keydown',function(event)
            {
                if(event.key === 'ArrowLeft' || event.key === 'ArrowRight')
                {
                    event.preventDefault();
                    keys[event.key] = true;
                }

               
            });

            document.addEventListener('keyup',function(event)
            {
                    keys[event.key] = false;

            });

            canvas.addEventListener('pointerdown', function(event) {
                if(!gameRunning) {
                    return;
                }

                event.preventDefault();

                canvas.setPointerCapture(event.pointerId);

                movePlayerwithTouch(event);
            });

            canvas.addEventListener('pointermove', function(event) {
                if(!gameRunning) {
                    return;
                }

                if(event.pointerType === 'mouse' || event.buttons === 1) {
                    event.preventDefault();
                    movePlayerwithTouch(event);
                }

              
            });

            function movePlayerwithTouch(event) {
                const rect = canvas.getBoundingClientRect();
                const touchX = event.clientX - rect.left;

                const gameX = touchX * (WIDTH / rect.width);

                player.x = Math.max(
                    player.width / 2, 
                    Math.min( WIDTH - player.width / 2, gameX)
                    );
            }

            drawBackground();
            drawPlayer();

            