// ── Global Lenis instance ──
let lenis;

// ── Wait for DOM ──
document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initSmoothAnchors();
    initCursor();
    initNameHover();
    initDocumentModal();
    initProjectSliders();
    initNavbar();
    initScrollProgress();
    initAnimations();
});

// ═══════════════════════════════════════════
//  PROJECT SLIDERS
// ═══════════════════════════════════════════
function initProjectSliders() {
    const sliders = document.querySelectorAll('.project-slider');
    
    sliders.forEach(slider => {
        const images = slider.querySelectorAll('.slider-img');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        const dotsContainer = slider.querySelector('.slider-dots');
        const progressBar = slider.querySelector('.slider-progress-bar');
        
        let currentIndex = 0;
        const total = images.length;
        const intervalTime = 5000;
        let autoPlayTimer;

        // Create dots
        images.forEach((img, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);

            if (img.complete) checkVertical(img);
            else img.onload = () => checkVertical(img);
        });

        const dots = slider.querySelectorAll('.dot');

        function checkVertical(img) {
            if (img.naturalHeight > img.naturalWidth) img.classList.add('vertical');
        }

        function goToSlide(index) {
            images[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');
            
            currentIndex = (index + total) % total;
            
            images[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        }

        function startAutoPlay() {
            stopAutoPlay();
            
            // Start the bar animation
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.transition = `width ${intervalTime}ms linear`;
                    progressBar.style.width = '100%';
                }, 20);
            }

            autoPlayTimer = setTimeout(() => {
                goToSlide(currentIndex + 1);
                startAutoPlay(); // Recurse for next slide
            }, intervalTime);
        }

        function stopAutoPlay() {
            clearTimeout(autoPlayTimer);
            if (progressBar) {
                progressBar.style.transition = 'none';
                progressBar.style.width = '0%';
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        prevBtn?.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
            resetAutoPlay();
        });
        
        nextBtn?.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
            resetAutoPlay();
        });

        // Initial Start
        startAutoPlay();

        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
    });
}


// ═══════════════════════════════════════════
//  DOCUMENT MODAL (Resume & Certificates)
// ═══════════════════════════════════════════
function initDocumentModal() {
    const modal = document.getElementById('resume-modal');
    const closeBtn = document.getElementById('closeResume');
    const overlay = modal?.querySelector('.modal-overlay');
    const iframe = modal?.querySelector('iframe');

    if (!modal || !closeBtn) return;

    const openModal = (url) => {
        if (iframe) iframe.src = url;
        modal.classList.add('visible');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open');
    };

    // Resume Trigger
    const resumeBtn = document.getElementById('openResume');
    resumeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('assets/docs/resume.pdf');
    });

    // Certificate Triggers
    const certItems = document.querySelectorAll('.cert-list li');
    certItems.forEach(item => {
        item.addEventListener('click', () => {
            const docPath = item.getAttribute('data-doc');
            if (docPath) openModal(docPath);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModal();
        }
    });
}


// ═══════════════════════════════════════════
//  NAME HOVER POPUP
// ═══════════════════════════════════════════
function initNameHover() {
    const popup = document.getElementById('info-popup');
    const overlay = document.getElementById('blur-overlay');
    const targets = document.querySelectorAll('.name-hover');
    if (!popup || !targets.length || !overlay) return;

    let isVisible = false;
    let leaveTimeout;

    // Use GSAP for buttery smooth follow
    const xTo = gsap.quickTo(popup, "left", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(popup, "top", { duration: 0.45, ease: "power3.out" });

    targets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            clearTimeout(leaveTimeout);
            isVisible = true;
            popup.classList.add('visible');
            overlay.classList.add('visible');
            document.body.classList.add('is-hovering-name');
        });

        target.addEventListener('mouseleave', () => {
            leaveTimeout = setTimeout(() => {
                isVisible = false;
                popup.classList.remove('visible');
                overlay.classList.remove('visible');
                document.body.classList.remove('is-hovering-name');
            }, 20); // Small delay to prevent glitching/flicker
        });

        target.addEventListener('mousemove', (e) => {
            if (!isVisible) return;
            
            // Southeast Position: offset by 30px
            const x = e.clientX + 30;
            const y = e.clientY + 30;
            
            // Clamp to window bounds
            const rect = popup.getBoundingClientRect();
            let finalX = x;
            let finalY = y;
            
            // If it would overflow right
            if (x + rect.width > window.innerWidth - 20) {
                finalX = e.clientX - rect.width - 30;
            }
            
            // If it would overflow bottom
            if (y + rect.height > window.innerHeight - 20) {
                finalY = e.clientY - rect.height - 30;
            }

            xTo(finalX);
            yTo(finalY);
        });
    });
}


// ═══════════════════════════════════════════
//  SMOOTH SCROLL (Lenis)
// ═══════════════════════════════════════════
function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// ═══════════════════════════════════════════
//  SMOOTH ANCHOR SCROLLING
// ═══════════════════════════════════════════
function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') {
                // Scroll to top for bare "#" links
                e.preventDefault();
                lenis.scrollTo(0, { duration: 1.6 });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, {
                    offset: 0,
                    duration: 1.6,
                    easing: (t) => 1 - Math.pow(1 - t, 4), // easeOutQuart
                });
            }
        });
    });
}

// ═══════════════════════════════════════════
//  CUSTOM CURSOR
// ═══════════════════════════════════════════
function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    // Show cursor only after first mouse move
    document.addEventListener('mousemove', (e) => {
        cursor.classList.add('visible');
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Hover states
    const hoverTargets = document.querySelectorAll('a, button, .other-card, .skill-group li');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
}

// ═══════════════════════════════════════════
//  NAVBAR
// ═══════════════════════════════════════════
function initNavbar() {
    const nav = document.querySelector('.navbar');
    const toggle = document.getElementById('menuToggle');
    const links = document.getElementById('navLinks');

    // Scroll effect
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
    });

    // Mobile menu
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
        });

        // Close on link click
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => links.classList.remove('open'));
        });
    }
}

// ═══════════════════════════════════════════
//  SCROLL PROGRESS
// ═══════════════════════════════════════════
function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
    });
}

// ═══════════════════════════════════════════
//  GSAP ANIMATIONS
// ═══════════════════════════════════════════
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // ── Hero Title Reveal ──
    // Set initial state
    gsap.set('.hero-name .word', { y: '100%', opacity: 0 });
    gsap.set('.reveal', { opacity: 0, y: 24 });

    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
        .to('.hero-name .word', {
            y: '0%',
            opacity: 1,
            stagger: 0.12,
            duration: 1.2,
            ease: 'expo.out',
        })
        .to('.hero .reveal', {
            opacity: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: 'power3.out',
        }, '-=0.6');

    // ── Scroll-triggered Reveals ──
    const revealEls = document.querySelectorAll('section:not(.hero) .reveal, footer .reveal');
    revealEls.forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
        });
    });

    // ── Background Glow Parallax ──
    const glow = document.querySelector('.hero-glow');
    if (glow) {
        gsap.to(glow, {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
            y: 150,
            opacity: 0.3,
        });
    }

    // ── Project Visual Tilt on Hover ──
    const visual = document.querySelector('.project-visual');
    if (visual) {
        const card = visual.closest('.featured-card');
        if (card) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const xPct = (e.clientX - rect.left) / rect.width - 0.5;
                const yPct = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(visual, {
                    rotateY: xPct * 8,
                    rotateX: -yPct * 8,
                    duration: 0.4,
                    ease: 'power2.out',
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(visual, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                });
            });
        }
    }
}
