document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close menu on link click (for mobile)
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-up, .animate-left, .animate-right');
    animatedElements.forEach(el => observer.observe(el));

    // Video Thumbnail Click Handler
    document.querySelectorAll('.video-container').forEach(container => {
        container.addEventListener('click', function () {
            const videoId = this.getAttribute('data-video-id');
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            // Replace thumbnail with iframe
            this.innerHTML = '';
            this.appendChild(iframe);
        });
    });

    // ==========================================
    // E-commerce Logic
    // ==========================================

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const cartBtn = document.getElementById('cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCart = document.querySelector('.close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckout = document.querySelector('.close-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSummary = document.getElementById('checkout-items-summary');
    const finalTotalElement = document.getElementById('final-total');

    // Add to Cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');

            addItemToCart({ id, name, price, img, quantity: 1 });
            openCart();
        });
    });

    function addItemToCart(item) {
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push(item);
        }
        updateCart();
    }

    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    function updateQuantity(id, change) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeItemFromCart(id);
            } else {
                updateCart();
            }
        }
    }

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        renderCartCount();
        renderCartTotal();
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">السلة فارغة حالياً</p>';
            return;
        }

        cart.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('cart-item-row');
            div.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price} ر.س</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                </div>
                <img src="${item.img}" class="cart-item-img" alt="${item.name}">
                <div class="remove-item" onclick="removeItem('${item.id}')"><i class="fas fa-trash"></i></div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    function renderCartCount() {
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountElement.innerText = count;
    }

    function renderCartTotal() {
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        cartTotalElement.innerText = total + ' ر.س';
        finalTotalElement.innerText = total + ' ر.س';
    }

    // Modal Handling
    function openCart() {
        cartOverlay.classList.add('show');
    }

    function closeCartModal() {
        cartOverlay.classList.remove('show');
    }

    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    closeCart.addEventListener('click', closeCartModal);
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) closeCartModal();
    });

    // Checkout Handling
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('السلة فارغة!');
            return;
        }
        closeCartModal();
        renderCheckoutSummary();
        checkoutModal.classList.add('show');
    });

    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.remove('show');
    });

    function renderCheckoutSummary() {
        checkoutSummary.innerHTML = '';
        cart.forEach(item => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.marginBottom = '5px';
            div.innerHTML = `<span>${item.name} (x${item.quantity})</span><span>${item.price * item.quantity} ر.س</span>`;
            checkoutSummary.appendChild(div);
        });
    }

    // Payment Simulation
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Here you would integrate with Payment Gateway (Stripe, Paymob, etc.)
        // Example: Stripe.createToken(...) or Redirect to Payment Page

        const customerName = document.getElementById('customer-name').value;
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Simulation
        const btn = document.querySelector('.pay-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري المعالجة...';
        btn.disabled = true;

        setTimeout(() => {
            alert(`شكراً لك يا ${customerName}! \nتم استلام طلبك بقيمة ${total} ر.س بنجاح.\nسنتواصل معك قريباً لتأكيد الشحن.`);
            cart = [];
            updateCart();
            checkoutModal.classList.remove('show');
            btn.innerHTML = originalText;
            btn.disabled = false;

            // Redirect or show success page here
        }, 2000);
    });

    // Expose helpers to window for inline onclick handlers
    window.updateQty = (id, change) => updateQuantity(id, change);
    window.removeItem = (id) => removeItemFromCart(id);

    // Initial render
    updateCart();
});
