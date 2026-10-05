// PWA: регистрация service worker, установка приложения, офлайн-индикатор
(function () {
    'use strict';

    // --- Service Worker ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js')
                .then(function (reg) {
                    console.log('SW зарегистрирован, scope:', reg.scope);
                })
                .catch(function (err) {
                    console.warn('Не удалось зарегистрировать SW:', err);
                });
        });
    }

    // --- Офлайн/онлайн индикатор ---
    var banner = document.getElementById('offlineBanner');

    function updateOnlineState() {
        if (!banner) return;
        banner.hidden = navigator.onLine;
    }

    window.addEventListener('online', updateOnlineState);
    window.addEventListener('offline', updateOnlineState);
    updateOnlineState();

    // --- Кнопка «Установить» (beforeinstallprompt) ---
    var deferredPrompt = null;
    var installBtn = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.hidden = false;
    });

    if (installBtn) {
        installBtn.addEventListener('click', function () {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function (choice) {
                if (choice.outcome === 'accepted') {
                    installBtn.hidden = true;
                }
                deferredPrompt = null;
            });
        });
    }

    // Прячем кнопку, если приложение уже установлено
    window.addEventListener('appinstalled', function () {
        if (installBtn) installBtn.hidden = true;
        deferredPrompt = null;
    });

    // Если открыто как установленное PWA — кнопка не нужна
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true; // iOS Safari
    if (isStandalone && installBtn) {
        installBtn.hidden = true;
    }

    // --- Хеш-навигация: #deadlines открывает раздел дедлайнов ---
    function applyHashSection() {
        if (window.location.hash === '#deadlines') {
            var btn = document.querySelector('.nav-btn[data-section="deadlines"]');
            if (btn && typeof switchSection === 'function' && !document.getElementById('deadlines-section').classList.contains('active')) {
                btn.click();
            }
        }
    }

    window.addEventListener('hashchange', applyHashSection);
    // Ждём инициализации основного скрипта
    window.addEventListener('load', function () {
        setTimeout(applyHashSection, 150);
    });

    // --- Обновление theme-color под текущую тему ---
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        var syncThemeColor = function () {
            var isLight = document.documentElement.getAttribute('data-theme') === 'light';
            metaTheme.setAttribute('content', isLight ? '#ffffff' : '#e94560');
        };
        syncThemeColor();
        var observer = new MutationObserver(syncThemeColor);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
})();
