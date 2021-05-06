const APP = {
    base_URL: 'http://www.omdbapi.com/?apikey=',
    API_KEY: '898dd5ab',
    results: null,
    dbVersion: 1,
    db: null,
    dbStore: 'movies',
    dbStoreSelection: 'selected',
    init () {
        APP.addListeners();
        APP.openDB();
    },
    addListeners () {
        document.getElementById('searchForm').addEventListener('submit', APP.search);
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
                //   APP.fetchData(key))
                  )}
     },
     fetchData: (keyword)=>{
        let url = APP.base_URL + APP.API_KEY + `&t=${keyword}`;
        fetch(url)
        .then(response=>{
            if(response.ok) return response.json()
            else {
                let msg = resp.statusText;
                throw new Error(`Could not fetch movies. ${msg}.`);
              }
        })
        .then(data=>{
            APP.results = [];
            APP.results.push(data);
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
             console.log(req.result);
             APP.results = [];
          APP.results.push(req.result['results']);
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
     buildList: (movies) => {
        //build the list of cards inside the current page
        let container = document.querySelector('#results');
          if (movies.length > 0) {
            container.innerHTML = movies
              .map((obj) => {
                // let img = './img/icon-512x512.png';
                if (obj.Poster != null) {
                  img = obj.Poster;
                }
                return ` <div class="row">
                <div class="col s12 m6 l4">
                  <div class="card">
                    <div class="card-image">
                      <img class="responsive-img" src=${img}>
                      <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a>
                    </div>
                    <div class="card-content">
                    <h5>${obj.Title}</h5>
                    <p>Released: ${obj.Released}</p>
                    <p>Awards: ${obj.Awards}</p>
                    <p>IMDB Rating: ${obj.imdbRating}/10</p>
                      <p>Plot: ${obj.Plot}.</p>
                    </div>
                  </div>
                </div>
              </div>`;
              })
              .join('\n');
          } else {
            //no cards
            container.innerHTML = `<div class="card hoverable">
              <div class="card-content">
                <h3 class="card-title activator"><span>No Content Available.</span></h3>
              </div>
            </div>`;
          }
      },

}

document.addEventListener('DOMContentLoaded', APP.init);