const APP = {
    base_URL: 'http://www.omdbapi.com/?apikey=',
    API_KEY: '898dd5ab',
    results: null,
    dbVersion: 1,
    init () {
        APP.addListeners();
    },
    addListeners () {
        document.getElementById('searchForm').addEventListener('submit', APP.search);
    },
    search: (ev) => {
            ev.preventDefault();
            let searchInput = document.getElementById('search');
            let keyword = searchInput.value.trim();
            console.log(keyword);
            if (keyword) {
            APP.fetchData(keyword)
            }
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
            console.log(data.length);
            APP.results = [];
            APP.results.push(data);
            APP.buildList(APP.results);
        })
     },
     buildList: (movies) => {
        //build the list of cards inside the current page
        console.log(`show ${movies.length} cards`);
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