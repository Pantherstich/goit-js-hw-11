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

let observer = new IntersectionObserver(onLoadMore, optionsObserver);
let currentPage = 1;
let searchQuery;


async function onLoadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;

        fetchPixybay(searchQuery,currentPage).then( response => {
        
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
currentPage = 1;
searchQuery =refs.searchForm.elements.searchQuery.value;
if (searchQuery.trim() === ''){
Notiflix.Notify.warning('Emty query, enter your reqest',
{position: 'center-top',
distance: '64px',
borderRadius: '10px',});
  refs.gallery.innerHTML = '';
return;
}

const response = await fetchPixybay (searchQuery,currentPage)
const dataHits = response.data.hits;

if (dataHits.length === 0){
Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.',
{position: 'center-top',
distance: '64px',

borderRadius: '30px',});
  refs.gallery.innerHTML = '';
return;
}
refs.gallery.innerHTML = createMarkup(dataHits);

Notiflix.Notify.info(
  `Hooray! We found ${response.data.totalHits} images.`,
  {
    position: 'center-top',
  distance: '64px',
  borderRadius: '10px',
}
);



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
