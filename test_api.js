async function testFull() {
  const cats = await (await fetch('http://localhost:5000/api/categories')).json();
  console.log('✅ Categories fetched:', cats.length);
  const prods = await (await fetch('http://localhost:5000/api/products')).json();
  console.log('✅ Products fetched:', prods.length);
  
  // Test category filtering
  const filterCat = cats[0];
  const catProds = await (await fetch('http://localhost:5000/api/products?category_id=' + filterCat.id)).json();
  console.log('✅ Filter by ' + filterCat.name + ':', catProds.length, 'products');

  // Test search
  const searchProds = await (await fetch('http://localhost:5000/api/products?search=Apple')).json();
  console.log('✅ Search for "Apple":', searchProds.length, 'products');

  // Test single product
  const single = await (await fetch('http://localhost:5000/api/products/' + prods[0].id)).json();
  console.log('✅ Single Product:', single.title, '| ₹' + single.price);

  // Test placing order
  const orderRes = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 1,
      total_price: parseFloat(single.price),
      shipping_address: '123 Main Street, Bangalore, Karnataka - 560001',
      payment_method: 'Cash on Delivery',
      cartItems: [{ id: single.id, price: single.price, quantity: 1, title: single.title }]
    })
  });
  const orderData = await orderRes.json();
  console.log('✅ Place Order Response:', orderData);

  // Test get orders
  const allOrders = await (await fetch('http://localhost:5000/api/orders')).json();
  console.log('✅ Total Orders in DB:', allOrders.length, 'Latest Order Items count:', allOrders[0].items ? allOrders[0].items.length : 0);
}

testFull().catch(console.error);
