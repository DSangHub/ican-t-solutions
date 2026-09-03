function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.warn('[iCant] Service worker registration failed:', err);
        });
    });
}

function setupInstallPrompt() {
    let deferredPrompt = null;
    const banner = document.getElementById('pwa-install-banner');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (banner) banner.classList.remove('hidden');
    });

    const installBtn = document.getElementById('pwa-install-btn');
    const dismissBtn = document.getElementById('pwa-install-dismiss');

    installBtn?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        banner?.classList.add('hidden');
    });

    dismissBtn?.addEventListener('click', () => {
        banner?.classList.add('hidden');
        localStorage.setItem('icant_pwa_dismissed', '1');
    });

    if (localStorage.getItem('icant_pwa_dismissed') && banner) {
        banner.classList.add('hidden');
    }
}

function handleDeepLinks() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view && typeof showView === 'function') {
        setTimeout(() => showView(view), 300);
    }
}

function initPWA() {
    registerServiceWorker();
    setupInstallPrompt();
    handleDeepLinks();
}

window.initPWA = initPWA;
