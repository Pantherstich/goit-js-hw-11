import axios from 'axios';

const API_KEY = '39907244-c493ee587f7162aad68ea1179';
const BASE_URL = 'https://pixabay.com/api/';

export default async function fetchPixybay (searchQuery,currentPage){
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