document.addEventListener("DOMContentLoaded", () => {
    let touchModeEnabled = false;
    function enableTouchMode() {
        if (touchModeEnabled) return;
        touchModeEnabled = true;
        document.body.classList.add('touch-mode');
        const cc = document.getElementById('custom-cursor');
        if (cc) cc.style.display = 'none';
        document.querySelectorAll('.cursor-trail').forEach(el => el.remove());
    }
    window.addEventListener('touchstart', enableTouchMode, { passive: true, once: true });
    // ==========================
    // Video Player & Header Phrase Changer
    // ==========================
    const video = document.getElementById("introVideo");
    const home = document.getElementById("home");
    const animatedText = document.getElementById("animated-text");
    const phrases = ["hello world"];
    let currentIndex = 0;
    let switchInterval;

    if (animatedText) {
        const playVideo = !sessionStorage.getItem("videoPlayed");

        if (!video || !playVideo) {
            if (video) video.remove();
            switchInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % phrases.length;
                animatedText.textContent = phrases[currentIndex];
            }, 5000);
        } else if (home) {
            document.body.style.overflow = "hidden";

            video.addEventListener("ended", () => {
                document.body.style.overflow = "auto";
                home.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                    video.remove();
                    window.scrollTo(0, home.offsetTop);
                }, 1200);

                switchInterval = setInterval(() => {
                    currentIndex = (currentIndex + 1) % phrases.length;
                    animatedText.textContent = phrases[currentIndex];
                }, 5000);

                sessionStorage.setItem("videoPlayed", "true");
            });
        }
    }

    // ==========================
    // Custom Cursor
    // ==========================
    const customCursor = document.getElementById("custom-cursor");
    if (customCursor) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        const baseSpeed = 0.22;
        let cursorSpeed = baseSpeed;
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            enableTouchMode();
            return;
        }

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        // Trail elements
        const trailCount = 48;
        const trailElements = [];
        for (let i = 0; i < trailCount; i++) {
            const dot = document.createElement("div");
            dot.className = "cursor-trail";
            document.body.appendChild(dot);
            trailElements.push({ el: dot, x: mouseX, y: mouseY });
        }

        // Hide cursor on inputs/textareas/selects
        const hideTargets = document.querySelectorAll('input, textarea, select');
        hideTargets.forEach(el => {
            el.addEventListener('mouseenter', () => { customCursor.style.display = 'none'; });
            el.addEventListener('mouseleave', () => { customCursor.style.display = 'block'; });
        });

        // Caret hover targets (text elements)
        const caretTargets = document.querySelectorAll('h1, h2, h3, h4, p, li');
        caretTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                customCursor.classList.add('caret');
                customCursor._targetElement = el;
            });
            el.addEventListener('mouseleave', () => {
                customCursor.classList.remove('caret');
                customCursor._targetElement = null;
            });
        });

        // Button/interactive hover targets
        const buttonTargets = document.querySelectorAll(
            'button, .header-right a, .header-left'
        );
        buttonTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                customCursor.classList.add('button-hover');
                customCursor.classList.remove('caret');
                customCursor.classList.remove('image-hover');
                customCursor._targetElement = el;
                customCursor._hoverW = customCursor.offsetWidth;
                customCursor._hoverH = customCursor.offsetHeight;
            });
            el.addEventListener('mouseleave', () => {
                customCursor.classList.remove('button-hover');
                customCursor._targetElement = null;
                customCursor.style.opacity = "1";
                customCursor._hoverW = undefined;
                customCursor._hoverH = undefined;
            });
        });

        // Image/video hover targets (magnifying glass)
        const mediaTargets = document.querySelectorAll('img, video');
        mediaTargets.forEach(media => {
            media.addEventListener('mouseenter', () => {
                if (customCursor.classList.contains('button-hover') || customCursor.classList.contains('caret')) return;
                customCursor.classList.add('image-hover');
                customCursor.classList.remove('target-hover');
            });
            media.addEventListener('mouseleave', () => {
                customCursor.classList.remove('image-hover');
            });
        });

        // Game hover targets (no lag + target cursor on Tap the Dot)
        const tapCanvas = document.getElementById('tap-canvas');
        if (tapCanvas) {
            tapCanvas.addEventListener('mouseenter', () => {
                cursorSpeed = 1;
                customCursor.classList.add('target-hover');
                customCursor.classList.remove('image-hover');
            });
            tapCanvas.addEventListener('mouseleave', () => {
                cursorSpeed = baseSpeed;
                customCursor.classList.remove('target-hover');
            });
        }

        const snakeCanvas = document.getElementById('snake-canvas');
        if (snakeCanvas) {
            snakeCanvas.addEventListener('mouseenter', () => { cursorSpeed = 1; });
            snakeCanvas.addEventListener('mouseleave', () => { cursorSpeed = baseSpeed; });
        }

        function animateCursor() {
            cursorX += (mouseX - cursorX) * cursorSpeed;
            cursorY += (mouseY - cursorY) * cursorSpeed;

            const hoveredEl = document.elementFromPoint(mouseX, mouseY);
            const isOverProjectItem = !!(hoveredEl && hoveredEl.closest && hoveredEl.closest('.project-item'));
            customCursor.style.opacity = isOverProjectItem ? "0" : "1";

            customCursor.style.transform = `translate3d(${cursorX - customCursor.offsetWidth / 2}px, ${cursorY - customCursor.offsetHeight / 2}px, 0)`;

            const dx = mouseX - (customCursor._lastX || mouseX);
            const dy = mouseY - (customCursor._lastY || mouseY);
            const speedMag = Math.min(Math.sqrt(dx*dx + dy*dy), 250);
            const angle = Math.atan2(dy, dx);

            // Normal cursor trail
            if (!customCursor.classList.contains('caret') && !customCursor.classList.contains('button-hover')) {
                if (customCursor.classList.contains('target-hover')) {
                    customCursor.style.width = "14px";
                    customCursor.style.height = "14px";
                    customCursor.style.backgroundColor = "transparent";
                    customCursor.style.boxShadow = "0 0 10px rgba(30, 144, 255, 0.8)";
                    customCursor.style.borderRadius = "50%";
                    customCursor._lastX = cursorX;
                    customCursor._lastY = cursorY;
                    requestAnimationFrame(animateCursor);
                    return;
                }
                trailElements.forEach((trail, index) => {
                    const prev = index === 0 ? { x: cursorX, y: cursorY } : trailElements[index - 1];
                    trail.x += (prev.x - trail.x) * 0.09;
                    trail.y += (prev.y - trail.y) * 0.09;
                    const taper = 1 - index / trailCount;
                    const length = 15 * taper + speedMag * 0.6 * taper;
                    const width = 6 * taper;
                    trail.el.style.width = `${width}px`;
                    trail.el.style.height = `${length}px`;
                    trail.el.style.transform = `translate(${trail.x - width/2}px, ${trail.y - length/2}px) rotate(${angle}rad)`;
                    trail.el.style.opacity = `${0.4 * taper}`;
                    trail.el.style.borderRadius = `${width/2}px`;
                });

                const moving = Math.abs(cursorX - (customCursor._lastX || 0)) > 0.1 || Math.abs(cursorY - (customCursor._lastY || 0)) > 0.1;
                if (moving) {
                    customCursor.style.width = "18px";
                    customCursor.style.height = "18px";
                    customCursor.style.backgroundColor = "rgba(30, 144, 255, 0.85)";
                    customCursor.style.boxShadow = "0 0 25px rgba(30, 144, 255, 1)";
                    customCursor.style.borderRadius = "50%";
                } else {
                    customCursor.style.width = "50px";
                    customCursor.style.height = "50px";
                    customCursor.style.backgroundColor = "rgba(30, 144, 255, 0.2)";
                    customCursor.style.boxShadow = "none";
                    customCursor.style.borderRadius = "50%";
                }
            }

            // Caret for text
            if (customCursor.classList.contains('caret') && customCursor._targetElement) {
                const fontSize = parseFloat(window.getComputedStyle(customCursor._targetElement).fontSize);
                customCursor.style.width = "2px";
                customCursor.style.height = `${fontSize}px`;
                customCursor.style.backgroundColor = "rgba(30, 144, 255, 0.9)";
                customCursor.style.borderRadius = "1px";
                customCursor.style.boxShadow = "0 0 10px rgba(30, 144, 255, 1)";
            }

            // Button hover square
            if (customCursor.classList.contains('button-hover')) {
                const target = customCursor._targetElement;
                if (target) {
                    const rect = target.getBoundingClientRect();
                    const pad = 6;
                    const targetW = rect.width + pad * 2;
                    const targetH = rect.height + pad * 2;
                    const targetX = rect.left + rect.width / 2;
                    const targetY = rect.top + rect.height / 2;

                    if (customCursor._hoverW === undefined || customCursor._hoverH === undefined) {
                        customCursor._hoverW = customCursor.offsetWidth;
                        customCursor._hoverH = customCursor.offsetHeight;
                        customCursor._hoverX = cursorX;
                        customCursor._hoverY = cursorY;
                    }

                    customCursor._hoverW += (targetW - customCursor._hoverW) * cursorSpeed;
                    customCursor._hoverH += (targetH - customCursor._hoverH) * cursorSpeed;
                    customCursor._hoverX += (targetX - customCursor._hoverX) * cursorSpeed;
                    customCursor._hoverY += (targetY - customCursor._hoverY) * cursorSpeed;

                    customCursor.style.width = `${customCursor._hoverW}px`;
                    customCursor.style.height = `${customCursor._hoverH}px`;
                    customCursor.style.transform = `translate3d(${customCursor._hoverX - customCursor._hoverW / 2}px, ${customCursor._hoverY - customCursor._hoverH / 2}px, 0)`;
                    customCursor.style.borderRadius = "6px";
                    customCursor.style.backgroundColor = "rgba(30, 144, 255, 0.15)";
                    customCursor.style.boxShadow = "0 0 10px rgba(30, 144, 255, 0.6)";
                }
            }

            customCursor._lastX = cursorX;
            customCursor._lastY = cursorY;

            requestAnimationFrame(animateCursor);
        }

        animateCursor();
    }

    // ==========================
    // Project Image Parallax Effect
    // ==========================
    document.querySelectorAll('.project-item').forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;

        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const offsetX = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
            const offsetY = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
            img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.07)`;
        });

        item.addEventListener('mouseleave', () => {
            img.style.transform = `translate(0, 0) scale(1)`;
        });
    });

    // ==========================
    // Auto-Slide Carousel
    // ==========================
    const carouselContainer = document.querySelector(".carousel-container");
    const prevBtn = document.querySelector(".carousel-prev");
    const nextBtn = document.querySelector(".carousel-next");
    let carouselIndex = 0;

    if (carouselContainer && prevBtn && nextBtn) {
        function updateCarousel() {
            const width = carouselContainer.clientWidth;
            carouselContainer.style.transform = `translateX(-${carouselIndex * width}px)`;
        }

        nextBtn.addEventListener("click", () => {
            if (carouselIndex < carouselContainer.children.length - 1) carouselIndex++;
            else carouselIndex = 0;
            updateCarousel();
        });

        prevBtn.addEventListener("click", () => {
            if (carouselIndex > 0) carouselIndex--;
            else carouselIndex = carouselContainer.children.length - 1;
            updateCarousel();
        });

        setInterval(() => {
            nextBtn.click();
        }, 5000);
    }

    // ==========================
    // Scrollable Carousels (Drag & Live Scroll)
    // ==========================
    const carousels = document.querySelectorAll('.scroll-carousel');

    carousels.forEach(carousel => {
        // === Live Auto Scroll on Hover with Bounce ===
        let isHovering = false;
        let direction = 1; // 1 = forward, -1 = backward
        let rafId = null;
        let lastTs = 0;
        const minSpeedPxPerSec = 40;
        const maxSpeedPxPerSec = 180;
        const edgeEpsilon = 1;
        let speedFactor = 0; // 0 at center, 1 at edges
        const initialScrollBehavior = getComputedStyle(carousel).scrollBehavior;

        function step(ts) {
            if (!isHovering) {
                lastTs = 0;
                rafId = null;
                return;
            }

            if (!lastTs) lastTs = ts;
            const dt = Math.min(ts - lastTs, 32);
            lastTs = ts;

            const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
            if (maxScroll === 0) {
                rafId = requestAnimationFrame(step);
                return;
            }
            const speedPxPerSec = minSpeedPxPerSec + (maxSpeedPxPerSec - minSpeedPxPerSec) * speedFactor;
            let next = carousel.scrollLeft + direction * (speedPxPerSec * dt / 1000);

            if (next >= maxScroll - edgeEpsilon) {
                next = maxScroll;
            } else if (next <= edgeEpsilon) {
                next = 0;
            }

            carousel.scrollLeft = next;
            rafId = requestAnimationFrame(step);
        }

        carousel.addEventListener('mouseenter', () => {
            isHovering = true;
            carousel.style.scrollBehavior = 'auto';
            if (rafId === null) rafId = requestAnimationFrame(step);
        });
        carousel.addEventListener('mousemove', (e) => {
            const rect = carousel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const center = rect.width / 2;
            const distance = Math.min(Math.abs(x - center), center);
            const deadZone = center * 0.25;
            if (distance <= deadZone) {
                speedFactor = 0;
                return;
            }
            speedFactor = center > 0 ? distance / center : 0;
            direction = x >= center ? 1 : -1;
        });
        carousel.addEventListener('mouseleave', () => {
            isHovering = false;
            carousel.style.scrollBehavior = initialScrollBehavior;
            speedFactor = 0;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });

        // Pause auto-scroll while dragging
        carousel.addEventListener('mousedown', () => {
            isHovering = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });

    });

    // ==========================
    // Image Lightbox (Click to Enlarge)
    // ==========================
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    const lightboxImg = document.createElement('img');
    const lightboxVideo = document.createElement('video');
    lightboxVideo.controls = true;
    lightboxVideo.playsInline = true;
    lightboxVideo.setAttribute('controlslist', 'nodownload');
    lightbox.appendChild(lightboxImg);
    lightbox.appendChild(lightboxVideo);
    document.body.appendChild(lightbox);

    function openLightbox(img) {
        lightboxVideo.pause();
        lightboxVideo.removeAttribute('src');
        lightboxVideo.style.display = 'none';
        lightboxImg.style.display = 'block';
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function openVideoLightbox(video) {
        const src = video.currentSrc || video.src;
        if (!src) return;
        lightboxImg.style.display = 'none';
        lightboxImg.removeAttribute('src');
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = src;
        lightboxVideo.currentTime = 0;
        lightboxVideo.play().catch(() => {});
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lightboxImg.removeAttribute('src');
        lightboxVideo.pause();
        lightboxVideo.removeAttribute('src');
        lightboxVideo.load();
    }

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', (e) => {
            if (e.target.closest('.logo')) return;
            openLightbox(img);
        });
    });

    document.querySelectorAll('video').forEach(video => {
        if (video.id === 'introVideo') return;
        if (video.closest('.image-lightbox')) return;
        video.addEventListener('click', () => {
            openVideoLightbox(video);
        });
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // ==========================
    // Snake Game (Games Page)
    // ==========================
    const snakeCanvas = document.getElementById('snake-canvas');
    if (snakeCanvas) {
        const ctx = snakeCanvas.getContext('2d');
        const gridSize = 18;
        const tileCount = 20;
        const startBtn = document.getElementById('snake-start');
        const resetBtn = document.getElementById('snake-reset');
        const soundBtn = document.getElementById('snake-sound');
        const scoreEl = document.getElementById('snake-score');
        const overEl = document.getElementById('snake-over');
        const finalEl = document.getElementById('snake-final');
        const restartBtn = document.getElementById('snake-restart');
        const quitBtn = document.getElementById('snake-quit');
        const saveBtn = document.getElementById('snake-save');
        const nameEl = document.getElementById('snake-name');
        const highscoresEl = document.getElementById('snake-highscores');
        const statusEl = document.getElementById('snake-status');

        let snake = [{ x: 9, y: 9 }];
        let dir = { x: 1, y: 0 };
        let nextDir = { x: 1, y: 0 };
        let food = { x: 14, y: 9 };
        let running = false;
        let score = 0;
        let lastTime = 0;
        let stepMs = 140;
        let soundOn = true;
        let audioCtx;
        const highscoresKey = 'snake-highscores';
        let lastSaveAt = 0;
        const SAVE_COOLDOWN_MS = 3000;
        // Supabase config
        const SUPABASE_URL = 'https://ukwnrdukzuiwfxjyizoo.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_mKMrFqeVtHF0-nQZgOL5AA_Nw7Q3QIF';
        const SNAKE_TABLE = 'snake_scores';

        function beep(freq, duration = 0.08, type = 'sine', gain = 0.05) {
            if (!soundOn) return;
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const amp = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            amp.gain.value = gain;
            osc.connect(amp);
            amp.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        }

        function placeFood() {
            let valid = false;
            while (!valid) {
                food.x = Math.floor(Math.random() * tileCount);
                food.y = Math.floor(Math.random() * tileCount);
                valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
            }
        }

        function resetGame() {
            snake = [{ x: 9, y: 9 }];
            dir = { x: 1, y: 0 };
            nextDir = { x: 1, y: 0 };
            score = 0;
            scoreEl.textContent = `Score: ${score}`;
            stepMs = 140;
            placeFood();
            draw();
            if (overEl) overEl.classList.remove('open');
            document.body.classList.remove('game-lock');
        }

        async function fetchHighscores() {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
            const url = `${SUPABASE_URL}/rest/v1/${SNAKE_TABLE}?select=name,score,created_at&order=score.desc&limit=10`;
            const res = await fetch(url, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            if (!res.ok) return [];
            return await res.json();
        }

        async function saveHighscoreRemote(name, scoreValue) {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${SNAKE_TABLE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify([{ name, score: scoreValue }])
            });
            return res.ok;
        }

        async function renderHighscores() {
            if (!highscoresEl) return;
            const list = await fetchHighscores();
            highscoresEl.innerHTML = '';
            if (list.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No scores yet';
                highscoresEl.appendChild(li);
                return;
            }
            list.forEach((item) => {
                const li = document.createElement('li');
                const name = item.name ? `${item.name} — ` : '';
                li.textContent = `${name}${item.score}`;
                highscoresEl.appendChild(li);
            });
        }

        function startGame() {
            if (running) return;
            running = true;
            lastTime = 0;
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                document.body.classList.add('game-lock');
            }
            requestAnimationFrame(loop);
        }

        function stopGame() {
            running = false;
            document.body.classList.remove('game-lock');
            if (overEl) {
                finalEl.textContent = `Score: ${score}`;
                overEl.classList.add('open');
            }
            beep(180, 0.15, 'square', 0.06);
        }

        function update() {
            dir = nextDir;
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

            if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
                stopGame();
                return;
            }
            if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
                stopGame();
                return;
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score += 1;
                scoreEl.textContent = `Score: ${score}`;
                stepMs = Math.max(80, stepMs - 2);
                beep(520, 0.06, 'triangle', 0.05);
                placeFood();
            } else {
                snake.pop();
            }
        }

        function draw() {
            ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
            ctx.fillStyle = '#0b0b0b';
            ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

            ctx.fillStyle = '#1e90ff';
            snake.forEach((seg, i) => {
                const size = gridSize - 2;
                ctx.globalAlpha = i === 0 ? 1 : 0.85;
                ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, size, size);
            });
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#00e676';
            ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);
        }

        function loop(ts) {
            if (!running) return;
            if (!lastTime) lastTime = ts;
            const elapsed = ts - lastTime;
            if (elapsed >= stepMs) {
                lastTime = ts;
                update();
                draw();
            }
            requestAnimationFrame(loop);
        }

        function setDirection(x, y) {
            if (x === -dir.x && y === -dir.y) return;
            nextDir = { x, y };
        }

        document.addEventListener('keydown', (e) => {
            if (!snakeCanvas) return;
            if (e.key === 'ArrowUp' || e.key === 'w') setDirection(0, -1);
            if (e.key === 'ArrowDown' || e.key === 's') setDirection(0, 1);
            if (e.key === 'ArrowLeft' || e.key === 'a') setDirection(-1, 0);
            if (e.key === 'ArrowRight' || e.key === 'd') setDirection(1, 0);
        });

        snakeCanvas.addEventListener('click', () => startGame());
        if (startBtn) startBtn.addEventListener('click', () => startGame());
        if (resetBtn) resetBtn.addEventListener('click', () => { resetGame(); startGame(); });
        if (restartBtn) restartBtn.addEventListener('click', () => { resetGame(); startGame(); });
        if (quitBtn) quitBtn.addEventListener('click', () => { resetGame(); stopGame(); if (overEl) overEl.classList.remove('open'); });
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                    if (statusEl) statusEl.textContent = 'Supabase not configured.';
                    return;
                }
                const now = Date.now();
                if (now - lastSaveAt < SAVE_COOLDOWN_MS) {
                    if (statusEl) statusEl.textContent = 'Please wait before saving again.';
                    return;
                }
                const name = (nameEl.value || '').trim();
                const ok = await saveHighscoreRemote(name, score);
                lastSaveAt = now;
                if (statusEl) statusEl.textContent = ok ? 'Score saved!' : 'Save failed. Check connection.';
                await renderHighscores();
                nameEl.value = '';
            });
        }
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                soundOn = !soundOn;
                soundBtn.textContent = `Sound: ${soundOn ? 'On' : 'Off'}`;
            });
        }

        // Touch swipe controls
        let touchStartX = 0;
        let touchStartY = 0;
        snakeCanvas.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            startGame();
        }, { passive: true });
        snakeCanvas.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                setDirection(dx > 0 ? 1 : -1, 0);
            } else {
                setDirection(0, dy > 0 ? 1 : -1);
            }
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                e.preventDefault();
            }
        }, { passive: false });

        renderHighscores().catch(() => {
            if (statusEl) statusEl.textContent = 'Unable to load scores.';
        });
        resetGame();
    }

    // ==========================
    // Tap the Dot (Games Page)
    // ==========================
    const tapCanvas = document.getElementById('tap-canvas');
    if (tapCanvas) {
        const tctx = tapCanvas.getContext('2d');
        const tapStart = document.getElementById('tap-start');
        const tapReset = document.getElementById('tap-reset');
        const tapScoreEl = document.getElementById('tap-score');
        const tapTimeEl = document.getElementById('tap-time');
        const tapOverEl = document.getElementById('tap-over');
        const tapFinalEl = document.getElementById('tap-final');
        const tapNameEl = document.getElementById('tap-name');
        const tapSaveBtn = document.getElementById('tap-save');
        const tapRestartBtn = document.getElementById('tap-restart');
        const tapQuitBtn = document.getElementById('tap-quit');
        const tapHighscoresEl = document.getElementById('tap-highscores');
        const tapStatusEl = document.getElementById('tap-status');

        let tapScore = 0;
        let timeLeft = 30;
        let tapRunning = false;
        let target = { x: 180, y: 120, r: 14 };
        let moveTimer = null;
        let countdownTimer = null;
        let lastTapSaveAt = 0;
        const TAP_SAVE_COOLDOWN_MS = 3000;
        // Supabase config
        const SUPABASE_URL = 'https://ukwnrdukzuiwfxjyizoo.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_mKMrFqeVtHF0-nQZgOL5AA_Nw7Q3QIF';
        const TAP_TABLE = 'tap_scores';

        function drawTap() {
            tctx.clearRect(0, 0, tapCanvas.width, tapCanvas.height);
            tctx.fillStyle = '#0b0b0b';
            tctx.fillRect(0, 0, tapCanvas.width, tapCanvas.height);
            tctx.fillStyle = '#1e90ff';
            tctx.beginPath();
            tctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
            tctx.fill();
        }

        function randomizeTarget() {
            const pad = target.r + 6;
            target.x = Math.floor(Math.random() * (tapCanvas.width - pad * 2)) + pad;
            target.y = Math.floor(Math.random() * (tapCanvas.height - pad * 2)) + pad;
            drawTap();
        }

        function updateTapUI() {
            tapScoreEl.textContent = `Score: ${tapScore}`;
            tapTimeEl.textContent = `Time: ${timeLeft}`;
        }

        async function fetchHighscores() {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
            const url = `${SUPABASE_URL}/rest/v1/${TAP_TABLE}?select=name,score,created_at&order=score.desc&limit=10`;
            const res = await fetch(url, {
                headers: {
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            if (!res.ok) return [];
            return await res.json();
        }

        async function saveHighscoreRemote(name, scoreValue) {
            if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${TAP_TABLE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    Prefer: 'return=minimal'
                },
                body: JSON.stringify([{ name, score: scoreValue }])
            });
            return res.ok;
        }

        async function renderHighscores() {
            if (!tapHighscoresEl) return;
            const list = await fetchHighscores();
            tapHighscoresEl.innerHTML = '';
            if (list.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No scores yet';
                tapHighscoresEl.appendChild(li);
                return;
            }
            list.forEach((item) => {
                const li = document.createElement('li');
                const name = item.name ? `${item.name} — ` : '';
                li.textContent = `${name}${item.score}`;
                tapHighscoresEl.appendChild(li);
            });
        }

        function startTap() {
            if (tapRunning) return;
            tapRunning = true;
            moveTimer = setInterval(randomizeTarget, 900);
            countdownTimer = setInterval(() => {
                timeLeft -= 1;
                updateTapUI();
                if (timeLeft <= 0) stopTap();
            }, 1000);
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                document.body.classList.add('game-lock');
            }
        }

        function stopTap() {
            tapRunning = false;
            if (moveTimer) clearInterval(moveTimer);
            if (countdownTimer) clearInterval(countdownTimer);
            moveTimer = null;
            countdownTimer = null;
            document.body.classList.remove('game-lock');
            if (tapOverEl) {
                tapFinalEl.textContent = `Score: ${tapScore}`;
                tapOverEl.classList.add('open');
            }
        }

        function resetTap() {
            stopTap();
            tapScore = 0;
            timeLeft = 30;
            updateTapUI();
            randomizeTarget();
            if (tapOverEl) tapOverEl.classList.remove('open');
            document.body.classList.remove('game-lock');
        }

        function handleTap(x, y) {
            if (!tapRunning) return;
            const dx = x - target.x;
            const dy = y - target.y;
            if (dx * dx + dy * dy <= target.r * target.r) {
                tapScore += 1;
                updateTapUI();
                randomizeTarget();
            }
        }

        tapCanvas.addEventListener('click', (e) => {
            const rect = tapCanvas.getBoundingClientRect();
            handleTap(e.clientX - rect.left, e.clientY - rect.top);
        });
        tapCanvas.addEventListener('touchstart', (e) => {
            const rect = tapCanvas.getBoundingClientRect();
            const t = e.touches[0];
            handleTap(t.clientX - rect.left, t.clientY - rect.top);
        }, { passive: true });
        tapCanvas.addEventListener('touchmove', (e) => {
            if (tapRunning && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
                e.preventDefault();
            }
        }, { passive: false });

        if (tapStart) tapStart.addEventListener('click', () => startTap());
        if (tapReset) tapReset.addEventListener('click', () => resetTap());
        if (tapRestartBtn) tapRestartBtn.addEventListener('click', () => { resetTap(); startTap(); });
        if (tapQuitBtn) tapQuitBtn.addEventListener('click', () => { resetTap(); if (tapOverEl) tapOverEl.classList.remove('open'); });
        if (tapSaveBtn) {
            tapSaveBtn.addEventListener('click', async () => {
                if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                    if (tapStatusEl) tapStatusEl.textContent = 'Supabase not configured.';
                    return;
                }
                const now = Date.now();
                if (now - lastTapSaveAt < TAP_SAVE_COOLDOWN_MS) {
                    if (tapStatusEl) tapStatusEl.textContent = 'Please wait before saving again.';
                    return;
                }
                const name = (tapNameEl.value || '').trim();
                const ok = await saveHighscoreRemote(name, tapScore);
                lastTapSaveAt = now;
                if (tapStatusEl) tapStatusEl.textContent = ok ? 'Score saved!' : 'Save failed. Check connection.';
                await renderHighscores();
                tapNameEl.value = '';
            });
        }

        renderHighscores().catch(() => {
            if (tapStatusEl) tapStatusEl.textContent = 'Unable to load scores.';
        });
        resetTap();
    }
});
