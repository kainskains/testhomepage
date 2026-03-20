document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Loader Screen --- */
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 600); 
            }, 500); 
        });
    }

    /* --- 3. Typing Effect --- */
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const phrases = ["確かな品質をお届けする。", "社会に求められる製品を。", "皆様の生活を支える。"];
        let phraseIndex = 0;
        let letterIndex = 0;
        let isDeleting = false;
        
        function type() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentPhrase.substring(0, letterIndex - 1);
                letterIndex--;
            } else {
                typewriterElement.textContent = currentPhrase.substring(0, letterIndex + 1);
                letterIndex++;
            }
            
            let typingSpeed = isDeleting ? 50 : 150;
            
            if (!isDeleting && letterIndex === currentPhrase.length) {
                typingSpeed = 2000; 
                isDeleting = true;
            } else if (isDeleting && letterIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 500; 
            }
            
            setTimeout(type, typingSpeed);
        }
        setTimeout(type, 1000);
    }

    /* --- 4. Parallax Effect --- */
    const parallaxContent = document.querySelector('.parallax-content');
    if (parallaxContent && window.innerWidth >= 900) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                parallaxContent.style.transform = `translateY(${scrollY * 0.4}px)`;
            }
        });
    }

    /* --- 5. FAQ Accordion --- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(faq => faq.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    /* --- 6. Existing Features --- */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
        if (window.scrollY > 50) navbar.classList.add('scrolled');
    }

    // Dark mode toggle removed

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            btn.textContent = '送信中...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            
            setTimeout(() => {
                contactForm.style.animation = 'fadeInPage 0.5s ease-out';
                contactForm.innerHTML = '<div class="success-message" style="text-align:center; padding: 40px 0;"><h3 class="gradient-text" style="margin-bottom:15px; font-size: 2rem;">送信完了しました！</h3><p>株式会社丸本へのお問い合わせありがとうございます。<br>担当者より通常2営業日以内にご連絡いたします。</p></div>';
            }, 1500);
        });
    }

    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            if (window.innerWidth < 900) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    });
});
