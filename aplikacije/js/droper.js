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


            const backgroundStars = [];
                
                for(let i = 0; i < 100; i++)
                {
                    backgroundStars.push({
                        x: Math.random() * WIDTH,
                        y: Math.random() * HEIGHT,
                        size: Math.random() * 2 + 0.5,
                        opacity: Math.random() * 0.5 + 0.3,
                        twinkleSpeed: Math.random() * 0.003 + 0.001,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            
            


            function drawBackground() {

                const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);

                gradient.addColorStop(0, '#080f2b');
                gradient.addColorStop(0.5, '#172b55');
                gradient.addColorStop(1, '#263e70');

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, WIDTH, HEIGHT);
                
               

                backgroundStars.forEach(star => {

                    const opacity = star.opacity
                    + Math.sin(Date.now() * star.twinkleSpeed + star.phase) * 0.2;

                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    ctx.fill();

                });

                ctx.fillStyle = 'rgba(100, 140, 210, 0.12)';

                ctx.beginPath();
                ctx.arc(80, HEIGHT +15, 100, Math.PI,0);
                ctx.arc(230, HEIGHT + 5, 130, Math.PI,0);
                ctx.arc(420, HEIGHT + 20, 120, Math.PI,0);
                ctx.arc(680, HEIGHT + 10, 140, Math.PI,0);
                ctx.arc(870, HEIGHT + 20, 120, Math.PI,0);
                ctx.fill();


                ctx.fillStyle = 'rgba(130, 170, 230, 0.16)';

                ctx.beginPath();
                ctx.arc(0, HEIGHT + 35, 100, Math.PI,0);
                ctx.arc(170, HEIGHT + 35, 120, Math.PI,0);
                ctx.arc(370, HEIGHT + 40, 110, Math.PI,0);
                ctx.arc(600, HEIGHT + 35, 140, Math.PI,0);
                ctx.arc(820, HEIGHT + 40, 115, Math.PI,0);
                ctx.arc(950, HEIGHT + 40, 100, Math.PI,0);
                ctx.fill();

            }

            function drawPlayer() {
                ctx.save();
                ctx.translate(player.x, player.y);


                // glow
                const glow = ctx.createRadialGradient(0, -15, 5, 0, -10, 75);

                glow.addColorStop(0, 'rgba(150, 200, 255, 0.4)');
                glow.addColorStop(1, 'rgba(100, 160, 255, 0)');

                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(0, -10, 75, 0, Math.PI * 2);
                ctx.fill();

                //pozadniski oblak

                ctx.beginPath();
                ctx.moveTo(-35, -5);

                ctx.bezierCurveTo(-48, -5, -47, -27, -31, -30);
                ctx.bezierCurveTo(-29, -49, -4, -52, 5, -39);
                ctx.bezierCurveTo(20, -53, 43, -39, 41, -22);
                ctx.bezierCurveTo(57, -15, 49, 3, 34, 4);

                ctx.lineTo(-29, 4);
                ctx.closePath();

                ctx.fillStyle = '#8bb5e8';
                ctx.fill();

                //oblak
                const cloudGradient = ctx.createLinearGradient(0, -48, 0, 5);

                cloudGradient.addColorStop(0, '#ffffff');
                cloudGradient.addColorStop(0.65, '#e8f4ff');
                cloudGradient.addColorStop(1, '#b8d9fa');

                

                ctx.beginPath();
                ctx.moveTo(-35, -9);
                ctx.bezierCurveTo(-49, -10, -46, -30, -31, -33);
                ctx.bezierCurveTo(-29, -51, -5, -54, 5, -41);
                ctx.bezierCurveTo(20, -55, 43, -41, 41, -24);
                ctx.bezierCurveTo(57, -17, 49, 1, 34, 2);
                ctx.lineTo(-29, 2);
                ctx.bezierCurveTo(-39, 2, -43, -3, -35, -9);
                ctx.closePath();

                ctx.fillStyle = cloudGradient;
                ctx.shadowColor = 'rgba(120, 180, 255, 0.5)';
                ctx.shadowBlur = 8;
                ctx.fill();
               
               
                // oči
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#344b70';

                ctx.beginPath();
                ctx.ellipse(-11, -17, 2.5, 4, 0, 0, Math.PI * 2);
                ctx.ellipse(11, -17, 2.5, 4, 0, 0, Math.PI * 2);
                ctx.fill();

                //obraz

                ctx.fillStyle = 'rgba(255, 145, 165, 0.5)';

                ctx.beginPath();

                ctx.ellipse(-21, -8, 6, 3, 0, 0, Math.PI * 2);
                ctx.ellipse(21, -8, 6, 3, 0, 0, Math.PI * 2);

                ctx.fill();
                

                // usta
                ctx.strokeStyle = '#344b70';
                ctx.lineWidth = 2;

                ctx.lineCap = 'round';

                ctx.beginPath();
                ctx.arc(0, -11, 6, 0.2, Math.PI-0.2);
                ctx.stroke();

                ctx.restore();


                

            }

            function createBall()
            {
                balls.push({
                    x: Math.random() * (WIDTH - 30) + 15    ,
                    y: -20,
                    radius: 13,
                    speed: 2.5 + Math.random() * 2,

                    rotation: Math.random() * 2 * Math.PI,
                    rotationSpeed: (Math.random() * 0.04 + 0.02) * (Math.random() < 0.5 ? -1 : 1)
                });
            }

            function drawBalls()
            {
                balls.forEach(ball => {
                    ctx.save();
                    ctx.translate(ball.x, ball.y);

                    //glow

                    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 30);

                    glow.addColorStop(0, 'rgba(255, 220, 120, 0.5)');
                    glow.addColorStop(1, 'rgba(255, 190, 70, 0)');


                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(0, 0, 30, 0, Math.PI * 2);
                    ctx.fill();




                    //oblik



                    ctx.rotate(ball.rotation);

                    ctx.beginPath();


                    for(let i = 0; i < 10; i++)
                    {       
                        const angle = (Math.PI *2 / 10) * i - Math.PI / 2;
                        const radius = i % 2 === 0 ? 15 : 7;

                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        if(i === 0)
                        {
                            ctx.moveTo(x, y);
                        }else
                        {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    
                    
                    const starGradient = ctx.createLinearGradient(0, -15, 0, 15);

                    starGradient.addColorStop(0, '#fff9bd');
                    starGradient.addColorStop(0.5, '#ffdf65');
                    starGradient.addColorStop(1, '#ffad32');


                    ctx.fillStyle = starGradient;
                    ctx.strokeStyle = '#d98224';
                    ctx.lineWidth = 2;
                   
                    ctx.lineJoin = 'round';
                    
                    
                    
                    ctx.shadowColor = '#ffca55';
                    ctx.shadowBlur = 12;


                    ctx.fill();

                    ctx.restore();


                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';

                    ctx.beginPath();
                    ctx.arc(-3, -7, 2.5, 0, Math.PI * 2);
                    ctx.fill();

                   
                });


                             
            }

            function updateBalls()
            {
                for(let i = balls.length - 1; i >= 0; i--)
                {
                    let ball = balls[i];

                    ball.y += ball.speed;
                    ball.rotation += ball.rotationSpeed;

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

                        document.querySelectorAll('.misses-icons i').forEach((cloud, index) => {
                            cloud.style.color = index < misses ? '#ff7777' : '#a9c9f5';
                            cloud.style.fillter = index < misses 
                            ? 'drop-shadow(0 0 6px rgba(255, 90, 90, 0.5))' 
                            : 'drop-shadow(0 0 5px rgba(120, 175, 255, 0.3))';
                        });
                            

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

                document.querySelectorAll('.misses-icons i').forEach((cloud) => {
                    cloud.style.color = '#a9c9f5';
                    cloud.style.filter = 'drop-shadow(0 0 5px rgba(120, 175, 255, 0.3))';
                });

                
                
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

            