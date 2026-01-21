(function() {
    'use strict';

    const CONFIG = {
        mobileBreakpoint: 968,
        scrollThreshold: 50,
        animationDuration: 300,
        debounceDelay: 150
    };

    const utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        isMobile() {
            return window.innerWidth <= CONFIG.mobileBreakpoint;
        },

        isTouchDevice() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
    };

    class DropdownManager {
        constructor() {
            this.dropdowns = document.querySelectorAll('.dropdown');
            this.init();
        }

        init() {
            if (this.dropdowns.length === 0) return;

            this.dropdowns.forEach(dropdown => {
                const toggle = dropdown.querySelector('.dropdown-toggle') || dropdown.querySelector('a[role="button"]');
                if (!toggle) return;

                this.setupDropdown(dropdown, toggle);
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.dropdown')) {
                    this.closeAllDropdowns();
                }
            });
        }

        setupDropdown(dropdown, toggle) {
            if (!utils.isMobile()) {
                dropdown.addEventListener('mouseenter', () => {
                    this.openDropdown(dropdown);
                });

                dropdown.addEventListener('mouseleave', () => {
                    this.closeDropdown(dropdown);
                });

                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
            } else {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
            }

            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDropdown(dropdown);
                }
                if (e.key === 'Escape') {
                    this.closeDropdown(dropdown);
                }
            });
        }

        toggleDropdown(dropdown) {
            const isActive = dropdown.classList.contains('active');
            
            if (isActive) {
                this.closeDropdown(dropdown);
            } else {
                this.closeAllDropdowns();
                this.openDropdown(dropdown);
            }
        }

        openDropdown(dropdown) {
            dropdown.classList.add('active');
            const toggle = dropdown.querySelector('.dropdown-toggle') || dropdown.querySelector('a[role="button"]');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'true');
            }
        }

        closeDropdown(dropdown) {
            dropdown.classList.remove('active');
            const toggle = dropdown.querySelector('.dropdown-toggle') || dropdown.querySelector('a[role="button"]');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
            }
        }

        closeAllDropdowns() {
            this.dropdowns.forEach(dropdown => {
                this.closeDropdown(dropdown);
            });
        }
    }

    class MobileMenu {
        constructor() {
            this.menuToggle = document.getElementById('menuToggle');
            this.navLinks = document.getElementById('navLinks');
            this.body = document.body;
            this.overlay = null;
            this.isOpen = false;
            this.touchStartX = 0;
            this.touchStartY = 0;

            this.init();
        }

        init() {
            if (!this.menuToggle || !this.navLinks) return;

            this.createOverlay();
            this.bindEvents();
        }

        createOverlay() {
            this.overlay = document.getElementById('navOverlay');
            if (!this.overlay) {
                this.overlay = document.createElement('div');
                this.overlay.className = 'nav-overlay';
                this.overlay.id = 'navOverlay';
                this.overlay.setAttribute('aria-hidden', 'true');
                this.body.appendChild(this.overlay);
            }
        }

        bindEvents() {
            this.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            this.overlay.addEventListener('click', () => this.close());

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            });

            window.addEventListener('resize', utils.debounce(() => {
                if (!utils.isMobile() && this.isOpen) this.close();
            }, CONFIG.debounceDelay));

            this.navLinks.querySelectorAll('a:not(.dropdown-toggle):not([role="button"])').forEach(link => {
                link.addEventListener('click', () => {
                    if (utils.isMobile()) {
                        this.close();
                    }
                });
            });

            this.setupSwipeGesture();
        }

        setupSwipeGesture() {
            this.navLinks.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }, { passive: true });

            this.navLinks.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = touchEndX - this.touchStartX;
                const deltaY = Math.abs(touchEndY - this.touchStartY);

                if (deltaX > 80 && deltaY < 50) {
                    this.close();
                }
            }, { passive: true });
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.navLinks.classList.add('active');
            this.overlay.classList.add('active');
            this.body.style.overflow = 'hidden';
            
            this.menuToggle.setAttribute('aria-expanded', 'true');
            this.menuToggle.classList.add('active');
            this.updateIcon(true);
        }

        close() {
            if (!this.isOpen) return;

            this.isOpen = false;
            this.navLinks.classList.remove('active');
            this.overlay.classList.remove('active');
            this.body.style.overflow = '';
            
            this.menuToggle.setAttribute('aria-expanded', 'false');
            this.menuToggle.classList.remove('active');
            this.updateIcon(false);
        }

        updateIcon(isOpen) {
            const icon = this.menuToggle.querySelector('i');
            if (!icon) return;

            if (isOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }

    class HeaderScroll {
        constructor() {
            this.header = document.querySelector('header');
            this.scrolled = false;
            this.lastScroll = 0;
            
            this.init();
        }

        init() {
            if (!this.header) return;

            window.addEventListener('scroll', utils.debounce(() => {
                this.handleScroll();
            }, 10), { passive: true });
        }

        handleScroll() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > CONFIG.scrollThreshold) {
                if (!this.scrolled) {
                    this.scrolled = true;
                    this.header.classList.add('scrolled');
                }
            } else {
                if (this.scrolled) {
                    this.scrolled = false;
                    this.header.classList.remove('scrolled');
                }
            }

            this.lastScroll = currentScroll;
        }
    }

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => this.handleClick(e, anchor));
            });
        }

        handleClick(e, anchor) {
            const href = anchor.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            this.scrollToTarget(target);
        }

        scrollToTarget(target) {
            const header = document.querySelector('header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    class LazyLoader {
        constructor() {
            this.init();
        }

        init() {
            if (!('IntersectionObserver' in window)) {
                this.loadAllImages();
                return;
            }

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        loadImage(img) {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            img.classList.add('loaded');
        }

        loadAllImages() {
            document.querySelectorAll('img[data-src]').forEach(img => {
                this.loadImage(img);
            });
        }
    }

    class Accessibility {
        constructor() {
            this.init();
        }

        init() {
            this.handleKeyboardNavigation();
            this.detectTouchDevice();
            this.setupFocusVisible();
        }

        handleKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('user-is-tabbing');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('user-is-tabbing');
            });
        }

        detectTouchDevice() {
            if (utils.isTouchDevice()) {
                document.body.classList.add('touch-device');
            }
        }

        setupFocusVisible() {
            const style = document.createElement('style');
            style.textContent = `
                .user-is-tabbing *:focus {
                    outline: 2px solid var(--accent-gold) !important;
                    outline-offset: 2px;
                }
                body:not(.user-is-tabbing) *:focus {
                    outline: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    class GeneralUI {
        constructor() {
            this.init();
        }

        init() {
            this.updateYear();
            this.setupExternalLinks();
        }

        updateYear() {
            const yearElement = document.getElementById('year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        }

        setupExternalLinks() {
            document.querySelectorAll('a[href^="http"]').forEach(link => {
                if (!link.hostname.includes(window.location.hostname)) {
                    link.setAttribute('rel', 'noopener noreferrer');
                    if (!link.hasAttribute('target')) {
                        link.setAttribute('target', '_blank');
                    }
                }
            });
        }
    }

    class PerformanceMonitor {
        constructor() {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                this.logPerformance();
            }
        }

        logPerformance() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = window.performance.timing;
                    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const connectTime = perfData.responseEnd - perfData.requestStart;
                    
                    console.log('Performance Metrics', pageLoadTime, connectTime);
                }, 0);
            });
        }
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startApp);
        } else {
            startApp();
        }
    }

    function startApp() {
        try {
            new DropdownManager();
            new MobileMenu();
            new HeaderScroll();
            new SmoothScroll();
            new LazyLoader();
            new Accessibility();
            new GeneralUI();
            new PerformanceMonitor();
        } catch (error) {
            console.error('Erro ao inicializar:', error);
        }
    }

    init();

})();
allCards.sort((a, b) => {
    const dateA = a.querySelector('time')?.getAttribute('datetime');
    const dateB = b.querySelector('time')?.getAttribute('datetime');
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return new Date(dateB) - new Date(dateA);
});
const cardsInGrid = blogGrid.querySelectorAll('.blog-card');
cardsInGrid.forEach(card => card.remove());
for (let i = start; i < end && i < allCards.length; i++) {
    blogGrid.appendChild(allCards[i]);
}