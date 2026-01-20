/**
 * SCROLL REVEAL - ANIMAÇÕES FLUIDAS
 * Otimizado para Performance e Mobile
 * @version 2.0
 */

(function() {
    'use strict';

    // ===== CONFIGURAÇÕES =====
    const CONFIG = {
        threshold: 0.08,
        rootMargin: '0px 0px -80px 0px',
        animationDelay: 80,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // ===== CLASSE PRINCIPAL =====
    class ScrollReveal {
        constructor() {
            this.elements = new Map();
            this.observer = null;
            
            if (CONFIG.reducedMotion) {
                this.skipAnimations();
                return;
            }

            this.init();
        }

        init() {
            this.createObserver();
            this.revealElements();
            this.setupHeroAnimation();
        }

        createObserver() {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: CONFIG.threshold,
                    rootMargin: CONFIG.rootMargin
                }
            );
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.reveal(entry.target);
                }
            });
        }

        reveal(element) {
            // Aguarda um frame para animação suave
            requestAnimationFrame(() => {
                element.classList.add('revealed');
                this.observer.unobserve(element);
            });
        }

        skipAnimations() {
            // Para usuários com preferência de movimento reduzido
            document.querySelectorAll('.scroll-reveal').forEach(el => {
                el.classList.add('revealed');
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        }

        // ===== ELEMENTOS ESPECÍFICOS =====
        revealElements() {
            this.revealSectionTitles();
            this.revealCards();
            this.revealAboutSection();
            this.revealContactSection();
            this.revealFooter();
            this.revealCTA();
            this.revealSteps();
        }

        revealSectionTitles() {
            document.querySelectorAll('.section-title').forEach(title => {
                this.addReveal(title, 'fade-up');
            });
        }

        revealCards() {
            // Service Cards
            document.querySelectorAll('.service-card').forEach((card, index) => {
                this.addReveal(card, 'fade-up', index * CONFIG.animationDelay);
            });

            // Blog Cards
            document.querySelectorAll('.blog-card').forEach((card, index) => {
                this.addReveal(card, 'fade-up', index * CONFIG.animationDelay);
            });

            // Why Cards
            document.querySelectorAll('.why-card').forEach((card, index) => {
                this.addReveal(card, 'fade-up', index * CONFIG.animationDelay);
            });

            // Value Cards
            document.querySelectorAll('.value-card').forEach((card, index) => {
                this.addReveal(card, 'fade-scale', index * CONFIG.animationDelay);
            });

            // FAQ Items
            document.querySelectorAll('.faq-item').forEach((item, index) => {
                this.addReveal(item, 'fade-left', index * CONFIG.animationDelay);
            });
        }

        revealAboutSection() {
            // Imagem
            document.querySelectorAll('.about-img-wrapper').forEach(img => {
                this.addReveal(img, 'fade-left');
            });

            // Conteúdo
            document.querySelectorAll('.about-content').forEach(content => {
                this.addReveal(content, 'fade-right', 150);
            });

            // Stats
            document.querySelectorAll('.stat-item').forEach((stat, index) => {
                this.addReveal(stat, 'fade-up', index * CONFIG.animationDelay);
            });
        }

        revealContactSection() {
            // Info
            document.querySelectorAll('.contact-info-minimal').forEach(info => {
                this.addReveal(info, 'fade-left');
            });

            // Form
            document.querySelectorAll('.form-wrapper-minimal').forEach(form => {
                this.addReveal(form, 'fade-right', 150);
            });

            // Info items
            document.querySelectorAll('.info-item-minimal').forEach((item, index) => {
                this.addReveal(item, 'fade-up', index * CONFIG.animationDelay);
            });
        }

        revealFooter() {
            document.querySelectorAll('.footer-section').forEach((section, index) => {
                this.addReveal(section, 'fade-up', index * CONFIG.animationDelay);
            });
        }

        revealCTA() {
            document.querySelectorAll('.cta-banner .container > *').forEach((el, index) => {
                this.addReveal(el, 'slide-bottom', index * 100);
            });

            document.querySelectorAll('.blog-cta-content > *').forEach((el, index) => {
                this.addReveal(el, 'fade-up', index * 100);
            });
        }

        revealSteps() {
            document.querySelectorAll('.step-card').forEach((card, index) => {
                this.addReveal(card, 'fade-scale', index * 120);
            });
        }

        addReveal(element, animation, delay = 0) {
            element.classList.add('scroll-reveal', animation);
            
            if (delay > 0) {
                element.style.transitionDelay = `${delay}ms`;
            }

            this.observer.observe(element);
        }

        // ===== HERO ANIMATION =====
        setupHeroAnimation() {
            const hero = document.querySelector('.hero-content');
            if (!hero) return;

            // Initial state
            hero.style.opacity = '0';
            hero.style.transform = 'translateY(30px)';

            // Animate on load
            setTimeout(() => {
                hero.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                hero.style.opacity = '1';
                hero.style.transform = 'translateY(0)';
            }, 150);
        }
    }

    // ===== COUNTER ANIMATION =====
    class CounterAnimation {
        constructor() {
            this.init();
        }

        init() {
            const counters = document.querySelectorAll('[data-count]');
            if (counters.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-count'));
            const duration = 1500;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };

            updateCounter();
        }
    }

    // ===== PARALLAX OTIMIZADO =====
    class Parallax {
        constructor() {
            this.elements = document.querySelectorAll('.parallax');
            if (this.elements.length === 0 || window.innerWidth <= 968) return;

            this.init();
        }

        init() {
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.update();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }

        update() {
            const scrolled = window.pageYOffset;

            this.elements.forEach(element => {
                const speed = parseFloat(element.dataset.speed) || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }
    }

    // ===== TYPING EFFECT =====
    class TypingEffect {
        constructor() {
            this.elements = document.querySelectorAll('[data-typing]');
            if (this.elements.length === 0) return;

            this.init();
        }

        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.typeText(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            this.elements.forEach(element => {
                const text = element.textContent;
                element.textContent = '';
                element.dataset.originalText = text;
                observer.observe(element);
            });
        }

        typeText(element) {
            const text = element.dataset.originalText;
            const speed = parseInt(element.dataset.typingSpeed) || 40;
            let index = 0;

            const type = () => {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    setTimeout(type, speed);
                }
            };

            element.style.opacity = '1';
            type();
        }
    }

    // ===== INICIALIZAÇÃO =====
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    }

    function start() {
        new ScrollReveal();
        new CounterAnimation();
        new Parallax();
        new TypingEffect();

        console.log('%c🎬 Animações iniciadas', 'color: #D4AF37; font-size: 12px;');
    }

    // ===== ANIMATION STYLES =====
    const animationStyles = `
        .scroll-reveal {
            opacity: 0;
            transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .scroll-reveal.revealed {
            opacity: 1;
            transform: translateY(0);
        }

        .fade-up { transform: translateY(30px); }
        .fade-left { transform: translateX(-30px); }
        .fade-right { transform: translateX(30px); }
        .fade-scale { transform: scale(0.95); }
        .slide-bottom { transform: translateY(-30px); }
    `;

    // Injeta estilos se não existirem
    if (!document.getElementById('scroll-reveal-styles')) {
        const style = document.createElement('style');
        style.id = 'scroll-reveal-styles';
        style.textContent = animationStyles;
        document.head.appendChild(style);
    }

    init();

})();