// ── Global Lenis instance ──
// let lenis;

// ── Wait for DOM ──
document.addEventListener('DOMContentLoaded', () => {
    // initLenis();
    initSmoothAnchors();
    initCursor();
    initNameHover();
    initDocumentModal();
    initProjectSliders();
    initNavbar();
    initScrollProgress();
    initAnimations();
    initDocumindVideo();
});

// ═══════════════════════════════════════════
//  PROJECT SLIDERS
// ═══════════════════════════════════════════
function initProjectSliders() {
    const sliders = document.querySelectorAll('.project-slider');
    
    sliders.forEach(slider => {
        const visual = slider.closest('.case-study-visual');
        const images = slider.querySelectorAll('.slider-img');
        const prevBtn = visual.querySelector('.prev');
        const nextBtn = visual.querySelector('.next');
        const dotsContainer = visual.querySelector('.slider-dots');
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

        const dots = visual.querySelectorAll('.dot');

        function updateAspectRatio() {
            const activeImg = images[currentIndex];
            if (activeImg.naturalWidth && activeImg.naturalHeight) {
                if (window.innerWidth > 768) {
                    slider.style.aspectRatio = `${activeImg.naturalWidth} / ${activeImg.naturalHeight}`;
                } else {
                    slider.style.aspectRatio = '';
                }
            }
        }

        window.addEventListener('resize', updateAspectRatio);

        function checkVertical(img) {
            if (img.naturalHeight > img.naturalWidth) img.classList.add('vertical');
            if (img === images[currentIndex]) updateAspectRatio();
        }

        function goToSlide(index) {
            images[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');
            
            currentIndex = (index + total) % total;
            
            images[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
            updateAspectRatio();
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

    const movePopup = (e) => {
        if (!isVisible) return;
        
        const x = e.clientX + 25;
        const y = e.clientY + 25;
        
        const rect = popup.getBoundingClientRect();
        let finalX = x;
        let finalY = y;
        
        if (x + rect.width > window.innerWidth - 20) {
            finalX = e.clientX - rect.width - 25;
        }
        if (y + rect.height > window.innerHeight - 20) {
            finalY = e.clientY - rect.height - 25;
        }

        gsap.set(popup, { left: finalX, top: finalY });
    };

    targets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            clearTimeout(leaveTimeout);
            isVisible = true;
            popup.classList.add('visible');
            document.body.classList.add('is-hovering-name');
        });

        target.addEventListener('mouseleave', () => {
            leaveTimeout = setTimeout(() => {
                isVisible = false;
                popup.classList.remove('visible');
                document.body.classList.remove('is-hovering-name');
            }, 20);
        });

        target.addEventListener('mousemove', movePopup);
    });
}


// ═══════════════════════════════════════════
//  SMOOTH SCROLL (Lenis)
// ═══════════════════════════════════════════
function initLenis() {
    lenis = new Lenis({
        duration: 0.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
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
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ═══════════════════════════════════════════
//  CUSTOM CURSOR
// ═══════════════════════════════════════════
function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    const flashlight = document.getElementById('flashlight');
    if (!cursor) return;

    // Show cursor only after first mouse move
    document.addEventListener('mousemove', (e) => {
        cursor.classList.add('visible');
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        if (flashlight) {
            flashlight.style.left = e.clientX + 'px';
            flashlight.style.top = e.clientY + 'px';
        }

        // Grid highlight tracking for sections with grid
        const gridSections = document.querySelectorAll('.hero, .contact, .footer');
        gridSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                sec.style.setProperty('--mouse-x', `${x}px`);
                sec.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    });

    // Hover states
    const hoverTargets = document.querySelectorAll('a, button, .other-card, .skill-group li');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // Theme detection for flashlight
    const allSections = document.querySelectorAll('section');
    allSections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => {
                if (flashlight) {
                    flashlight.style.opacity = section.classList.contains('theme--light') ? '0' : '1';
                }
            },
            onEnterBack: () => {
                if (flashlight) {
                    flashlight.style.opacity = section.classList.contains('theme--light') ? '0' : '1';
                }
            }
        });
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

    // Theme awareness for sticky navbar
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 60px",
            end: "bottom 60px",
            onToggle: self => {
                if (self.isActive) {
                    if (section.classList.contains('theme--light')) {
                        nav.classList.add('navbar--light');
                    } else {
                        nav.classList.remove('navbar--light');
                    }
                }
            }
        });
    });

    // Mobile menu
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            toggle.classList.toggle('open');
            document.body.classList.toggle('nav-open');
        });

        // Close on link click
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.classList.remove('open');
                document.body.classList.remove('nav-open');
            });
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

    // ── Hero: Cinematic Entrance ──
    // Clear .reveal initial states on hero children (GSAP handles them)
    gsap.set('.hero .reveal', { opacity: 1, y: 0 });
    // Now set our custom initial states
    gsap.set('.hero-name .word', { y: '130%', opacity: 0, scale: 0.9, rotationZ: 4 });
    gsap.set('.hero-meta > *', { opacity: 0, y: 40 });
    gsap.set('.hero-actions', { opacity: 1, y: 0 });
    gsap.set('.hero-actions .btn-premium', { opacity: 0, y: 30, scale: 0.9 });
    gsap.set('.scroll-hint', { opacity: 0 });

    const heroTl = gsap.timeline({ delay: 0.3 });

    heroTl
        // Name words reveal with stagger
        .to('.hero-name .word', {
            y: '0%',
            opacity: 1,
            scale: 1,
            rotationZ: 0,
            stagger: 0.12,
            duration: 1.6,
            ease: 'power4.out',
        }, '-=0.4')
        // Meta info slides up
        .to('.hero-meta > *', {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: 'power3.out',
        }, '-=1.0')
        // Buttons pop in with scale
        .to('.hero-actions .btn-premium', {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 1,
            ease: 'expo.out',
        }, '-=0.5')
        // Scroll hint fades in last
        .to('.scroll-hint', {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
        }, '-=0.3');



    // ── Section Heading Parallax ──
    document.querySelectorAll('.section-heading').forEach(heading => {
        gsap.to(heading, {
            scrollTrigger: {
                trigger: heading,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
            },
            y: -20,
            ease: 'none',
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

    // ── Featured Project: Subtle Tilt on Hover ──
    const caseVisuals = document.querySelectorAll('.case-study-visual');
    caseVisuals.forEach(visual => {
        gsap.to(visual, {
            scrollTrigger: {
                trigger: visual.closest('.featured-case-study'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            },
            y: 40,
            ease: 'none'
        });
    });

    const projectSliders = document.querySelectorAll('.project-slider');
    projectSliders.forEach(slider => {
        const card = slider.closest('.featured-case-study');
        if (card) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const xPct = (e.clientX - rect.left) / rect.width - 0.5;
                const yPct = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(slider, {
                    rotateY: xPct * 4,
                    rotateX: -yPct * 4,
                    duration: 0.6,
                    ease: 'power2.out',
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(slider, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                });
            });
        }
    });


}

// ═══════════════════════════════════════════
//  DOCUMIND VIDEO TOGGLE
// ═══════════════════════════════════════════
function initDocumindVideo() {
    const video = document.getElementById('documind-video');
    const playBtn = document.getElementById('documind-play-btn');
    if (video && playBtn) {
        playBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playBtn.innerText = 'Pause';
            } else {
                video.pause();
                playBtn.innerText = 'Play';
            }
        });
    }
}
