const APP = {
    base_URL: 'http://www.omdbapi.com/?type=movie&apikey=',
    API_KEY: '898dd5ab',
    results: null,
    dbVersion: 1,
    db: null,
    sw: null,
    selected: null,
    counter: 0,
    dbStore: 'movies',
    dbStoreSelection: 'selected',
    init: () => {
        APP.addListeners();
        APP.openDB();
        //TODO - activate SW
        // APP.worker();
    },
    addListeners () {
        document.getElementById('searchForm').addEventListener('submit', APP.search);
// FAB listener - add/remove movies from nominee list
      if(document.querySelector('.btn-floating')){
        let clicked = document.querySelectorAll('.btn-floating');
        clicked.forEach(button=>{
          if(button.classList.contains('add')){
          button.addEventListener('click', APP.select)
        } else {
          button.addEventListener('click', APP.remove);
        }
        })
    };
  
      let materialImages = document.querySelectorAll('.materialboxed');
      M.Materialbox.init(materialImages, {});

      document.getElementById('closeSearchBtn').addEventListener('click', ()=>{
        let search = document.getElementById('searchForm');
        search.reset();
      })

        //navigation listeners
        document.getElementById('searchForm').addEventListener('submit', APP.nav);
        document.getElementById('back').addEventListener('click', APP.nav);
        document.getElementById('goHome').addEventListener('click', APP.nav);
        document.getElementById('nav-title').addEventListener('click', APP.nav);
        let selection = document.getElementById('goToSelection');
        selection.addEventListener('click', APP.nav);
        selection.addEventListener('click', APP.getSelectionFromIDB);
    },
    nav: (ev) =>{
        let btn = ev.target;
        let target = btn.getAttribute("data-target");
        document.querySelector(".page.active").classList.remove("active");
        document.getElementById(target).classList.add("active");
    },
    search: (ev) => {
            ev.preventDefault();
            let searchInput = document.getElementById('search');
            let keyword = searchInput.value.trim();
            let key = keyword.toLowerCase();
            if (keyword) {
                APP.getDataFromIDB(APP.dbStore, key, ()=>{
                  let container = document.querySelector('#results');
                  container.innerHTML = '';
                  document.querySelector('.pre-content').classList.add('hide');
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
        APP.getSelectionFromIDB();
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
         }
       
         req.onerror = (err) =>{
           console.warn(err);
         }
     },
     getDataFromIDB: (DBStore, key, cb) => {
        let req = APP.db.transaction(DBStore, 'readonly')
         .objectStore(DBStore)
         .get(key);
     
       req.onsuccess = (ev) =>{
         if(req.result) {
             APP.results = req.result['results'].Search;
           cb(APP.results);
       } else {
            APP.fetchData(key);
       }
       
       req.onerror = (err) =>{
         console.warn(err);
       }
       
     }
    },
    getSelectionFromIDB: ()=>{
      let req = APP.db.transaction(APP.dbStoreSelection, 'readonly')
      .objectStore(APP.dbStoreSelection)
      .getAll();
  
    req.onsuccess = (ev) =>{
      let results = req.result;
      APP.selected = results.map(item=>{
        return item.results;
      })
      APP.buildSelectionList(APP.selected);
   }
    
    req.onerror = (err) =>{
      console.log('not found');
      console.warn(err);
    }
    },
    removeDataFromIDB: (key, dbStore)=>{
      let req = APP.db.transaction(dbStore, 'readwrite')
      .objectStore(dbStore)
      .delete(key);

      req.onsuccess = ()=>{
        APP.showCounting();
      }

    },
     buildList: (movies) => {
        //build the list of cards inside the current page
        let container = document.querySelector('#results');
          if (movies.length > 0) {
            let img = './img/No-Image.jpg';
            container.innerHTML = movies
              .map((obj) => {
                if (obj.Poster != "N/A") {
                  img = obj.Poster;
                }     
                return ` 
                <div class="col s12 m6 l3">
                  <div class="card movie hoverable large light-blue lighten-5" id='${obj.imdbID}'>
                    <div class="card-image">
                      <img class="responsive-img materialboxed" alt="movie poster" src=${img}>
                    </div>
                    <div class="card-content">
                    <a class="btn-floating add halfway-fab waves-effect waves-light" id='addButton'><i class="material-icons">add</i></a>
                    <a class="btn-floating remove halfway-fab waves-effect waves-light red hide" id='removeButton'><i class="material-icons">remove</i></a>
                    <h5>${obj.Title}</h5>
                    <p>Released: ${obj.Year}</p>
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
          };
          APP.addListeners();
          APP.updateList();
    },
    updateList: () => {
      let cards = document.querySelectorAll('.card');
      cards.forEach(item => {
        APP.selected.map(element => {
          let addButton = item.children[1].children[0];
          let removeButton = item.children[1].children[1];
          if (element.imdbID == item.getAttribute('id')){
           addButton.classList.add('hide');
           removeButton.classList.remove('hide');
          } 
        })
      })

    },
    buildSelectionList:(movies)=>{
        //build the list of cards inside the current page
        let container = document.querySelector('#selected');
        container.innerHTML = '';
          if (movies.length > 0) {
            container.innerHTML = movies
              .map((obj) => {
                let img = './img/No-Image.jpg';
                if (obj.Poster != "N/A") {
                  img = obj.Poster;
                }
                return ` 
                <div class="col s12 m6 l3">
                  <div class="card hoverable movie light-blue lighten-5 large" id='${obj.imdbID}'>
                    <div class="card-image">
                      <img class="responsive-img materialboxed" alt="movie poster" src=${img}>
                    </div>
                    <div class="card-content">
                    <a class="btn-floating remove halfway-fab waves-effect waves-light red"><i class="material-icons" id="removeButton">remove</i></a>
                    <h5>${obj.Title}</h5>
                    <p>Released: ${obj.Year}</p>
                    </div>
                  </div>
              </div>`;
              })
              .join('\n');
          } else {
            //no cards
            container.innerHTML = `
                <h3>No movie selected.</h3>`;
          }
          APP.addListeners();
    },
    select: (ev)=>{
        let movie = ev.target;
        let selected = movie.closest('.movie').getAttribute('id');
        const movieData = APP.results.find(element => element.imdbID === selected);
        if(APP.counter >= 0 && APP.counter < 5){
          APP.addDataToIDB(movieData, selected, APP.dbStoreSelection);
          APP.changeBtn(movie);
        }
        APP.showCounting();
    },
    changeBtn: (btn)=>{
      let button = btn.closest('.halfway-fab');
      let removeBtn = button.nextElementSibling
      if(button.classList.contains('add')){
        removeBtn = button.nextElementSibling;
        button.classList.add('hide');
        removeBtn.classList.remove('hide');
      } else {
        removeBtn = button.previousElementSibling;
        button.classList.add('hide');
        removeBtn.classList.remove('hide');
      }
    },
    remove: (ev)=>{
      let movie = ev.target;
      let clicked = movie.closest('.movie').getAttribute('id');
      const movieData = APP.selected.filter(element=> {
        return element.imdbID != clicked;
      });
      APP.selected = movieData;
      APP.addListeners();
      if(document.querySelector('#showResults').classList.contains('active')){
        APP.changeBtn(movie);
      }
      APP.removeDataFromIDB(clicked, APP.dbStoreSelection);
      APP.buildSelectionList(APP.selected);
  },
    showCounting: ()=>{
      let req = APP.db.transaction(APP.dbStoreSelection, 'readwrite')
      .objectStore(APP.dbStoreSelection);
      let countRequest = req.count();
      countRequest.onsuccess = function() {
          APP.counter = countRequest.result;
           let moviesCounter = document.querySelector('#moviesCounter');
          if(APP.counter > 0) {
            moviesCounter.textContent = APP.counter;
          } else {
            moviesCounter.textContent = '';
          }
          if(APP.counter === 5){
            M.toast({html: 'You already nominated 5 movies!', classes: 'rounded'})
          }
        }
    },
  worker: ()=>{
    if('serviceWorker' in navigator){
      window.addEventListener("load", function() {
      navigator.serviceWorker
      .register('./ServiceWorker.js', {
          scope: './',
      })
      .then( (reg)=> console.log('Service Worker registered.', reg))
      .catch((err)=> console.log('Service Worker not registered.', err))

      //listen for the latest sw
      navigator.serviceWorker.addEventListener('controllerchange', async ()=>{
        APP.sw = navigator.serviceWorker.controller;
      })
  })
}
  }
}

document.addEventListener('DOMContentLoaded', APP.init);