import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import axios from 'axios';

async function fetchPixybay (){
  const params = new URLSearchParams ({
      key: API_KEY,
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: currentPage,
  });
  return axios.get(`${BASE_URL}?${params}`);
}

const lightbox = new SimpleLightbox('.gallery a', {
    close: false,
    showCounter: false,
    captionsData: 'alt',
    captionPosition: 'bottom'});

const optionsObserver = {
    root: null,
    rootMargin: '200px',
    threshold: 1.0,
};

const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    result: document.querySelector('.res-js')
};

const API_KEY = '39907244-c493ee587f7162aad68ea1179';
const BASE_URL = 'https://pixabay.com/api/';

refs.searchForm.addEventListener('submit', onSearch);

let observer = new IntersectionObserver(onLoadMore, optionsObserver);
let currentPage = 1;
let searchQuery;


async function onLoadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;

        fetchPixybay().then( response => {
          // Notiflix.Notify.info(
          //   `Hooray! We found ${response.data.totalHits - currentPage *40 } images.`
          // );

        refs.gallery.insertAdjacentHTML('beforeend', createMarkup(response.data.hits));
        lightbox.refresh();

        const { height: cardHeight } =
        refs.gallery.firstElementChild.getBoundingClientRect();
        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });

     if (currentPage * 40 >= response.data.totalHits) {
            observer.unobserve(refs.result);
          } else totalHitsNotify(response.data.totalHits - currentPage *40 )

  }).catch(error => console.log(error)) ;
}
  });
}


async function onSearch (event){
event.preventDefault();
let currentPage = 1;
searchQuery =refs.searchForm.elements.searchQuery.value;
if (searchQuery.trim() === ''){
Notiflix.Notify.warning('Emty query, enter your reqest',
{position: 'center-top',
distance: '64px',
borderRadius: '10px',});
return;
}

const response = await fetchPixybay ()
const dataHits = response.data.hits;

if (dataHits.length === 0){
Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.',
{position: 'center-top',
distance: '64px',

borderRadius: '30px',});
return;
}
refs.gallery.innerHTML = createMarkup(dataHits);
totalHitsNotify(response.data.totalHits);
lightbox.refresh();
observer.observe(refs.result);

refs.searchForm.reset();
}


function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => 
      `<div class="photo-card">
      <a class = "link" href="${largeImageURL}">
  <img class ="small-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
  </a>
</div>`
    )
    .join('');
}

function totalHitsNotify (totalHits){
Notiflix.Notify.info(
  `Hooray! We found ${totalHits} images.`
);
}