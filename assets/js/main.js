// ── Wait for DOM ──
document.addEventListener('DOMContentLoaded', () => {
    initSmoothAnchors();
    initCursor();
    initGridHighlight();
    initNameHover();
    initDocumentModal();
    initContactForm();
    initNavbar();
    initScrollProgress();
    initAnimations();
});



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
    const heroName = document.querySelector('.hero-name');
    if (!popup || !heroName) return;

    // Elements that constitute the name entity
    const line1Spans = Array.from(heroName.querySelectorAll('.line:first-child .name-hover'));
    const line2Spans = Array.from(heroName.querySelectorAll('.line:nth-child(2) .name-hover'));
    if (!line1Spans.length || !line2Spans.length) return;

    let isVisible = false;
    let lastX = 0;
    let lastY = 0;

    // Reset styles so GSAP has full hardware-accelerated transform control
    gsap.set(popup, {
        position: 'fixed',
        top: 0,
        left: 0,
        xPercent: 0,
        yPercent: 0,
        opacity: 0,
        pointerEvents: 'none'
    });
    if (overlay) {
        gsap.set(overlay, {
            opacity: 0,
            pointerEvents: 'none'
        });
    }

    // Measure exact geometric bounds of the two lines of the name
    const getTightBounds = (spans) => {
        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        let hasValidSpan = false;
        spans.forEach(span => {
            const r = span.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
                hasValidSpan = true;
                if (r.left < left) left = r.left;
                if (r.right > right) right = r.right;
                if (r.top < top) top = r.top;
                if (r.bottom > bottom) bottom = r.bottom;
            }
        });
        return hasValidSpan ? { left, right, top, bottom } : null;
    };

    // Check if point (x, y) is on the name as a unified entity
    const isPointOnName = (x, y) => {
        const b1 = getTightBounds(line1Spans);
        const b2 = getTightBounds(line2Spans);
        if (!b1 || !b2) return false;

        const pad = 8; // Comfortable buffer around font glyphs

        // 1. Inside Line 1 (Amudalapalli)
        const inLine1 = (
            x >= b1.left - pad &&
            x <= b1.right + pad &&
            y >= b1.top - pad &&
            y <= b1.bottom + pad
        );
        if (inLine1) return true;

        // 2. Inside Line 2 (Venkateswara Rao)
        const inLine2 = (
            x >= b2.left - pad &&
            x <= b2.right + pad &&
            y >= b2.top - pad &&
            y <= b2.bottom + pad
        );
        if (inLine2) return true;

        // 3. In the vertical bridging corridor between Line 1 and Line 2
        // Line 1 is above Line 2. This connects the two lines vertically
        // without including empty space to the right of Line 1.
        if (y > b1.bottom - pad && y < b2.top + pad) {
            const minLeft = Math.min(b1.left, b2.left) - pad;
            const maxRight = Math.min(b1.right, b2.right) + pad;
            if (x >= minLeft && x <= maxRight) {
                return true;
            }
        }

        return false;
    };

    const getDownwardCoords = (e) => {
        const popupWidth = popup.offsetWidth || 280;

        // Horizontally center relative to mouse cursor
        let targetX = e.clientX - popupWidth / 2;
        targetX = Math.max(16, Math.min(window.innerWidth - popupWidth - 16, targetX));

        // Always downwards from cursor: 22px below cursor
        const targetY = e.clientY + 22;

        return { x: targetX, y: targetY };
    };

    const showPopup = (e) => {
        if (isVisible) return;
        isVisible = true;

        popup.classList.add('visible');
        if (overlay) overlay.classList.add('visible');
        document.body.classList.add('is-hovering-name');

        const { x, y } = getDownwardCoords(e);
        lastX = x;
        lastY = y;

        // Smooth overlay blur in
        if (overlay) {
            gsap.killTweensOf(overlay);
            gsap.to(overlay, {
                opacity: 1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        }

        // Elastic entrance bounce downwards
        gsap.killTweensOf(popup);
        gsap.fromTo(popup,
            {
                x: x,
                y: y - 12,
                scale: 0.72,
                opacity: 0,
                rotation: -3
            },
            {
                x: x,
                y: y,
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.6,
                ease: 'elastic.out(1.2, 0.45)',
                overwrite: 'auto'
            }
        );
    };

    const movePopup = (e) => {
        if (!isVisible) return;
        const { x, y } = getDownwardCoords(e);

        const deltaX = x - (lastX || x);
        lastX = x;
        lastY = y;

        // Subtle elastic tilt in direction of horizontal motion
        const tilt = Math.max(-6, Math.min(6, deltaX * 0.35));

        gsap.to(popup, {
            x: x,
            y: y,
            rotation: tilt,
            duration: 0.55,
            ease: 'elastic.out(1.15, 0.4)',
            overwrite: 'auto',
            onComplete: () => {
                gsap.to(popup, { rotation: 0, duration: 0.25, ease: 'power2.out' });
            }
        });
    };

    const hidePopup = () => {
        if (!isVisible) return;
        isVisible = false;

        // Fade overlay out immediately with fast, clean curve
        if (overlay) {
            gsap.killTweensOf(overlay);
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.1,
                ease: 'power2.out',
                overwrite: 'auto',
                onComplete: () => {
                    if (!isVisible) {
                        overlay.classList.remove('visible');
                        document.body.classList.remove('is-hovering-name');
                    }
                }
            });
        } else {
            document.body.classList.remove('is-hovering-name');
        }

        // Dissolve popup immediately
        gsap.killTweensOf(popup);
        gsap.to(popup, {
            scale: 0.88,
            opacity: 0,
            duration: 0.1,
            ease: 'power2.out',
            overwrite: 'auto',
            onComplete: () => {
                if (!isVisible) {
                    popup.classList.remove('visible');
                }
            }
        });
    };

    // Track mouse movement across the document/window
    const onMouseMove = (e) => {
        // Only run check if hero name is in or near viewport
        const heroRect = heroName.getBoundingClientRect();
        if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) {
            if (isVisible) hidePopup();
            return;
        }

        const onName = isPointOnName(e.clientX, e.clientY);

        if (onName) {
            if (!isVisible) {
                showPopup(e);
            } else {
                movePopup(e);
            }
        } else {
            if (isVisible) {
                hidePopup();
            }
        }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Immediate hide on scroll, keydown, or pointerdown outside
    window.addEventListener('scroll', () => {
        if (isVisible) hidePopup();
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isVisible) {
            hidePopup();
        }
    });

    document.addEventListener('pointerdown', (e) => {
        if (!isPointOnName(e.clientX, e.clientY)) {
            hidePopup();
        }
    });

    window.addEventListener('blur', () => {
        hidePopup();
    });

    document.addEventListener('mouseleave', () => {
        hidePopup();
    });
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


