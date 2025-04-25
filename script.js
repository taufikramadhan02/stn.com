const menuItems = [
    {
        id: 1,
        name: "Beef Burger",
        category: "main",
        price: 8.99,
        image: "/api/placeholder/200/160"
    },
    {
        id: 2,
        name: "Chicken Wings",
        category: "sides",
        price: 6.99,
        image: "/api/placeholder/200/160"
    },
    {
        id: 3,
        name: "Caesar Salad",
        category: "sides",
        price: 5.99,
        image: "/api/placeholder/200/160"
    },
    {
        id: 4,
        name: "Chocolate Cake",
        category: "desserts",
        price: 4.99,
        image: "/api/placeholder/200/160"
    },
    {
        id: 5,
        name: "Orange Juice",
        category: "drinks",
        price: 2.99,
        image: "/api/placeholder/200/160"
    },
    {
        id: 6,
        name: "Spaghetti Bolognese",
        category: "main",
        price: 10.99,
        image: "/api/placeholder/200/160"
    },
    {
        id: 7,
        name: "Ice Cream",
        category: "desserts",
        price: 3.99,
        image: "/api/placeholder/200/160"
    },
    {
        id: 8,
        name: "Pizza Margherita",
        category: "main",
        price: 12.99,
        image: "/api/placeholder/200/160"
    }
];

// Cart data
let cart = [];
let currentCategory = "all";
let orderType = "takeaway";
let orderHistory = [];

// Load order history from localStorage if available
function loadOrderHistory() {
    const storedHistory = localStorage.getItem('orderHistory');
    if (storedHistory) {
        orderHistory = JSON.parse(storedHistory);
    }
}

// Save order history to localStorage
function saveOrderHistory() {
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}

// DOM Elements
const menuItemsContainer = document.getElementById('menu-items-container');
const cartCountEl = document.querySelector('.cart-count');
const cartTotalEl = document.querySelector('.cart-total');
const cartItemsList = document.getElementById('cart-items-list');
const modalTotalEl = document.getElementById('modal-total');
const cartModal = document.getElementById('cartModal');
const paymentModal = document.getElementById('paymentModal');
const successModal = document.getElementById('successModal');
const orderHistoryModal = document.getElementById('orderHistoryModal');
const orderDetailsModal = document.getElementById('orderDetailsModal');
const orderNumberEl = document.getElementById('order-number');
const orderBtns = document.querySelectorAll('.order-btn');
const categoryBtns = document.querySelectorAll('.category');
const orderHistoryList = document.getElementById('order-history-list');
const orderDetailsContent = document.getElementById('order-details-content');

// Initialize the page
function init() {
    // Load order history
    loadOrderHistory();
    
    // Render menu
    renderMenu();
    
    // Add event listeners to order type buttons
    orderBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            orderBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            orderType = btn.dataset.type;
        });
    });
    
    // Add event listeners to category buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderMenu();
        });
    });
    
    // Add event listeners to payment options
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;
        });
    });
    
    // Format card number with spaces
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (value.length > 0) {
                value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
            }
            e.target.value = value;
        });
    }
    
    // Format expiry date with slash
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
}

// Render menu items
function renderMenu() {
    menuItemsContainer.innerHTML = '';
    
    const filteredItems = currentCategory === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === currentCategory);
        
    filteredItems.forEach(item => {
        const menuItemEl = document.createElement('div');
        menuItemEl.className = 'menu-item';
        menuItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-info">
                <div class="menu-item-title">${item.name}</div>
                <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                <div class="menu-item-action">
                    <button class="add-to-cart" onclick="addToCart(${item.id})">Add to Cart</button>
                </div>
            </div>
        `;
        menuItemsContainer.appendChild(menuItemEl);
    });
}

// Add item to cart
function addToCart(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;
    
    const cartItem = cart.find(cartItem => cartItem.id === itemId);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCart();
}

// Update cart UI
function updateCart() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    cartCountEl.textContent = totalItems;
    cartTotalEl.textContent = `Total: $${totalPrice.toFixed(2)}`;
    modalTotalEl.textContent = `$${totalPrice.toFixed(2)}`;
    
    renderCartItems();
}

// Render cart items in modal
function renderCartItems() {
    cartItemsList.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cart.forEach(item => {
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <div>
                <div>${item.name}</div>
                <div>$${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
            </div>
        `;
        cartItemsList.appendChild(cartItemEl);
    });
}

// Increase item quantity
function increaseQuantity(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    if (cartItem) {
        cartItem.quantity++;
        updateCart();
    }
}

// Decrease item quantity
function decreaseQuantity(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    if (cartItem) {
        cartItem.quantity--;
        if (cartItem.quantity === 0) {
            cart = cart.filter(item => item.id !== itemId);
        }
        updateCart();
    }
}

// Open cart modal
function openCartModal() {
    renderCartItems();
    cartModal.style.display = 'block';
}

// Close cart modal
function closeCartModal() {
    cartModal.style.display = 'none';
}

// Proceed to payment
function proceedToPayment() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    closeCartModal();
    paymentModal.style.display = 'block';
}

// Close payment modal
function closePaymentModal() {
    paymentModal.style.display = 'none';
}

// Open order history modal
function openOrderHistory() {
    renderOrderHistory();
    orderHistoryModal.style.display = 'block';
}

// Close order history modal
function closeOrderHistory() {
    orderHistoryModal.style.display = 'none';
}

// Open order details modal
function openOrderDetails(orderId) {
    const order = orderHistory.find(order => order.id === orderId);
    if (!order) return;
    
    renderOrderDetails(order);
    orderDetailsModal.style.display = 'block';
}

// Close order details modal
function closeOrderDetails() {
    orderDetailsModal.style.display = 'none';
}

// Render order history
function renderOrderHistory() {
    orderHistoryList.innerHTML = '';
    
    if (orderHistory.length === 0) {
        orderHistoryList.innerHTML = '<div class="empty-history">No order history available</div>';
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orderHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedOrders.forEach(order => {
        const orderCardEl = document.createElement('div');
        orderCardEl.className = 'order-card';
        orderCardEl.onclick = () => openOrderDetails(order.id);
        
        const formattedDate = new Date(order.date).toLocaleString();
        
        orderCardEl.innerHTML = `
            <div class="order-card-header">
                <div class="order-id">${order.id}</div>
                <div class="order-date">${formattedDate}</div>
            </div>
            <div class="order-total">Total: $${order.total.toFixed(2)}</div>
            <div class="order-type-label">${order.orderType}</div>
        `;
        
        orderHistoryList.appendChild(orderCardEl);
    });
}

// Render order details
function renderOrderDetails(order) {
    orderDetailsContent.innerHTML = '';
    
    const formattedDate = new Date(order.date).toLocaleString();
    
    let statusClass = 'status-completed';
    if (order.status === 'Processing') {
        statusClass = 'status-processing';
    }
    
    orderDetailsContent.innerHTML = `
        <div class="order-info">
            <div>Order ID:</div>
            <div>${order.id}</div>
        </div>
        <div class="order-info">
            <div>Date:</div>
            <div>${formattedDate}</div>
        </div>
        <div class="order-info">
            <div>Order Type:</div>
            <div>${order.orderType}</div>
        </div>
        <div class="order-info">
            <div>Payment Method:</div>
            <div>${order.paymentMethod}</div>
        </div>
        <h3>Items</h3>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="order-item">
                    <div class="order-item-name">${item.name} x ${item.quantity}</div>
                    <div>$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        <div class="total">
            <span>Total:</span>
            <span>$${order.total.toFixed(2)}</span>
        </div>
        <div class="order-status ${statusClass}">
            Status: ${order.status}
        </div>
    `;
}

// Place order
// 

function placeOrder() {
    const cardName = document.getElementById('card-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;

    // Validasi sederhana
    if (!cardName || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill all payment details!');
        return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Please enter a valid card number!');
        return;
    }

    if (expiryDate.length !== 5) {
        alert('Please enter a valid expiry date (MM/YY)!');
        return;
    }

    if (cvv.length !== 3) {
        alert('Please enter a valid CVV!');
        return;
    }

    // Generate order number dan tanggal
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();

    // Simpan ke elemen modal sukses
    orderNumberEl.textContent = orderNumber;

    // Simpan ke riwayat
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.id || 'unknown';
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const newOrder = {
        id: orderNumber,
        date: now.toISOString(),
        orderType: orderType,
        paymentMethod: paymentMethod,
        items: [...cart],
        total: totalPrice,
        status: "Completed"
    };

    orderHistory.push(newOrder);
    saveOrderHistory();

    // Reset keranjang dan tampilkan modal sukses
    closePaymentModal();
    successModal.style.display = 'block';

    cart = [];
    updateCart();
}


// Close success modal
function closeSuccessModal() {
    successModal.style.display = 'none';
}


// Initialize when page loads
window.onload = init;

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target === cartModal) {
        closeCartModal();
    } else if (event.target === paymentModal) {
        closePaymentModal();
    } else if (event.target === successModal) {
        closeSuccessModal();
    }
};

// Simpan ke riwayat
const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.id || 'unknown';
const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

const newOrder = {
    id: orderNumber,
    date: now.toISOString(),
    orderType: orderType,
    paymentMethod: paymentMethod,
    items: [...cart],
    total: totalPrice,
    status: "Completed"
};

orderHistory.push(newOrder);
saveOrderHistory();

    closeSuccessModal();
    openOrderHistory();

// --- Login Logic ---
let currentUser = null;

function loadUser() {
    const savedUser = localStorage.getItem("user");
    if (savedUser) currentUser = JSON.parse(savedUser);
}

function saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

function logoutUser() {
    localStorage.removeItem("user");
    currentUser = null;
    alert("Logged out!");
    location.reload();
}

const loginModal = document.getElementById("loginModal");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

function openLoginModal() {
    loginModal.style.display = "block";
}

function closeLoginModal() {
    loginModal.style.display = "none";
}

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (email && password) {
        currentUser = { email };
        saveUser(currentUser);
        closeLoginModal();
        alert("Login successful!");
    } else {
        alert("Please enter email and password.");
    }
});

window.onload = function () {
    loadUser();
    init();
};

