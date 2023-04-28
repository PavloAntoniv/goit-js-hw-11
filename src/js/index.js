import { PixabayAPI } from './PixabayAPI';
//
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.getElementById('search-form'),
  gallery: document.querySelector('.js-gallery'),
};

const pixabayApi = new PixabayAPI();

let lightbox = new SimpleLightbox('.gallery__link', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

refs.searchForm.addEventListener('submit', onRenderPage);

async function onRenderPage(e) {
  e.preventDefault();
  window.removeEventListener('scroll', handleScroll); // Відключення scroll
  //

  refs.gallery.innerHTML = '';

  const searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  pixabayApi.query = searchQuery;

  pixabayApi.resetPage();
  // pixabayApi.page = 1;

  if (searchQuery === '') {
    alertNoEmptySearch();
    return;
  }

  try {
    const response = await pixabayApi.fetchPhotosByQuery();
    const totalPicturs = response.data.totalHits;
    const hits = response.data.hits;

    if (totalPicturs === 0) {
      alertNoEmptySearch();
      return;
    }

    // createMarkup(response.data.hits);
    createMarkup(hits);
    lightbox.refresh();
    autoScroll();

    window.addEventListener('scroll', handleScroll); // Відновлення scroll

    if (hits.length < 40) {
      // alertEndOfSearch();
      window.removeEventListener('scroll', handleScroll);
      Notiflix.Notify.info(
        'We found less than 40 images. No more images will be loaded.'
      );
    }

    Notiflix.Notify.success(`Hooray! We found ${totalPicturs} images.`);
  } catch (err) {
    console.log(err);
  }
}

async function onLoadMore() {
  pixabayApi.page += 1;

  try {
    const response = await pixabayApi.fetchPhotosByQuery();

    const lastPage = Math.ceil(response.data.totalHits / pixabayApi.per_page);

    createMarkup(response.data.hits);

    lightbox.refresh();
    autoScroll();

    if (lastPage === pixabayApi.page) {
      alertEndOfSearch();
      window.removeEventListener('scroll', handleScroll);
      return;
    }
  } catch (err) {
    alertEndOfSearch();
  }
}

function createGalleryCard(hits) {
  return hits
    .map(
      hit => `
      <a class='gallery__link' href='${hit.largeImageURL}'>
        <div class='gallery-item' id='${hit.id}'>
          <img
            class='gallery-item__img'
            src='${hit.webformatURL}'
            alt='${hit.tags}'
            loading='lazy'
          />
          <div class='info'>
            <p class='info-item'><b>Likes</b>${hit.likes}</p>
            <p class='info-item'><b>Views</b>${hit.views}</p>
            <p class='info-item'><b>Comments</b>${hit.comments}</p>
            <p class='info-item'><b>Downloads</b>${hit.downloads}</p>
          </div>
        </div>
      </a>
    `
    )
    .join('');
}

function createMarkup(hits) {
  const markup = createGalleryCard(hits);
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure(
    'The search string cannot be empty. Please specify your search query.'
  );
}

function alertEndOfSearch() {
  Notiflix.Notify.warning(
    "We're sorry, but you've reached the end of search results."
  );
}

// Функція для бескінечного скролу
function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    onLoadMore();
  }
}

// Цей код дозволяє автоматично прокручувати сторінку на висоту 2 карток галереї, коли вона завантажується
function autoScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    // top: cardHeight * 2,
    top: cardHeight * 0,
    behavior: 'smooth',
  });
}
