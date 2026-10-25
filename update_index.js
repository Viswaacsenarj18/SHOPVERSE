const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Remove Stats section
content = content.replace(/<div class="row pt-3 mx-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '<!-- Removed stats section -->\n            </div>\n        </div>\n    </div>\n</div>');

// 2. Remove Static Product Grid and replace with dynamic
const staticGridRegex = /<!-- Static Product Grid -->[\s\S]*?<!-- Products End -->/m;
const dynamicGrid = `<!-- Dynamic Product Grid -->
<div class="container">
  <div class="row g-4" id="dynamic-products-container">
    <!-- Products will be loaded here dynamically by JavaScript -->
  </div>
</div>
<!-- Products End -->`;

content = content.replace(staticGridRegex, dynamicGrid);

// 3. Add Script to the end
const scriptToAdd = `
    <!-- Template Javascript -->
    <script src="js/main.js"></script>
    
    <script>
      async function fetchLatestProducts() {
        try {
          const res = await fetch('http://localhost:5000/api/products');
          const products = await res.json();
          const container = document.getElementById('dynamic-products-container');
          
          if (!products || products.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No products available at the moment.</p></div>';
            return;
          }

          let html = '';
          products.slice(0, 8).forEach(p => {
            html += \`
            <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
              <div class="card border-0 shadow h-100">
                <img src="\${p.image}" class="card-img-top" alt="\${p.title}" style="height: 250px; object-fit: cover;">
                <div class="card-body text-center bg-primary text-white d-flex flex-column justify-content-between">
                  <div>
                    <h5 class="card-title text-truncate" style="font-size: 1rem;" title="\${p.title}">\${p.title}</h5>
                    <p class="card-text mb-1"><i class="fa fa-store me-1"></i>\${p.brand || 'ShopVerse'}</p>
                    <p class="mb-2 fw-bold" style="font-size: 1.1rem;">₹\${p.price}</p>
                    <p class="mb-2" style="font-size: 0.8rem;">
                      \${p.stock > 0 ? '<span class="text-success bg-white px-2 rounded">In Stock</span>' : '<span class="text-danger bg-white px-2 rounded">Out of Stock</span>'}
                    </p>
                  </div>
                  <a href="detail.html?id=\${p.id}" class="btn btn-light text-primary mt-2 w-100">View Product</a>
                </div>
              </div>
            </div>
            \`;
          });
          container.innerHTML = html;
        } catch (err) {
          console.error('Error fetching products:', err);
          document.getElementById('dynamic-products-container').innerHTML = '<div class="col-12 text-center text-danger"><p>Failed to load products.</p></div>';
        }
      }

      document.addEventListener('DOMContentLoaded', fetchLatestProducts);
    </script>
`;

content = content.replace(/<!-- Template Javascript -->[\s\S]*?<script src="js\/main\.js"><\/script>/, scriptToAdd);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('index.html updated successfully');
