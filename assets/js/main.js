// ── Global Lenis instance ──
// let lenis;

// ── Wait for DOM ──
document.addEventListener('DOMContentLoaded', () => {
    // initLenis();
    initSmoothAnchors();
    initCursor();
    initGridHighlight();
    initNameHover();
    initDocumentModal();
    initContactForm();
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
    if (!sliders.length) return;
    
    sliders.forEach(slider => {
        const visual = slider.closest('.case-study-visual');
        const images = slider.querySelectorAll('.slider-img');
        const prevBtn = visual?.querySelector('.prev');
        const nextBtn = visual?.querySelector('.next');
        const dotsContainer = visual?.querySelector('.slider-dots');
        const progressBar = slider.querySelector('.slider-progress-bar');
        
        let currentIndex = 0;
        const total = images.length;
        const intervalTime = 5000;
        let autoPlayTimer;

        function checkVertical(img) {
            if (img.tagName.toLowerCase() === 'video') {
                if (img.videoHeight > img.videoWidth) img.classList.add('vertical');
            } else {
                if (img.naturalHeight > img.naturalWidth) img.classList.add('vertical');
            }
        }

        if (total <= 1) {
            if (progressBar) progressBar.style.display = 'none';
            const controls = visual?.querySelector('.slider-controls');
            if (controls) controls.style.display = 'none';
            
            images.forEach(img => {
                if (img.tagName.toLowerCase() === 'video') {
                    if (img.readyState >= 1) checkVertical(img);
                    else img.addEventListener('loadedmetadata', () => checkVertical(img));
                } else {
                    if (img.complete) checkVertical(img);
                    else img.onload = () => checkVertical(img);
                }
            });
            return;
        }

        // Create dots
        images.forEach((img, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(i);
                resetAutoPlay();
            });
            if (dotsContainer) dotsContainer.appendChild(dot);

            if (img.tagName.toLowerCase() === 'video') {
                if (img.readyState >= 1) checkVertical(img);
                else img.addEventListener('loadedmetadata', () => checkVertical(img));
            } else {
                if (img.complete) checkVertical(img);
                else img.onload = () => checkVertical(img);
            }
        });

        function goToSlide(index) {
            images[currentIndex].classList.remove('active');
            const dots = visual?.querySelectorAll('.dot');
            if (dots && dots[currentIndex]) dots[currentIndex].classList.remove('active');
            
            currentIndex = (index + total) % total;
            
            images[currentIndex].classList.add('active');
            if (dots && dots[currentIndex]) dots[currentIndex].classList.add('active');
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
                startAutoPlay();
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

        // Pause on hover (only on hover-capable devices)
        if (window.matchMedia('(hover: hover)').matches) {
            slider.addEventListener('mouseenter', stopAutoPlay);
            slider.addEventListener('mouseleave', startAutoPlay);
        }
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
        if (window.innerWidth <= 768) {
            window.open(url, '_blank');
            return;
        }
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

    // Certificate Triggers (all [data-doc] items)
    const certItems = document.querySelectorAll('[data-doc]');
    certItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const docPath = item.getAttribute('data-doc');
            if (docPath) openModal(docPath);
        });
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const docPath = item.getAttribute('data-doc');
                if (docPath) openModal(docPath);
            }
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
//  CONTACT FORM HANDLER
// ═══════════════════════════════════════════
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const submitBtn = document.getElementById('contactSubmit');
    const statusDiv = document.getElementById('contactStatus');

    function showStatus(msg, type) {
        if (!statusDiv) return;
        statusDiv.textContent = msg;
        statusDiv.className = `form-status show ${type}`;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput?.value.trim() || '';
        const email = emailInput?.value.trim() || '';
        const message = messageInput?.value.trim() || '';

        if (!name || !email || !message) {
            showStatus('Please fill in all fields (Name, Email, and Message).', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        const recipient = 'amudalapalli.venkateswararao@gmail.com';
        const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(
            `Hi Venkatesh,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via Portfolio Website`
        );

        const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

        if (submitBtn) {
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Opening Mail Client...</span>';

            showStatus('Opening your email client to send your message. Thank you for reaching out!', 'success');

            // Trigger mailto composer
            window.location.href = mailtoUrl;

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                form.reset();
            }, 2500);
        }
    });
}


// ═══════════════════════════════════════════
//  GRID HIGHLIGHT TRACKING
// ═══════════════════════════════════════════
function initGridHighlight() {
    const gridSections = document.querySelectorAll('.hero, .contact, .footer');
    if (!gridSections.length) return;

    gridSections.forEach(sec => {
        const updateCoords = (clientX, clientY) => {
            const rect = sec.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            sec.style.setProperty('--mouse-x', `${x}px`);
            sec.style.setProperty('--mouse-y', `${y}px`);
        };

        sec.addEventListener('mousemove', (e) => {
            updateCoords(e.clientX, e.clientY);
        });

        sec.addEventListener('mouseenter', (e) => {
            updateCoords(e.clientX, e.clientY);
        });
    });
}


// ═══════════════════════════════════════════
//  NAME HOVER POPUP
// ═══════════════════════════════════════════
function initNameHover() {
    const popup = document.getElementById('info-popup');
    const overlay = document.getElementById('blur-overlay');
    const targets = document.querySelectorAll('.name-hover');
    if (!popup || !targets.length) return;

    let isVisible = false;
    let leaveTimeout;

    // Use GSAP for buttery smooth follow (Original Animation)
    const xTo = gsap.quickTo(popup, "left", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(popup, "top", { duration: 0.45, ease: "power3.out" });

    const movePopup = (e) => {
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
    };

    targets.forEach(target => {
        target.addEventListener('mouseenter', (e) => {
            clearTimeout(leaveTimeout);
            isVisible = true;
            popup.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            document.body.classList.add('is-hovering-name');
            movePopup(e);
        });

        target.addEventListener('mouseleave', () => {
            leaveTimeout = setTimeout(() => {
                isVisible = false;
                popup.classList.remove('visible');
                if (overlay) overlay.classList.remove('visible');
                document.body.classList.remove('is-hovering-name');
            }, 80);
        });

        target.addEventListener('mousemove', movePopup);

        // Click / touch toggle
        target.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isVisible) {
                isVisible = false;
                popup.classList.remove('visible');
                if (overlay) overlay.classList.remove('visible');
                document.body.classList.remove('is-hovering-name');
            } else {
                clearTimeout(leaveTimeout);
                isVisible = true;
                popup.classList.add('visible');
                if (overlay) overlay.classList.add('visible');
                document.body.classList.add('is-hovering-name');
                movePopup(e);
            }
        });
    });

    popup.addEventListener('mouseenter', () => {
        clearTimeout(leaveTimeout);
        isVisible = true;
        popup.classList.add('visible');
        if (overlay) overlay.classList.add('visible');
        document.body.classList.add('is-hovering-name');
    });

    popup.addEventListener('mouseleave', () => {
        leaveTimeout = setTimeout(() => {
            isVisible = false;
            popup.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            document.body.classList.remove('is-hovering-name');
        }, 80);
    });

    if (overlay) {
        overlay.addEventListener('click', () => {
            isVisible = false;
            popup.classList.remove('visible');
            overlay.classList.remove('visible');
            document.body.classList.remove('is-hovering-name');
        });
    }

    document.addEventListener('click', (e) => {
        if (isVisible && !popup.contains(e.target) && ![...targets].some(t => t.contains(e.target))) {
            isVisible = false;
            popup.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            document.body.classList.remove('is-hovering-name');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isVisible) {
            isVisible = false;
            popup.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            document.body.classList.remove('is-hovering-name');
        }
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

    // Skip custom cursor tracking on touch-only devices
    if (!window.matchMedia('(hover: hover)').matches) {
        cursor.style.display = 'none';
        if (flashlight) flashlight.style.display = 'none';
        return;
    }

    // Show cursor only after first mouse move
    document.addEventListener('mousemove', (e) => {
        cursor.classList.add('visible');
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        if (flashlight) {
            flashlight.style.left = e.clientX + 'px';
            flashlight.style.top = e.clientY + 'px';
        }
    });

    // Hover states
    const hoverTargets = document.querySelectorAll('a, button, .other-card, .skill-group li, .name-hover');
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

    // Prevent ScrollTrigger from recalculating positions and causing jumps when mobile address bar hides/shows
    ScrollTrigger.config({ ignoreMobileResize: true });

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


    // Only run scroll-linked parallax animations on desktop/tablet to improve mobile scroll performance
    if (window.innerWidth > 768) {
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

        // ── Project Cards: Subtle 3D Tilt on Hover ──
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= 768) return;
                const rect = card.getBoundingClientRect();
                const xPct = (e.clientX - rect.left) / rect.width - 0.5;
                const yPct = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(card, {
                    rotateY: xPct * 3,
                    rotateX: -yPct * 3,
                    duration: 0.5,
                    ease: 'power2.out',
                    transformPerspective: 1000,
                });
            });
            card.addEventListener('mouseleave', () => {
                if (window.innerWidth <= 768) return;
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                });
            });
        });
    }
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
