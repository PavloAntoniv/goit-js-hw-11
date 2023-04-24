import axios from 'axios';
// Збереження ключа API в окремому файлі змінних
import { KEY } from './api-key.js';

export class PixabayAPI {
  #BASE_URL = 'https://pixabay.com/api/';
  // #API_KEY = '35725736-1d55e9c3004cf0c0340b411f8';
  #query = '';

  constructor() {
    this.page = 1;
    this.per_page = 40;
  }

  fetchPhotosByQuery() {
    return axios.get(`${this.#BASE_URL}`, {
      params: {
        q: this.#query,
        page: this.page,
        per_page: this.per_page,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: ' true',
        key: KEY,
      },
    });
  }

  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.#query;
  }

  set query(newQuery) {
    this.#query = newQuery;
  }
}
