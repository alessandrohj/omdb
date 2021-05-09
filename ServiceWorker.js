const version = 1;
let staticCache = `staticCache-${version}`;
let dynamicCache = `dynamicCache-${version}`;
let cacheSize = 65;
let DB = null;
let pageAssets = [
  './',
  './index.html',
  './css/main.css',
  './css/materialize.min.css',
  './js/main.js',
  './js/materialize.min.js',
  './img/No-Image.jpg',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v78/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];
let dynamicList = [];

//cache limit function
const limitCacheSize = (cacheName, size) =>{
  caches.open(cacheName)
  .then(cache=>{
    cache.keys()
    .then(keys=>{
      if(keys.length > size){
        cache.delete(keys[0])
        .then(limitCacheSize(cacheName, size))
      }
    })
  })
}

self.addEventListener('install', (ev) => {
  //install event - browser has installed this version
  console.log('service worker has been installed ', version, ev);
  // build cache
  ev.waitUntil(
      caches.open(staticCache)
      .then((cache) => {
        return cache.addAll(pageAssets);
      })
      .then(()=> {
        return self.skipWaiting();
      },
      (err) => {
        console.warn(`${err} - failed to update ${staticCache}.`);
    }
    )
      )
});

self.addEventListener('activate', (ev) => {
  // delete old versions of caches.
  ev.waitUntil(
      caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            if (cacheName != staticCache && cacheName != dynamicCache) {
              return true;
          }}).map(cacheName =>{
            return caches.delete(cacheName);
          })
        )
      })
  )
    });

self.addEventListener('fetch', (ev) => {
  //fetch event - web page is asking for an asset
// check if resource exists in cache. If it exists, return it, if not fetch it from network
  ev.respondWith(
    caches.match(ev.request)
    .then(response=>{
      return response || fetch(ev.request).then(fetchResponse =>{
        return caches.open(dynamicCache)
        .then(cache=>{
          cache.put(ev.request.url, fetchResponse.clone());
          limitCacheSize(dynamicCache, cacheSize);
          return fetchResponse;
        })
      })
    })
    .catch((err) =>{
      console.warn(err);
    })
  );
});