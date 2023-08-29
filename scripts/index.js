const searchForm = document.querySelector('#search-form');
const submitBtn = document.querySelector('#search-submit');
var cardsContainer = document.querySelector('#cards-container');
var movieInfoLabel = document.querySelector('#movie-info');
var cardDetails = document.querySelector('#card-details');
var notFound = document.querySelector('#not-found');
var apiKey = '9a0e2f9b';
var movies = {};
var movie = {};
const paginatorCount = 3;

async function searchMovies(url){
    movies = JSON.parse(await sendHTTPAsync(url));
    cardsContainer.innerHTML = "";
    cardDetails.innerHTML = "";
    cardDetails.style.display = 'none';
    paginator.style.display = 'none';
    movieInfoLabel.style.display = 'none';
    console.log('movies: ', movies);
    if(movies == undefined || movies == null || movies.Search == undefined){
        notFound.style.display = 'flex';
        setTimeout(() => {
            notFound.style.display = 'none';
        }, 2000);
    }
    else{
        let count = 0;
        for (let movie of movies.Search) {
            addCard(movie.Type, movie.Title, movie.Year, movie.Poster, movie.imdbID);
            count++;
            if(count>= paginatorCount){
                break;
            }
        }
        if(movies.Search.length>paginatorCount){
            currentPageNumber = 1;
            showPaginator();
        }
    }
}

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    let elements = extractElements(searchForm);
    let title = elements.name;
    let type = elements.select;
    let url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${title}&type=${type.toLowerCase()}`;
    searchMovies(url);
});

async function getMovies(url){
    let result = JSON.parse(await sendHTTPAsync(url));
    return result;
}

async function getMovie(url){
    result = JSON.parse(await sendHTTPAsync(url));
    return result;
}

function sendHTTP(onError, onSuccess, url, method = 'GET', data = {}){
    let req = new XMLHttpRequest;
    req.open(method, url);
    req.ontimeout = onError;
    req.onerror = onError;
    req.onload = () => {
        if(req.status >= 200 && req.status < 300){
            onSuccess(req.responseText);
        }
        else{
            onError();
        }
    };
    req.send(JSON.stringify(data));
}

function sendHTTPAsync(url, method='GET', data={}){
    return new Promise((resolve, reject) => {
        sendHTTP(reject, resolve, url, method, data);
    });
}

function addCard(type, title, year, imgSrc, imdbID){
    let card = document.createElement('div');
    card.className = 'card';
    let col1 = document.createElement('div');
    col1.className = 'col1';
    col1.innerHTML = `
    <img class="card-img" src="${imgSrc}" alt="картинка">
    `;
    let col2 = document.createElement('div');
    col2.className = 'col2';
    let cardType = document.createElement('p');
    cardType.className = 'card-type';
    cardType.innerHTML = `${type}`;
    let cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.innerHTML = `${title}`;
    let cardYear = document.createElement('p');
    cardYear.className = 'card-year';
    cardYear.innerHTML = `${year}`;
    let btn = document.createElement('button');
    btn.className = 'card-details-btn';
    btn.innerHTML = 'Details';
    btn.addEventListener('click', () => {
        let url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
        searchDetails(url);
    });
    col2.appendChild(cardType);
    col2.appendChild(cardTitle);
    col2.appendChild(cardYear);
    col2.appendChild(btn);

    card.appendChild(col1);
    card.appendChild(col2);
    cardsContainer.appendChild(card);
}

async function searchDetails(url){
    movie = await getMovie(url);
    addDetails(movie.Poster, movie.Title, movie.Released, movie.Genre, movie.Country, movie.Director, movie.Writer, movie.Actors, movie.Awards);
}

function addDetails(imgSrc, title, released, genre, country, director, writer, actors, awards){
    cardDetails.style.display = 'flex';
    movieInfoLabel.style.display = 'flex';
    cardDetails.innerHTML = `
        <div class="card-details-col1">
                <img class="card-details-img" src="${imgSrc}" alt="картинка">
            </div>
            <div class="card-details-col2">
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Title:</p>
                    <p class="card-detail-record-info">${title}</p>
                </div>
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Released:</p>
                    <p class="card-detail-record-info">${released}</p>
                </div>
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Genre:</p>
                    <p class="card-detail-record-info">${genre}</p>
                </div>
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Country:</p>
                    <p class="card-detail-record-info">${country}</p>
                </div>
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Director:</p>
                    <p class="card-detail-record-info">${director}</p>
                </div>
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Writer:</p>
                    <p class="card-detail-record-info">${writer}</p>
                </div>
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Actors:</p>
                    <p class="card-detail-record-info">${actors}</p>
                </div>
                <div class="card-detail-record">
                    <p class="card-detail-record-name">Awards:</p>
                    <p class="card-detail-record-info">${awards}</p>
                </div>
            </div>
        `;
}

function extractElements(form){
    const elements = Array.from(form.elements).filter(el => {
        return el.name!='';
    });
    let result = new FormData();

    for(let el of elements){
        result[el.name]=el.type == 'checkbox' ? el.checked : el.value;
    }

    return result;
}



var paginator = document.querySelector('#paginator');

function showPaginator(){
    paginator.style.display = 'flex';
    let buttonsNumber = numberofbuttons(movies.Search.length, paginatorCount);
    paginator.innerHTML = `
    <div class="paginator-btn"><<</div>
    `;
    for(let i=0; i<buttonsNumber; i++){
        paginator.innerHTML += `
    <div class="paginator-btn">${i+1}</div>
    `;
    }
    paginator.innerHTML += `
    <div class="paginator-btn">>></div>
    `;
    paginator.style.display = 'flex';
    markCurrentPageBtn();
}

function numberofbuttons(arrLength,num){
    return Math.ceil(arrLength/num)
}

var currentPageNumber = 0;

document.addEventListener('click', function(event){
    if([...event.target.classList].includes("paginator-btn")){
    let btnContent = event.target.textContent;
    console.log(btnContent);
    if(btnContent == '<<'){
        currentPageNumber--;
        if(currentPageNumber<1){
            currentPageNumber = 1;
        }
    } 
    else if(btnContent == '>>'){
        currentPageNumber++;
        if(currentPageNumber>numberofbuttons(movies.Search.length, paginatorCount)){
            currentPageNumber = numberofbuttons(movies.Search.length, paginatorCount);
        }
    }
    else{
        currentPageNumber = btnContent;
    }
    cardsContainer.innerHTML = "";
    for(let i = paginatorCount*(currentPageNumber - 1); i<paginatorCount*(currentPageNumber - 1) + paginatorCount; i++){
        if(movies.Search[i] != undefined){
            addCard(movies.Search[i].Type, movies.Search[i].Title, movies.Search[i].Year, movies.Search[i].Poster, movies.Search[i].imdbID);
        }
    }
    }else{
    console.log(event.target)
    }
    markCurrentPageBtn();
});

function markCurrentPageBtn(){
    let pageButtons = document.querySelectorAll('.paginator-btn');
    for(let btn of pageButtons){
        if(btn.textContent == currentPageNumber){
            btn.style.backgroundColor = 'lightgrey';
        }
        else{
            btn.style.backgroundColor = '#b09696';
        }
    }
}




