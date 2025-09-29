// ===== VARIABLES GLOBALES =====
let isScrolling = false;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function() {
    initFAQ();
    initScrollAnimations();
    initButtonAnimations();
    initSmoothScrolling();
    initConfetti();
    initImageFallbacks();
});

// ===== FAQ ACCORDÉONS =====
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fermer tous les autres accordéons
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = '0';
                }
            });
            
            // Toggle l'accordéon actuel
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = '0';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// ===== ANIMATIONS AU SCROLL =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                
                // Animation spéciale pour les statistiques
                if (entry.target.classList.contains('stat-number')) {
                    animateNumber(entry.target);
                }
                
                // Animation en cascade pour les grilles
                if (entry.target.classList.contains('problem-grid') || 
                    entry.target.classList.contains('benefits-grid') || 
                    entry.target.classList.contains('features-grid')) {
                    animateGridItems(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observer tous les éléments à animer
    const elementsToAnimate = document.querySelectorAll(`
        .section-title,
        .problem-card,
        .benefit-card,
        .feature-card,
        .testimonial-card,
        .stat-item,
        .pricing-card,
        .faq-item,
        .hero-text,
        .hero-visual,
        .solution-text,
        .solution-visual
    `);
    
    elementsToAnimate.forEach(el => observer.observe(el));
}

// ===== ANIMATION DES NOMBRES =====
function animateNumber(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Formatage du nombre avec + ou % si nécessaire
        let displayValue = Math.floor(current).toString();
        if (element.textContent.includes('+')) {
            displayValue += '+';
        } else if (element.textContent.includes('%')) {
            displayValue += '%';
        }
        
        element.textContent = displayValue;
    }, 16);
}

// ===== ANIMATION EN CASCADE POUR LES GRILLES =====
function animateGridItems(grid) {
    const items = grid.children;
    Array.from(items).forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ===== ANIMATIONS DES BOUTONS =====
function initButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Animation hover
        button.addEventListener('mouseenter', () => {
            if (!button.disabled) {
                button.style.transform = 'scale(0.98)';
                button.style.opacity = '0.8';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.disabled) {
                button.style.transform = 'scale(1)';
                button.style.opacity = '1';
            }
        });
        
        // Animation click
        button.addEventListener('mousedown', () => {
            if (!button.disabled) {
                button.style.transform = 'scale(0.95) rotate(5deg)';
            }
        });
        
        button.addEventListener('mouseup', () => {
            if (!button.disabled) {
                button.style.transform = 'scale(0.98)';
            }
        });
        
        // Gestion des clics sur les CTA
        if (button.textContent.includes('Créer un compte école')) {
            button.addEventListener('click', handleSchoolSignup);
        } else if (button.textContent.includes('Découvrir la plateforme')) {
            button.addEventListener('click', handleDiscoverPlatform);
        }
    });
}

// ===== SCROLL FLUIDE =====
function initSmoothScrolling() {
    // Gestion des liens d'ancrage
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== CONFETTIS =====
function initConfetti() {
    // Fonction pour créer des confettis
    window.createConfetti = function() {
        const colors = ['#FF6B35', '#6C63FF', '#10B981', '#F59E0B'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            `;
            confettiContainer.appendChild(confetti);
        }
        
        // Nettoyer après l'animation
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);
    };
    
    // Ajouter les keyframes CSS pour l'animation des confettis
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== GESTION DES ACTIONS CTA =====
function handleSchoolSignup(e) {
    e.preventDefault();
    
    // Animation du bouton
    const button = e.target;
    const originalText = button.textContent;
    
    button.textContent = 'Chargement...';
    button.disabled = true;
    
    // Simulation d'une action (remplacer par vraie logique)
    setTimeout(() => {
        // Afficher les confettis
        createConfetti();
        
        // Message de succès
        showSuccessMessage('Félicitations ! Votre demande a été envoyée. Nous vous contacterons sous 24h.');
        
        // Restaurer le bouton
        button.textContent = originalText;
        button.disabled = false;
    }, 2000);
}

function handleDiscoverPlatform(e) {
    e.preventDefault();
    
    // Scroll vers la section solution
    const solutionSection = document.getElementById('solution');
    if (solutionSection) {
        solutionSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== MESSAGES DE SUCCÈS =====
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        animation: slideInRight 0.5s ease-out;
    `;
    messageDiv.textContent = message;
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.5s ease-out forwards';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 500);
    }, 5000);
}

// ===== OPTIMISATIONS PERFORMANCE =====
// Throttle pour les événements de scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Gestion du scroll pour les animations
window.addEventListener('scroll', throttle(() => {
    // Parallax léger pour le hero
    const hero = document.querySelector('.hero-section');
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
}, 16));

// ===== ACCESSIBILITÉ =====
// Gestion du clavier pour les accordéons FAQ
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target;
        if (target.classList.contains('faq-question')) {
            e.preventDefault();
            target.click();
        }
    }
});

// ===== PRÉCHARGEMENT DES RESSOURCES =====
function preloadResources() {
    // Précharger les polices Google Fonts
    const fontLink1 = document.createElement('link');
    fontLink1.rel = 'preload';
    fontLink1.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    fontLink1.as = 'style';
    
    const fontLink2 = document.createElement('link');
    fontLink2.rel = 'preload';
    fontLink2.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    fontLink2.as = 'style';
    
    document.head.appendChild(fontLink1);
    document.head.appendChild(fontLink2);
}

// Lancer le préchargement
preloadResources();

// ===== GESTION DES ERREURS =====
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
});

// ===== ANALYTICS & TRACKING =====
// Fonction pour tracker les interactions (à connecter avec votre solution d'analytics)
function trackEvent(eventName, properties = {}) {
    // Exemple avec Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Log pour le développement
    console.log('Event tracked:', eventName, properties);
}

// Tracker les clics sur les CTA
document.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.classList.contains('btn-primary')) {
        trackEvent('cta_click', {
            button_text: target.textContent,
            section: target.closest('section')?.id || 'unknown'
        });
    }
    
    if (target.classList.contains('faq-question')) {
        trackEvent('faq_click', {
            question: target.textContent
        });
    }
});

// ===== RESPONSIVE HELPERS =====
function isMobile() {
    return window.innerWidth <= 768;
}

function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

// Ajuster les animations selon la taille d'écran
window.addEventListener('resize', throttle(() => {
    const cards = document.querySelectorAll('.problem-card, .benefit-card, .feature-card');
    
    if (isMobile()) {
        // Désactiver certaines animations sur mobile pour les performances
        cards.forEach(card => {
            card.style.transition = 'transform 0.2s ease';
        });
    } else {
        cards.forEach(card => {
            card.style.transition = 'transform 0.3s ease';
        });
    }
}, 250));

// ===== LAZY LOADING POUR LES IMAGES (si ajoutées plus tard) =====
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialiser le lazy loading si nécessaire
initLazyLoading();

// ===== GESTION DES FALLBACKS D'IMAGES =====
function initImageFallbacks() {
    // Gérer les images qui ne se chargent pas
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            handleImageError(this);
        });
        
        // Vérifier si l'image est déjà en erreur
        if (img.complete && img.naturalWidth === 0) {
            handleImageError(img);
        }
    });
}

function handleImageError(img) {
    const src = img.src;
    const alt = img.alt;
    
    // Gérer les différents types d'images
    if (src.includes('hero-illustration.png')) {
        // Pour la hero image, créer un placeholder spécial
        createHeroFallback(img);
    } else if (src.includes('mockups/desktop-mockup.png')) {
        showFallbackElement(img, '.mockup-placeholder');
    } else if (src.includes('mockups/mobile-mockup.png')) {
        showFallbackElement(img, '.phone-frame');
    } else if (src.includes('screenshots/app-creation-exercise.png')) {
        showFallbackElement(img, '.mockup-window');
    } else if (src.includes('testimonials/')) {
        // Créer un avatar par défaut avec initiales
        createDefaultAvatar(img);
    } else if (src.includes('partner-schools/')) {
        showFallbackElement(img, '.logo-placeholder');
    } else if (src.includes('app-stores/')) {
        showFallbackElement(img, '.store-badge-fallback');
    } else if (src.includes('features/')) {
        // Masquer l'image SVG et garder l'emoji
        img.style.display = 'none';
    } else if (src.includes('social/')) {
        // Garder juste le fond coloré du lien social
        img.style.display = 'none';
    } else {
        // Fallback générique
        createGenericPlaceholder(img);
    }
}

function showFallbackElement(img, fallbackSelector) {
    const fallback = img.closest('section').querySelector(fallbackSelector);
    if (fallback) {
        img.style.display = 'none';
        fallback.style.display = 'block';
    }
}

function createDefaultAvatar(img) {
    const name = img.alt;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'author-avatar';
    avatarDiv.textContent = initials;
    avatarDiv.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: white;
        background: var(--accent-purple);
    `;
    
    img.parentNode.replaceChild(avatarDiv, img);
}

function createHeroFallback(img) {
    const heroContainer = img.closest('.hero-image-container');
    const placeholder = document.createElement('div');
    placeholder.className = 'hero-fallback';
    placeholder.style.cssText = `
        width: 100%;
        height: 400px;
        background: linear-gradient(135deg, var(--secondary-blue), var(--tertiary-blue));
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: var(--white);
        text-align: center;
        padding: var(--spacing-lg);
        box-shadow: var(--shadow-xl);
    `;
    
    placeholder.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: var(--spacing-md);">👨‍👩‍👧‍👦</div>
        <h3 style="font-family: var(--font-primary); font-size: 1.5rem; margin-bottom: var(--spacing-sm);">
            Construisons ensemble l'avenir éducatif
        </h3>
        <p style="opacity: 0.8;">Une plateforme qui unit parents, enseignants et élèves</p>
    `;
    
    img.parentNode.replaceChild(placeholder, img);
}

function createGenericPlaceholder(img) {
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
        width: ${img.width || 200}px;
        height: ${img.height || 150}px;
        background: var(--gray-300);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gray-600);
        font-size: 0.9rem;
        text-align: center;
        padding: 10px;
    `;
    placeholder.textContent = img.alt || 'Image non disponible';
    
    img.parentNode.replaceChild(placeholder, img);
}

console.log('🚀 Futur Génie - Scripts chargés avec succès!');
