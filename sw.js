// ===========================================

//A. CONFIGURACION INICIAL

const CACHE_NAME = 'cocktail-pwa-v5';

// 1. Recursos del App Shell (Cache Only)
const appShellAssets = [
    './index.html',
    './main.js',
    './styles/main.css',
    './scripts/app.js',
    './manifest.json',        
    './images/icons/192.png',  
    './images/icons/512.png'
];

// 2. JSON de Fallback para la API (usado cuando la red falla)
// 2. JSON de Fallback para la API (usado cuando la red falla)
const OFFLINE_COCKTAIL_JSON = {
    drinks: [{
        idDrink: "00000",
        strDrink: "🚫 ¡Sin Conexión ni Datos Frescos!",
        strTags: "FALLBACK",
        strCategory: "Desconectado",
        strInstructions: "No pudimos obtener resultados en este momento. Este es un resultado GENÉRICO para demostrar que la aplicación NO SE ROMPE. Intenta conectarte de nuevo.",
        strDrinkThumb: "https://via.placeholder.com/200x300?text=OFFLINE",
        strIngredient1: "Servicio Worker",
        strIngredient2: "Fallback JSON"
    }]
};

// ===========================================

// B. CICLO DE VIDA: INSTALACIÓN (PRECACHE)
// ======================================================

self.addEventListener('install', event => {
    console.log('[SW] ⚙️ Instalando y precacheando el App Shell...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // 1. Precacheo: Guardamos el App Shell
            return cache.addAll(appShellAssets);
        })
            .then(() => self.skipWaiting()) // Forzamos la activación
    );
});
self.addEventListener('activate', event => {
    console.log('[SW] 🚀 Service Worker Activado.');
    // Opcional: Limpieza de cachés antiguas aquí
    event.waitUntil(self.clients.claim());
});


// ======================================================
// C. CICLO DE VIDA: FETCH (ESTRATEGIAS)
// ======================================================
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // --- ESTRATEGIA 1: API (NETWORK-FIRST con Fallback) ---
    // (Esta parte estaba bien, solo la movemos arriba para más claridad)
    if (requestUrl.host === 'www.thecocktaildb.com' && requestUrl.pathname.includes('/search.php')) {
        console.log('[SW] 🔄 API: NETWORK-FIRST con Fallback a JSON Genérico.');
        event.respondWith(
            fetch(event.request) // Intentamos ir a la red primero
                .catch(() => {
                    // Si la RED FALLA, devolvemos el JSON de Fallback.
                    console.log('[SW] ❌ Fallo de red. Devolviendo JSON de Fallback.');
                    return new Response(JSON.stringify(OFFLINE_COCKTAIL_JSON), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
    // --- ESTRATEGIA 2: NETWORK-FIRST con FALLBACK de JSON (para la API)
    if (requestUrl.host === 'www.thecocktaildb.com' && requestUrl.pathname.includes('/search.php')) {
        console.log('[SW] 🔄 API: NETWORK-FIRST con Fallback a JSON Genérico.');
        event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log(`[SW] 🔒 Sirviendo desde caché: ${event.request.url}`);
                    return cachedResponse;
                }
                
                // Si no está en caché, ir a la red
                console.log(`[SW] 🌐 No en caché. Yendo a red: ${event.request.url}`);
                return fetch(event.request);
            })
            .catch(() => {
                // Este CATCH se activa si estamos OFFLINE y el recurso TAMPOCO estaba en caché.
                
                // Si la solicitud fallida era la NAVEGACIÓN principal (abrir la app),
                // debemos servir el 'index.html' como fallback para que la app cargue.
                if (event.request.mode === 'navigate') {
                    console.log('[SW] ↩️ Fallback de navegación: sirviendo index.html');
                    // './index.html' debe estar en tu 'appShellAssets' para que esto funcione.
                    return caches.match('./index.html');
                }
            })
        );
        return;
    }
    
    // Para todos los demás recursos (imágenes de la API, otros scripts),
    // se utiliza el comportamiento por defecto (ir a la red).
});