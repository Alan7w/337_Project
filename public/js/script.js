// Main JavaScript file for Tech E-commerce
document.addEventListener('DOMContentLoaded', function() {
  // Determine which page we're on
  const currentPath = window.location.pathname;
  
  if (currentPath === '/products' || currentPath === '/products/') {
      initProductsPage();
  }
  
  // Update cart count on all pages
  updateCartCount();
  
  // Common navigation features
  setupNavigation();
});

function setupNavigation() {
  // Check if user is logged in
  fetch('/api/user')
      .then(response => {
          // If logged in, show logged-in navigation
          if (response.ok) {
              document.querySelectorAll('.logged-out-nav').forEach(element => {
                  element.style.display = 'none';
              });
              document.querySelectorAll('.logged-in-nav').forEach(element => {
                  element.style.display = 'block';
              });
          } else {
              // If not logged in, show logged-out navigation
              document.querySelectorAll('.logged-in-nav').forEach(element => {
                  element.style.display = 'none';
              });
              document.querySelectorAll('.logged-out-nav').forEach(element => {
                  element.style.display = 'block';
              });
          }
      })
      .catch(error => {
          console.error('Error checking login status:', error);
      });
}

function updateCartCount() {
  // Only run this if the cartCount element exists
  const cartCountElement = document.getElementById('cartCount');
  if (!cartCountElement) return;
  
  fetch('/api/cart')
      .then(response => {
          if (!response.ok) {
              throw new Error('Not logged in or cart unavailable');
          }
          return response.json();
      })
      .then(data => {
          const itemCount = data.items.reduce((total, item) => total + item.qty, 0);
          cartCountElement.textContent = itemCount > 0 ? itemCount : '';
          cartCountElement.style.display = itemCount > 0 ? 'inline-block' : 'none';
      })
      .catch(error => {
          // Don't show errors for this - it's expected to fail when not logged in
          cartCountElement.style.display = 'none';
      });
}

function initProductsPage() {
  const productList = document.getElementById('productList');
  const searchBar = document.getElementById('searchBar');
  const searchButton = document.getElementById('searchButton');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  
  // Pagination state
  let allProducts = [];
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 8;
  
  // Fetch products
  fetchProducts();
  
  // Event listeners
  if (searchBar) {
      // Search on Enter key
      searchBar.addEventListener('keyup', function(event) {
          if (event.key === 'Enter') {
              filterAndDisplayProducts();
          }
      });
  }
  
  if (searchButton) {
      // Search on button click
      searchButton.addEventListener('click', filterAndDisplayProducts);
  }
  
  if (categoryFilter) {
      categoryFilter.addEventListener('change', filterAndDisplayProducts);
  }
  
  if (sortFilter) {
      sortFilter.addEventListener('change', filterAndDisplayProducts);
  }
  
  if (prevPageBtn) {
      prevPageBtn.addEventListener('click', goToPreviousPage);
  }
  
  if (nextPageBtn) {
      nextPageBtn.addEventListener('click', goToNextPage);
  }
  
  function fetchProducts() {
      fetch('/api/products')
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to load products');
              }
              return response.json();
          })
          .then(products => {
              allProducts = products;
              filteredProducts = [...products];
              populateCategories(products);
              filterAndDisplayProducts();
          })
          .catch(error => {
              console.error('Error:', error);
              if (productList) {
                  productList.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
              }
          });
  }
  
  // Populate category filter dropdown
  function populateCategories(products) {
      if (!categoryFilter) return;
      
      // Extract unique categories
      const categories = [...new Set(products.map(p => p.category))].sort();
      
      // Clear existing options except for the first one (All Categories)
      while (categoryFilter.options.length > 1) {
          categoryFilter.remove(1);
      }
      
      // Add options to select element
      categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categoryFilter.appendChild(option);
      });
  }
  
  // Filter and sort products, then update display
  function filterAndDisplayProducts() {
      const searchTerm = searchBar ? searchBar.value.toLowerCase() : '';
      const categoryValue = categoryFilter ? categoryFilter.value : '';
      const sortValue = sortFilter ? sortFilter.value : 'default';
      
      // Filter products
      filteredProducts = allProducts.filter(product => {
          const matchesSearch = searchTerm === '' || 
              product.name.toLowerCase().includes(searchTerm) || 
              product.description.toLowerCase().includes(searchTerm);
          
          const matchesCategory = categoryValue === '' || product.category === categoryValue;
          
          return matchesSearch && matchesCategory;
      });
      
      // Sort products
      filteredProducts.sort((a, b) => {
          switch(sortValue) {
              case 'name-asc':
                  return a.name.localeCompare(b.name);
              case 'name-desc':
                  return b.name.localeCompare(a.name);
              case 'price-asc':
                  return a.price - b.price;
              case 'price-desc':
                  return b.price - a.price;
              default:
                  return 0; // Keep original order
          }
      });
      
      // Reset to first page when filters change
      currentPage = 1;
      
      // Update display
      updateProductDisplay();
      updatePagination();
  }
  
  // Render products for the current page
  function updateProductDisplay() {
      if (!productList) return;
      
      // Calculate pagination indexes
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      productList.innerHTML = '';
      
      if (filteredProducts.length === 0) {
          productList.innerHTML = '<p class="no-results">No products found. Try a different search term or category.</p>';
          return;
      }
      
      paginatedProducts.forEach(product => {
          const productCard = document.createElement('div');
          productCard.className = 'product-card';
          
          const inStock = product.stock > 0;
          
          productCard.innerHTML = `
              <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='/images/placeholder.jpg'">
              <div class="product-info">
                  <h3>${product.name}</h3>
                  <p class="product-description">${product.description}</p>
                  <div class="product-meta">
                      <span class="product-price">$${product.price.toFixed(2)}</span>
                      <span class="product-category">${product.category}</span>
                  </div>
                  <p class="product-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
                      ${inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </p>
                  <button class="add-to-cart-btn" data-product-id="${product.id}" ${inStock ? '' : 'disabled'}>
                      ${inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
              </div>
          `;
          
          productList.appendChild(productCard);
      });
      
      // Add event listeners to "Add to Cart" buttons
      document.querySelectorAll('.add-to-cart-btn').forEach(button => {
          button.addEventListener('click', function() {
              const productId = parseInt(this.getAttribute('data-product-id'), 10);
              addToCart(productId);
          });
      });
  }
  
  // Update pagination controls
  function updatePagination() {
      if (!pageInfo || !prevPageBtn || !nextPageBtn) return;
      
      const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
      pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
      
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= totalPages;
  }
  
  // Go to previous page
  function goToPreviousPage() {
      if (currentPage > 1) {
          currentPage--;
          updateProductDisplay();
          updatePagination();
          // Scroll to top of product list
          productList.scrollIntoView({ behavior: 'smooth' });
      }
  }
  
  // Go to next page
  function goToNextPage() {
      const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
      if (currentPage < totalPages) {
          currentPage++;
          updateProductDisplay();
          updatePagination();
          // Scroll to top of product list
          productList.scrollIntoView({ behavior: 'smooth' });
      }
  }
  
  // Add item to cart
  function addToCart(productId) {
      fetch('/api/cart/add', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              productId: productId,
              qty: 1
          })
      })
      .then(response => {
          if (!response.ok) {
              if (response.status === 401) {
                  // Not logged in
                  window.location.href = '/auth/login?redirect=/products';
                  throw new Error('Please log in to add items to your cart');
              }
              return response.json().then(data => {
                  throw new Error(data.error || 'Failed to add product to cart');
              });
          }
          return response.json();
      })
      .then(data => {
          if (data.success) {
              showMessage('Product added to cart', 'success');
              updateCartCount();
          } else {
              showMessage(data.error || 'Failed to add product to cart', 'error');
          }
      })
      .catch(error => {
          console.error('Error:', error);
          showMessage(error.message || 'An error occurred. Please try again.', 'error');
      });
  }
}

// Helper function to show messages
function showMessage(message, type) {
  // Check if message box exists
  let messageBox = document.getElementById('messageBox');
  
  // If not, create one
  if (!messageBox) {
      messageBox = document.createElement('div');
      messageBox.id = 'messageBox';
      messageBox.className = 'message';
      document.body.appendChild(messageBox);
      
      // Style the message box
      messageBox.style.position = 'fixed';
      messageBox.style.top = '20px';
      messageBox.style.right = '20px';
      messageBox.style.padding = '10px 20px';
      messageBox.style.borderRadius = '5px';
      messageBox.style.zIndex = '1000';
  }
  
  // Set message and type
  messageBox.textContent = message;
  messageBox.className = 'message ' + type;
  messageBox.style.display = 'block';
  
  // Apply type-specific styles
  if (type === 'success') {
      messageBox.style.backgroundColor = '#d4edda';
      messageBox.style.color = '#155724';
      messageBox.style.border = '1px solid #c3e6cb';
  } else if (type === 'error') {
      messageBox.style.backgroundColor = '#f8d7da';
      messageBox.style.color = '#721c24';
      messageBox.style.border = '1px solid #f5c6cb';
  }
  
  // Hide message after 3 seconds
  setTimeout(function() {
      messageBox.style.display = 'none';
  }, 3000);
}

function renderProductCard(product) {
  return `
    <div class="product-card">
      <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='/images/placeholder.jpg'" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>Price: $${product.price.toFixed(2)}</p>
      <p>Stock: ${product.stock}</p>
    </div>
  `;
}
