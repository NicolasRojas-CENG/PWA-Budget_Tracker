const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    './index.html', './css/styles.css', './js/index.js',
    './js/idb.js', './manifest.json', './icons/icon-512x512.png',
    './icons/icon-384x384.png', './icons/icon-192x192.png',
    './icons/icon-152x152.png', './icons/icon-144x144.png',
    './icons/icon-128x128.png', './icons/icon-96x96.png',
    './icons/icon-72x72.png'
];

self.addEventListener('install', function (evit) {
    evit.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener('activate', function (evit) {
    evit.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('Deleting cache : ' + keyList[i] );
                    return caches.delete(keyList[i]);
                }
            }));
        })
    )
});

self.addEventListener('fetch', function (evit) {
    console.log('Fetch request : ' + evit.request.url);
    evit.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('Respond cache : ' + evit.request.url);
                return request
            } else {
                console.log('The file is not cached, now fetching the file: ' + evit.request.url);
                return fetch(evit.request)
            }

        })
    )
});