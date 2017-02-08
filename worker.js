/**
 * Module for service worker.
 *
 * @author mhammarstedt
 * @version 1.16.0
 */

"use strict";

let cacheName = "PWD-cache-v3";
let cacheFiles = [
    "./",
    "./index.html",
    "./stylesheet/style.css",
    "./javascript/build.js",
    "./image/memory/0.png",
    "./image/memory/1.png",
    "./image/memory/2.png",
    "./image/memory/3.png",
    "./image/memory/4.png",
    "./image/memory/5.png",
    "./image/memory/6.png",
    "./image/memory/7.png",
    "./image/memory/8.png"
];

/**
 * Handles install of the service worker.
 *
 * @returns cachedFiles
 */
self.addEventListener("install", function(event) {
    console.log("Service worker installed.");
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(cacheFiles);
        })
    );
});

/**
 * Handles activation of the service worker.
 *
 * @returns deletedCache
 */
self.addEventListener("activate", function(event) {
    console.log("Service worker activated.");

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.map((thisCacheName) => {
                if (thisCacheName !== cacheName) {
                    return caches.delete(thisCacheName);
                }
            }));
        })
    );
});

/**
 * Handles fetching for service worker.
 *
 * @returns response
 */
self.addEventListener("fetch", function(event) {
    console.log("Service worker fetching.", event.request.url);

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            let requestClone = event.request.clone();

            return fetch(requestClone).then((response) => {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }

                let responseClone = response.clone();

                caches.open(cacheName).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            }).catch((error) => {
                console.log("Error caching and fetching: ", error);
            });
        })
    );
});