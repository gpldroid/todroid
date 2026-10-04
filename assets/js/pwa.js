/**
 * Web2App Studio Pro - PWA & Service Worker Support
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(
      (registration) => console.log('ServiceWorker registered:', registration),
      (error) => console.log('ServiceWorker registration failed:', error)
    );
  });
}

// Install PWA prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) installBtn.style.display = 'block';
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed');
      }
      deferredPrompt = null;
    });
  }
}

window.installPWA = installPWA;
