const CACHE_NAME = 'novaplayer-static-v1';
const APP_FILES = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './assets/favicon.svg',
    './assets/aesthetic.mp4',
    './assets/brush.otf',
    './assets/lofi.mp4',
    './assets/lofi.ttf',
    './assets/night.jpg',
    './assets/sky.jpg',
    './demo-song/Demo%20-%20Apocalypse.mp3'
].map(path => new URL(path, self.registration.scope).href);

const EXTERNAL_FILES = [
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Mono&display=swap',
    'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Courier+Prime:wght@400;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Courier+Prime:wght@400;700&family=Caveat:wght@400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js',
    'https://cdn.jsdelivr.net/npm/browser-id3-writer@4.4.0/dist/browser-id3-writer.min.js'
];

const EXTERNAL_HOSTS = new Set([
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net'
]);

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(APP_FILES);

        await Promise.all(EXTERNAL_FILES.map(async url => {
            try {
                const response = await fetch(url, { mode: 'no-cors' });
                if (response.ok || response.type === 'opaque') {
                    await cache.put(url, response);
                } else {
                    console.warn('Could not cache an external NovaPlayer resource:', url, response.status);
                }
            } catch (error) {
                console.warn('Could not cache an external NovaPlayer resource:', url, error);
            }
        }));

        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames
            .filter(name => name.startsWith('novaplayer-static-') && name !== CACHE_NAME)
            .map(name => caches.delete(name)));
        await self.clients.claim();
    })());
});

function isCacheableRequest(request, url) {
    if (request.method !== 'GET') return false;
    if (url.origin === self.location.origin) {
        return url.pathname.startsWith(new URL(self.registration.scope).pathname);
    }
    return EXTERNAL_HOSTS.has(url.hostname);
}

function isStaticUrl(url) {
    return /\.(?:html?|css|js|m?js|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|otf|mp4|mp3)$/i.test(url.pathname);
}

async function serveByteRange(request, cache) {
    const cached = await cache.match(new URL(request.url).href);
    if (!cached || cached.status !== 200) return null;

    const match = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) return null;

    const body = await cached.arrayBuffer();
    const length = body.byteLength;
    let start = match[1] ? Number(match[1]) : null;
    let end = match[2] ? Number(match[2]) : null;

    if (start === null) {
        const suffixLength = end;
        if (!suffixLength) return null;
        start = Math.max(length - suffixLength, 0);
        end = length - 1;
    } else {
        end = end === null ? length - 1 : Math.min(end, length - 1);
    }

    if (start >= length || start > end) {
        return new Response(null, {
            status: 416,
            headers: { 'Content-Range': `bytes */${length}`, 'Accept-Ranges': 'bytes' }
        });
    }

    const headers = new Headers(cached.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Range', `bytes ${start}-${end}/${length}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(body.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers });
}

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (!isCacheableRequest(request, url)) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        if (request.headers.has('range')) {
            const rangeResponse = await serveByteRange(request, cache);
            if (rangeResponse) return rangeResponse;
        } else {
            const cached = await cache.match(request);
            if (cached) return cached;
        }

        const response = await fetch(request);
        if (response.ok && isStaticUrl(url) && !request.headers.has('range')) {
            try {
                await cache.put(request, response.clone());
            } catch (error) {
                console.error('Could not store a NovaPlayer resource in the browser cache:', request.url, error);
            }
        }
        return response;
    })());
});
