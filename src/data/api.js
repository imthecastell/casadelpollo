const API_URL = 'https://casadelpollo-backend.onrender.com';

export async function getBranches() {
  const res = await fetch(`${API_URL}/api/branches`);
  return res.json();
}

export async function getProductsByBranch(branchId) {
  const res = await fetch(`${API_URL}/api/products/branch/${branchId}`);
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return res.json();
}

export async function getDesign(branchId) {
  const res = await fetch(`${API_URL}/api/design/${branchId}`);
  return res.json();
}

export async function getPromotions(branchId) {
  const query = branchId ? `?branch_id=${branchId}` : '';
  const res = await fetch(`${API_URL}/api/promotions${query}`);
  return res.json();
}

export async function getBanners(tipo) {
  const res = await fetch(`${API_URL}/api/banners?tipo=${tipo}`);
  return res.json();
}

export async function getSchedule(branchId) {
  const url = branchId
    ? `${API_URL}/api/schedule/${branchId}`
    : `${API_URL}/api/schedule`;
  const res = await fetch(url);
  return res.json();
}