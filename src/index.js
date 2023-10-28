import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import {fetchPixybay} from './apiPixaby';

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
let per_page = 40;
let searchQuery="";



function onLoadMore(entries, observer) {
  entries.forEach((entry) => {
        if (entry.isIntersecting) {
            currentPage += 1;
            fetchPixybay(searchQuery,currentPage, per_page)
            .then(({hits, totalHits}) => {
            refs.gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
            lightbox.refresh();
          if (currentPage >= totalHits/per_page) {
              observer.unobserve(refs.result);
            }
          })
            .catch ((error) => console.log(error)) ;
            }
        });
      }

function onSearch (event){
event.preventDefault();
currentPage = 1;
refs.gallery.innerHTML = "";
observer.unobserve(refs.result);
searchQuery =refs.searchForm.elements.searchQuery.value.trim();
if (searchQuery === ''){
          Notiflix.Notify.warning('Emty query, enter your reqest',
                                  {position: 'center-top',
                                  distance: '64px',
                                  borderRadius: '10px',});
          return; }
fetchPixybay(searchQuery,currentPage, per_page)
.then(({hits, totalHits}) => {
    if (hits.length === 0){
          Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.',
                                  {position: 'center-top',
                                  distance: '64px',
                                  borderRadius: '30px',});
          return;
    }
refs.gallery.innerHTML = createMarkup(hits);
lightbox.refresh();
observer.observe(refs.result);
  })
.catch((error) => {
console.log(error);
Notiflix.Notify.failure(
  `Something went wrong. Please try again.`,
  {
    position: 'center-top',
  distance: '64px',
  borderRadius: '10px',
}
);});
};

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


window.addEventListener('scroll', toggleScrollToTopBtn);
function toggleScrollToTopBtn() {
  if (window.scrollY > 300) {
    scrollToTopBtn.style.display = 'block';
  } else {
    scrollToTopBtn.style.display = 'none';
  }
}

scrollToTopBtn.addEventListener('click', scrollToTop);

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}