document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('products')) return;
  
    const productList = document.getElementById('productList');
    const searchBar = document.getElementById('searchBar');
    const categoryFilter = document.getElementById('categoryFilter');
  
    let allProducts = [];
  
    fetch('/api/products')
      .then(res => res.json())
      .then(products => {
        allProducts = products;
        populateCategories(products);
        renderProducts(products);
      });
  
    function populateCategories(products) {
      const categories = [...new Set(products.map(p => p.category))];
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
      });
    }
  
    function renderProducts(products) {
      productList.innerHTML = '';
      if (products.length === 0) {
        productList.textContent = 'No products found.';
        return;
      }
  
      products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${p.imageUrl}" alt="${p.name}" />
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p><strong>$${p.price.toFixed(2)}</strong></p>
          <p>Category: ${p.category}</p>
          <p>Stock: ${p.stock}</p>
        `;
        productList.appendChild(card);
      });
    }
  
    function filterProducts() {
      const search = searchBar.value.toLowerCase();
      const category = categoryFilter.value;
  
      const filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search);
        const matchesCategory = category === '' || p.category === category;
        return matchesSearch && matchesCategory;
      });
  
      renderProducts(filtered);
    }
  
    searchBar.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
  });
  