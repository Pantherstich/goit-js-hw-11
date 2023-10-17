import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';

import fetchPixybay from './apiPixaby';

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
refs.searchForm.addEventListener('submit', onSearch);

// let observer = new IntersectionObserver(onLoadMore, optionsObserver);
let currentPage = 0;
let searchQuery;
let lastItem;
let totalPages = 1;



async function onLoadMore(entries, observer) {
  for (const entry of entries) {
       if (totalPages > 1) {
        if (entry.isIntersecting) {
          try {
            const response = await fetchPixybay(searchQuery,currentPage)
            refs.gallery.insertAdjacentHTML('beforeend', createMarkup(response.data.hits));
            lightbox.refresh();
            const { height: cardHeight } =
            refs.gallery.firstElementChild.getBoundingClientRect();
            window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',});
            currentPage += 1;

            if (currentPage < totalPages) {
              lastItem = document.querySelector('.photo-card:last-child');
              observer.unobserve(entry.result);
              observer.observe(entry.lastItem);
            } else  observer.unobserve(entry.result);
            } catch (error) {console.log('error')} ;
            }
        };
      }
    }

async function onSearch (event){
event.preventDefault();
currentPage = 1;
searchQuery =refs.searchForm.elements.searchQuery.value;
const response = await fetchPixybay (searchQuery,currentPage)
const dataHits = response.data.hits;
if (searchQuery.trim() === ''){
          Notiflix.Notify.warning('Emty query, enter your reqest',
                                  {position: 'center-top',
                                  distance: '64px',
                                  borderRadius: '10px',});
          refs.gallery.innerHTML = '';
          return;
                             }

if (dataHits.length === 0){
          Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.',
                                  {position: 'center-top',
                                  distance: '64px',
                                  borderRadius: '30px',});
           refs.gallery.innerHTML = '';
          return;
                          }
          else {
refs.gallery.innerHTML = createMarkup(dataHits);
totalPages = Math.ceil(response.data.totalHits / 40);

Notiflix.Notify.info(
  `Hooray! We found ${response.data.totalHits} images.`,
  {
    position: 'center-top',
  distance: '64px',
  borderRadius: '10px',
}
);
infiniteScroll();
lightbox.refresh();
refs.searchForm.reset();
// observer.observe(response);


}

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
function infiniteScroll() {
  const observer = new IntersectionObserver(onLoadMore, optionsObserver);
  lastItem = document.querySelector('.photo-card:last-child');
  observer.observe(lastItem);
}