/* Service Worker для офлайн-режима учебного календаря ДТ-660 */
const CACHE_NAME = 'dt660-calendar-v7';
const CORE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './app.js',
    './manifest.webmanifest',
    './icons/icon.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png',
    './assets/useful/matan/logarithms-1.png',
    './assets/useful/matan/logarithms-2.webp',
    './assets/useful/matan/logarithms-3.webp',
    './assets/useful/matan/trig-1.jpg',
    './assets/useful/matan/trig-2.png',
    './assets/useful/matan/trig-3.png',
    './assets/useful/matan/trig-4.jpeg'
];

// Установка: кэшируем основные файлы
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Активация: удаляем старые кэши
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// Запросы: сеть → кэш, при офлайне — из кэша
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    // Навигация: отдаём index.html из кэша, если сеть недоступна
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
                    return response;
                })
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Статика: сначала кэш, добираем сетью (stale-while-revalidate)
    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request).then((response) => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                }
                return response;
            }).catch(() => cached);

            return cached || network;
        })
    );
});
