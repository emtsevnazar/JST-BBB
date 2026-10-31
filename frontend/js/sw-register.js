/* sw-register.js — Service Worker registration (было inline в index.html)
   v1.1.29: вынесено из <script> в head → отдельный defer файл.
   Регистрация SW не критична для FOUC — можно с defer.
*/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => console.log('[PWA] SW registered:', reg.scope))
      .catch((err) => console.warn('[PWA] SW registration failed:', err));
  });
}
