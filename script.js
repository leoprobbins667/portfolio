document.addEventListener("DOMContentLoaded", () => {
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
            // No video or video already played: skip video, start header animation immediately
            if (video) video.remove();
            switchInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % phrases.length;
                animatedText.textContent = phrases[currentIndex];
            }, 5000);
        } else if (home) {
            // Video exists and hasn't played yet
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

                // Mark video as played for this tab
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
    const speed = 0.15;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Trail elements
    const trailCount = 40;
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

    // Button/interactive hover targets (buttons, links, project items, logo)
    const buttonTargets = document.querySelectorAll(
        'button, .header-right a, .project-item, .header-left'
    );

    buttonTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            customCursor.classList.add('button-hover');
            customCursor.classList.remove('caret');
            customCursor._targetElement = el;

            // Initialize hover position once to prevent jumps
            customCursor._hoverX = cursorX;
            customCursor._hoverY = cursorY;
        });
        el.addEventListener('mouseleave', () => {
            customCursor.classList.remove('button-hover');
            customCursor._targetElement = null;

            // Reset hover position
            customCursor._hoverX = undefined;
            customCursor._hoverY = undefined;
        });
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;

        customCursor.style.transform = `translate3d(${cursorX - customCursor.offsetWidth / 2}px, ${cursorY - customCursor.offsetHeight / 2}px, 0)`;

        const dx = mouseX - (customCursor._lastX || mouseX);
        const dy = mouseY - (customCursor._lastY || mouseY);
        const speedMag = Math.min(Math.sqrt(dx*dx + dy*dy), 250);
        const angle = Math.atan2(dy, dx);

        // Normal cursor trail
        if (!customCursor.classList.contains('caret') && !customCursor.classList.contains('button-hover')) {
            trailElements.forEach((trail, index) => {
                const prev = index === 0 ? { x: cursorX, y: cursorY } : trailElements[index - 1];
                trail.x += (prev.x - trail.x) * 0.05;
                trail.y += (prev.y - trail.y) * 0.05;

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

        // Button hover square (including project-item vanish)
        if (customCursor.classList.contains('button-hover')) {
            // Shrink to 0 if hovering project-item, else normal size 10
            const size = customCursor._targetElement && customCursor._targetElement.classList.contains('project-item') ? 0 : 10;

            // Smooth movement
            if (customCursor._hoverX !== undefined && customCursor._hoverY !== undefined) {
                customCursor._hoverX += (cursorX - customCursor._hoverX) * speed;
                customCursor._hoverY += (cursorY - customCursor._hoverY) * speed;
            }

            // Smooth resizing
            const currentWidth = parseFloat(customCursor.style.width) || 0;
            const currentHeight = parseFloat(customCursor.style.height) || 0;
            customCursor.style.width = `${currentWidth + (size - currentWidth) * speed}px`;
            customCursor.style.height = `${currentHeight + (size - currentHeight) * speed}px`;

            // Apply transform
            customCursor.style.transform = `translate3d(${customCursor._hoverX - size/2}px, ${customCursor._hoverY - size/2}px, 0)`;
            customCursor.style.borderRadius = "4px";
            customCursor.style.backgroundColor = "rgba(30, 144, 255, 0.9)";
            customCursor.style.boxShadow = size === 0 ? "none" : "0 0 10px rgba(30, 144, 255, 0.8)";
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

});

// ==========================
// Carousel
// ==========================
document.querySelectorAll('.scroll-carousel').forEach(carousel => {
    const images = carousel.querySelectorAll('img');

    if (images.length < 4 || carousel.scrollWidth <= carousel.clientWidth) return;

    let targetScroll = carousel.scrollLeft;
    let currentScroll = carousel.scrollLeft;
    const speed = 1.5; // adjust for faster scroll
    const easing = 0.12;

    carousel.addEventListener('wheel', (e) => {
        e.preventDefault(); // prevent vertical scroll while over carousel
        targetScroll += e.deltaY * speed;
        targetScroll = Math.max(
            0,
            Math.min(targetScroll, carousel.scrollWidth - carousel.clientWidth)
        );
    }, { passive: false });

    function animate() {
        currentScroll += (targetScroll - currentScroll) * easing;
        carousel.scrollLeft = currentScroll;
        requestAnimationFrame(animate);
    }

    animate();
});

