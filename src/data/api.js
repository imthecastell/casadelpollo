const API_URL = 'https://casadelpollo-backend.onrender.com';

async function apiFetch(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

export function getBranches() {
  return apiFetch(`${API_URL}/api/branches`);
}

export function getProductsByBranch(branchId) {
  return apiFetch(`${API_URL}/api/products/branch/${branchId}`);
}

export function createOrder(orderData) {
  return apiFetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
}

export function getDesign(branchId) {
  return apiFetch(`${API_URL}/api/design/${branchId}`);
}

export function getPromotions(branchId) {
  const query = branchId ? `?branch_id=${branchId}` : '';
  return apiFetch(`${API_URL}/api/promotions${query}`);
}

export function getBanners(tipo) {
  return apiFetch(`${API_URL}/api/banners?tipo=${tipo}`);
}

export function getSchedule(branchId) {
  const url = branchId
    ? `${API_URL}/api/schedule/${branchId}`
    : `${API_URL}/api/schedule`;
  return apiFetch(url);
}
