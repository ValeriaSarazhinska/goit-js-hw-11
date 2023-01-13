import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const key = '32755907-d4f027b877d70172cdb830bb2';
const URL = `https://pixabay.com/api/?key=${key}&q=`;
let page;
let query;
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
});

loadMoreButton.style.display = 'none';

loadMoreButton.addEventListener('click', async () => {
  const { hits, totalHits } = await getPhotos(query, page);

  if (Math.ceil(totalHits / 40) < page) {
    loadMoreButton.style.display = 'none';
    return Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
  if (!hits.length) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  Notify.info(`Hooray! We found ${totalHits} images.`);

  page += 1;
  gallery.innerHTML = '';
  gallery.insertAdjacentHTML('beforeend', createCardGalleryItems(hits));
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  loadMoreButton.style.display = 'none';
  page = 2;
  query = event.currentTarget.elements.searchQuery.value;
  const { hits } = await getPhotos(query);
  if (!hits.length) {
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  gallery.innerHTML = '';
  gallery.insertAdjacentHTML('beforeend', createCardGalleryItems(hits));
  lightbox.refresh();
  loadMoreButton.style.display = 'block';
});

async function getPhotos(query, page = 1) {
  try {
    const responce = await axios.get(
      `${URL}${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );
    return responce.data;
  } catch (error) {
    Notify.failure(error.message);
  }
}

function createCardGalleryItems(photos) {
  return photos
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
           <div class='photo-card'>
            <a class='gallery__item' href='${largeImageURL}'>
           <img src='${webformatURL}' alt='${tags}' loading='lazy' width='400' height='270'/>
           </a>
            <div class='info'>
              <p class='info-item'>
                <b>Likes</b> ${likes}
              </p>
              <p class='info-item'>
                <b>Views</b> ${views}
              </p>
              <p class='info-item'>
                <b>Comments</b> ${comments}
              </p>
              <p class='info-item'>
                <b>Downloads</b> ${downloads}
              </p>
            </div>
          </div>
`;
      }
    )
    .join('');
}
