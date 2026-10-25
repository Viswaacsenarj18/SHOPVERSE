/**
 * ShopVerse - Shared Core Functionality
 * Cart, Wishlist, User Session & Global UI Helpers
 */

// Auto-detect backend URL: Render in production, localhost for development
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://shopverse-bt3k.onrender.com/api';


// --- Cart Utilities ---
function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('shopverse_cart')) || [];
    return cart.filter(item => item && item.id && item.price);
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('shopverse_cart', JSON.stringify(cart));
  updateNavBadges();
}

function addToCart(product, quantity = 1, showToastMsg = true) {
  const cart = getCart();
  const index = cart.findIndex(item => String(item.id) === String(product.id));

  if (index > -1) {
    cart[index].quantity = (cart[index].quantity || 1) + quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      brand: product.brand || 'ShopVerse',
      image: product.image,
      category_name: product.category_name || '',
      quantity: quantity
    });
  }

  saveCart(cart);
  if (showToastMsg) {
    showToast(`✓ Added "${product.title}" to cart!`, 'success');
  }
}

function buyNow(product) {
  addToCart(product, 1, false);
  window.location.href = 'checkout.html';
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => String(item.id) !== String(productId));
  saveCart(cart);
  showToast('Item removed from cart', 'info');
}

function updateCartQuantity(productId, quantity) {
  let cart = getCart();
  const index = cart.findIndex(item => String(item.id) === String(productId));
  if (index > -1) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    cart[index].quantity = quantity;
    saveCart(cart);
  }
}

// --- Wishlist Utilities ---
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('shopverse_wishlist')) || [];
  } catch (e) {
    return [];
  }
}

function saveWishlist(wishlist) {
  localStorage.setItem('shopverse_wishlist', JSON.stringify(wishlist));
  updateNavBadges();
}

function toggleWishlist(product, element = null) {
  let wishlist = getWishlist();
  const index = wishlist.findIndex(item => String(item.id) === String(product.id));

  if (index > -1) {
    wishlist.splice(index, 1);
    if (element) element.classList.remove('active');
    showToast(`Removed from Wishlist`, 'info');
  } else {
    wishlist.push({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      brand: product.brand || 'ShopVerse',
      image: product.image
    });
    if (element) element.classList.add('active');
    showToast(`❤ Added to Wishlist!`, 'success');
  }

  saveWishlist(wishlist);
}

function isWishlisted(productId) {
  const wishlist = getWishlist();
  return wishlist.some(item => String(item.id) === String(productId));
}

// --- User Management ---
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
}

function logoutUser() {
  localStorage.removeItem('user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}

// --- UI Updates (Badges & User State) ---
function updateNavBadges() {
  const cart = getCart();
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const wishlist = getWishlist();
  const wishlistCount = wishlist.length;

  document.querySelectorAll('.cart-count-badge').forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'flex' : 'none';
  });

  document.querySelectorAll('.wishlist-count-badge').forEach(el => {
    el.textContent = wishlistCount;
    el.style.display = wishlistCount > 0 ? 'flex' : 'none';
  });
}

function renderUserNav() {
  const user = getCurrentUser();
  const userAuthSlot = document.getElementById('user-auth-slot');
  if (!userAuthSlot) return;

  if (user) {
    userAuthSlot.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1" type="button" data-bs-toggle="dropdown">
          <i class="fas fa-user-circle"></i>
          <span class="d-none d-md-inline font-weight-bold">My Account</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
          <li><h6 class="dropdown-header text-truncate" style="max-width: 200px;">${user.email || 'User Account'}</h6></li>
          <li><a class="dropdown-item" href="orders.html"><i class="fas fa-box-open me-2 text-primary"></i>My Orders</a></li>
          <li><a class="dropdown-item" href="wishlist.html"><i class="fas fa-heart me-2 text-danger"></i>My Wishlist</a></li>
          <li><a class="dropdown-item" href="cart.html"><i class="fas fa-cart-shopping me-2 text-success"></i>My Cart</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="logoutUser()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
        </ul>
      </div>
    `;
  } else {
    userAuthSlot.innerHTML = `
      <a href="login.html" class="btn btn-outline-primary rounded-pill px-3 py-1 me-2" style="font-weight: 600;">Login</a>
      <a href="signup.html" class="btn btn-primary rounded-pill px-3 py-1" style="font-weight: 600;">Sign Up</a>
    `;
  }
}

// --- Toast Notification Helper ---
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('shopverse-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'shopverse-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb';
  toast.style.cssText = `
    background: ${bg};
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    font-size: 0.9rem;
    font-weight: 600;
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  toast.innerHTML = message;
  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Setup search bar listener
function initGlobalSearch() {
  document.querySelectorAll('.global-search-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="text"]');
      if (input && input.value.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });
}

// Global auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateNavBadges();
  renderUserNav();
  initGlobalSearch();
});
