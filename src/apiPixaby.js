import axios from 'axios';



export async function fetchPixybay (searchQuery,page = 1, per_page){
    const API_KEY = '39907244-c493ee587f7162aad68ea1179';
    const BASE_URL = 'https://pixabay.com/api/';
    const params = new URLSearchParams ({
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: per_page,
        page: page,
    });
    const resp = await axios.get(`${BASE_URL}?${params}`);
    return resp.data;
  }