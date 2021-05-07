const APP = {
    base_URL: 'http://www.omdbapi.com/?apikey=',
    API_KEY: '898dd5ab',
    results: null,
    dbVersion: 1,
    db: null,
    counter: 0,
    dbStore: 'movies',
    dbStoreSelection: 'selected',
    init () {
        APP.addListeners();
        APP.openDB();
    },
    addListeners () {
        document.getElementById('searchForm').addEventListener('submit', APP.search);
        if(document.querySelector('.btn-floating')){
            let addButton = document.querySelectorAll('.btn-floating');
            addButton.forEach(button=>{
              button.addEventListener('click', APP.select);
            })
        }
        //navigation listeners
        document.getElementById('searchForm').addEventListener('submit', APP.nav);
        document.getElementById('goHome').addEventListener('click', APP.nav);
        document.getElementById('goToSelection').addEventListener('click', APP.nav);
        document.getElementById('nav-title').addEventListener('click', APP.nav);
    },
    nav: (ev) =>{
        let btn = ev.target;
        let target = btn.getAttribute("data-target");
        console.log("Navigate to", target);
        document.querySelector(".page.active").classList.remove("active");
        document.getElementById(target).classList.add("active");
    },
    search: (ev) => {
            ev.preventDefault();
            let searchInput = document.getElementById('search');
            let keyword = searchInput.value.trim();
            let key = keyword.toLowerCase();
            console.log(keyword);
            if (keyword) {
                APP.getDataFromIDB(APP.dbStore, key, ()=>{
                    APP.buildList(APP.results);
                  },
                  )}
     },
     fetchData: (keyword)=>{
        let url = APP.base_URL + APP.API_KEY + `&s=${keyword}`;
        fetch(url)
        .then(response=>{
            if(response.ok) return response.json()
            else {
                let msg = resp.statusText;
                throw new Error(`Could not fetch movies. ${msg}.`);
              }
        })
        .then(data=>{
            APP.results = data.Search;
            APP.buildList(APP.results);
            let key = keyword.toLowerCase()
            APP.addDataToIDB(data, key, APP.dbStore)
        })
     },
     openDB: ()=>{
        let req = window.indexedDB.open('shopify-challenge', APP.dbVersion);
        req.addEventListener('success', (ev) => {
        APP.db = ev.target.result;
        console.log('DB opened and upgraded as needed.', APP.db);
        APP.showCounting();
     },
     req.addEventListener('upgradeneeded', (ev) => {
        APP.db = ev.target.result;
        let oldVersion = ev.oldVersion;
        let newVersion = ev.newVersion || APP.db.version;
        console.log(`Upgrading DB from version ${oldVersion} to version ${newVersion}`);
        if (!APP.db.objectStoreNames.contains(APP.dbStore) || ! APP.db.objectStoreNames.contains(APP.dbStoreSelection)){
           APP.db.createObjectStore(APP.dbStore);
           APP.db.createObjectStore(APP.dbStoreSelection);
        }
        })
)
    },  
     addDataToIDB: (payload, key, dbStore)=>{
        let req = APP.db.transaction(dbStore, 'readwrite')
        .objectStore(dbStore)
        .put({results: payload, keyword: key}, key);
       
         req.onsuccess = (ev) =>{
           console.log('Object added to store')
         }
       
         req.onerror = (err) =>{
           console.warn(err);
           console.log('Object already exists')
         }
     },
     getDataFromIDB: (DBStore, key, cb) => {
        let req = APP.db.transaction(DBStore, 'readonly')
         .objectStore(DBStore)
         .get(key);
     
       req.onsuccess = (ev) =>{
         if(req.result) {
             console.log(req.result['results'].Search);
             APP.results = req.result['results'].Search;
           cb(APP.results);
       } else {
            APP.fetchData(key);
       }
       
       req.onerror = (err) =>{
         console.log('not found');
         console.warn(err);
       }
       
     }
    },
    removeDataFromIDB: (key, dbStore)=>{
      let req = APP.db.transaction(dbStore, 'readwrite')
      .objectStore(dbStore)
      .delete(key);

      req.onsuccess = ()=>{
        console.log(`${req} deleted`);
        APP.showCounting();
      }

    },
     buildList: (movies) => {
        //build the list of cards inside the current page
        let container = document.querySelector('#results');
        container.innerHTML = '';
          if (movies.length > 0) {
            container.innerHTML = movies
              .map((obj) => {
                // let img = './img/icon-512x512.png';
                if (obj.Poster != null) {
                  img = obj.Poster;
                }
                return ` 
                <div class="col s12 m6 l3">
                  <div class="card hoverable movie" id='${obj.Title}'>
                    <div class="card-image">
                      <img class="responsive-img" alt="movie poster" src=${img}>
                      <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons" id="addButton">add</i></a>
                    </div>
                    <div class="card-content">
                    <h5>${obj.Title}</h5>
                    <p>Released: ${obj.Year}</p>
                    </div>
                  </div>
              </div>`;
              })
              .join('\n');
              APP.addListeners();
          } else {
            //no cards
            container.innerHTML = `<div class="card hoverable">
              <div class="card-content">
                <h3 class="card-title activator"><span>No Content Available.</span></h3>
              </div>
            </div>`;
          }
    },
    select: (ev)=>{
        let movie = ev.target;
        let selected = movie.closest('.movie').getAttribute('id');
        const movieData = APP.results.find(element=> element = selected);
        APP.addDataToIDB(movieData, selected, APP.dbStoreSelection);
        APP.showCounting();
    },
    remove: (item) =>{
      // movie.innerHTML = 'add';
      // APP.removeDataFromIDB(item, APP.dbStoreSelection);
    },
    showCounting: ()=>{
      let req = APP.db.transaction(APP.dbStoreSelection, 'readwrite')
      .objectStore(APP.dbStoreSelection);
      let countRequest = req.count();
      countRequest.onsuccess = function() {
          APP.counter = countRequest.result;
           let moviesCounter = document.querySelector('#moviesCounter');
          moviesCounter.textContent = APP.counter;
        }
    }
}

document.addEventListener('DOMContentLoaded', APP.init);