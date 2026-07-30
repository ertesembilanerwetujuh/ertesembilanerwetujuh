importScripts("./version.js");

const CACHE_NAME = "cache-" + APP_VERSION;

// Hanya file inti
const CORE_FILES = [

    "./",
    "./index.html",
    "./offline.html",
    "./manifest.json"

];


// ================= INSTALL =================
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(CORE_FILES))

    );

});

// ================= ACTIVATE =================
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }

                })

            )

        )

    );

    self.clients.claim();

});

// ================= FETCH =================
self.addEventListener("fetch", event => {

    // hanya GET
    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request)

        .then(cacheResponse => {

            // jika sudah ada cache
            if (cacheResponse) {
                return cacheResponse;
            }

            // ambil dari internet
            return fetch(event.request)

            .then(networkResponse => {

                // simpan otomatis ke cache
                const clone = networkResponse.clone();

                caches.open(CACHE_NAME)

                .then(cache => {

                    cache.put(event.request, clone);

                });

                return networkResponse;

            })

            .catch(() => {

                // jika halaman HTML gagal dimuat
                if (event.request.mode === "navigate") {

                    return caches.match("./offline.html");

                }

            });

        })

    );

});



/* ================= UPDATE ================= */

self.addEventListener("message", event => {

    if (event.data?.type === "SKIP_WAITING") {

        self.skipWaiting();

    }

});