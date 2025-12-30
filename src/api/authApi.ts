import api from './client';

export function login(credentials: { email: string; password: string }) {
	return api.post('/users/signIn', credentials);
}

export function getProducts() {
	return api.get('/products');
}


export function updateFav(id: string | undefined) {
	return api.patch(`/products/${id}`);
}

export function getProductById(productId: string | undefined) {
	return api.get(`/products/${productId}`);
}

export function searchProducts(query : string) {
	return api.get(`/products/searchProducts?q=${query}`)
}

export const authApi = {
	login: (creds: { email: string; password: string }) => login(creds),
	me: () => api.get('/auth/me'),
};

export default authApi;
