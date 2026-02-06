// DOM Elements
const splashScreen = document.getElementById('splashScreen');
const mainHeader = document.getElementById('mainHeader');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.getElementById('sidebar');
const closeMenu = document.getElementById('closeMenu');
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.sidebar-nav a, .logo');
const purchaseButtons = document.querySelectorAll('.btn-purchase');
const purchaseModal = document.getElementById('purchaseModal');
const closeModal = document.getElementById('closeModal');
const closeModalButton = document.getElementById('closeModalButton');
const modalServiceTitle = document.getElementById('modalServiceTitle');
const reviewForm = document.getElementById('reviewForm');
const loadUserReviewsBtn = document.getElementById('loadUserReviews');
const userReviewsList = document.getElementById('userReviewsList');
const allReviewsList = document.getElementById('allReviewsList');
const userEmailForReviews = document.getElementById('userEmailForReviews');

// Veriler
let reviews = [
    {
        id: 1,
        name: "Ahmet Yılmaz",
        email: "ahmet@example.com",
        content: "WhatsApp global numara satın aldım, çok hızlı ve sorunsuz bir şekilde aktive edildi. Teşekkürler ROXY STORE!",
        date: "2023-10-15",
        reply: "Değerli müşterimiz, geri bildiriminiz için teşekkür ederiz. Memnuniyetiniz bizim için önemli."
    },
    {
        id: 2,
        name: "Zeynep Kaya",
        email: "zeynep@example.com",
        content: "Instagram takipçi satın aldım, gerçekten kaliteli ve aktif takipçiler geldi. Fiyat performans açısından harika.",
        date: "2023-10-10",
        reply: "Zeynep Hanım, değerlendirmeniz için çok teşekkür ederiz. Kaliteli hizmet anlayışımızı sürdürmek için çalışıyoruz."
    }
];

// Uygulamayı başlat
function initApp() {
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        mainHeader.classList.add('visible');
        showPage('home');
        displayAllReviews();
        checkAdminStatus();
    }, 2000);
    
    setupEventListeners();
    loadDataFromLocalStorage();
}

// Event Listener'ları kur
function setupEventListeners() {
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.add('active');
    });
    
    closeMenu.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            sidebar.classList.remove('active');
            showPage(pageId);
            updateActiveNavLink(link);
        });
    });
    
    purchaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const service = button.getAttribute('data-service');
            const price = button.getAttribute('data-price');
            modalServiceTitle.textContent = `${service} - ${price}₺`;
            purchaseModal.classList.add('active');
        });
    });
    
    closeModal.addEventListener('click', () => {
        purchaseModal.classList.remove('active');
    });
    
    closeModalButton.addEventListener('click', () => {
        purchaseModal.classList.remove('active');
    });
    
    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) {
            purchaseModal.classList.remove('active');
        }
    });
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const reviewerName = document.getElementById('reviewerName').value;
            const reviewerEmail = document.getElementById('reviewerEmail').value;
            const reviewContent = document.getElementById('reviewContent').value;
            
            const newReview = {
                id: Date.now(),
                name: reviewerName,
                email: reviewerEmail,
                content: reviewContent,
                date: new Date().toLocaleDateString('tr-TR'),
                reply: ""
            };
            
            reviews.push(newReview);
            saveDataToLocalStorage();
            reviewForm.reset();
            alert('Değerlendirmeniz başarıyla gönderildi! Teşekkür ederiz.');
            
            if (userEmailForReviews && userEmailForReviews.value === reviewerEmail) {
                displayUserReviews(reviewerEmail);
            }
            
            displayAllReviews();
        });
    }
    
    if (loadUserReviewsBtn) {
        loadUserReviewsBtn.addEventListener('click', () => {
            const email = userEmailForReviews.value;
            if (!email) {
                alert('Lütfen e-posta adresinizi girin.');
                return;
            }
            displayUserReviews(email);
        });
    }
}

// Sayfa göster
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
}

// Aktif nav link güncelle
function updateActiveNavLink(clickedLink) {
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    clickedLink.classList.add('active');
    
    const pageId = clickedLink.getAttribute('data-page');
    const sidebarLink = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
    if (sidebarLink) {
        sidebarLink.classList.add('active');
    }
}

// İsim formatı
function formatNameForDisplay(fullName) {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
        return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return fullName;
}

// LocalStorage'dan veri yükle
function loadDataFromLocalStorage() {
    const storedReviews = localStorage.getItem('roxyStoreReviews');
    const storedProducts = localStorage.getItem('roxyStoreProducts');
    
    if (storedReviews) {
        reviews = JSON.parse(storedReviews);
    }
    
    if (storedProducts) {
        // Ürünleri yükle (ileride kullanılabilir)
    }
}

// LocalStorage'a veri kaydet
function saveDataToLocalStorage() {
    localStorage.setItem('roxyStoreReviews', JSON.stringify(reviews));
}

// Tüm değerlendirmeleri göster
function displayAllReviews() {
    if (!allReviewsList) return;
    
    allReviewsList.innerHTML = '';
    
    if (reviews.length === 0) {
        allReviewsList.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Henüz değerlendirme bulunmamaktadır.</p>';
        return;
    }
    
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review, true);
        allReviewsList.appendChild(reviewElement);
    });
}

// Kullanıcı değerlendirmelerini göster
function displayUserReviews(email) {
    if (!userReviewsList) return;
    
    userReviewsList.innerHTML = '';
    
    const userReviews = reviews.filter(review => review.email === email);
    
    if (userReviews.length === 0) {
        userReviewsList.innerHTML = '<p style="text-align: center;">Bu e-posta adresi ile yapılmış değerlendirme bulunamadı.</p>';
        return;
    }
    
    userReviews.forEach(review => {
        const reviewElement = createReviewElement(review, false);
        userReviewsList.appendChild(reviewElement);
    });
}

// Değerlendirme elementi oluştur
function createReviewElement(review, hideEmail = true) {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    const formattedName = hideEmail ? formatNameForDisplay(review.name) : review.name;
    
    reviewCard.innerHTML = `
        <div class="review-header">
            <div class="reviewer-name">${formattedName}</div>
            <div class="review-date">${review.date}</div>
        </div>
        <div class="review-content">${review.content}</div>
    `;
    
    if (review.reply) {
        const replyElement = document.createElement('div');
        replyElement.className = 'admin-reply';
        replyElement.innerHTML = `
            <div class="admin-reply-header">
                <i class="fas fa-reply"></i>
                <span>ROXY STORE Yanıtı</span>
            </div>
            <div>${review.reply}</div>
        `;
        reviewCard.appendChild(replyElement);
    }
    
    return reviewCard;
}

// Admin durumunu kontrol et
function checkAdminStatus() {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true' || 
                         sessionStorage.getItem('adminLoggedIn') === 'true';
    
    const adminEmail = localStorage.getItem('adminEmail') || 
                      sessionStorage.getItem('adminEmail');
    
    if (adminLoggedIn && adminEmail === 'hamitcanaktas5@gmail.com') {
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (adminMenuItem) {
            adminMenuItem.style.display = 'block';
        }
    }
}

// Admin uyarısı göster
function showAdminWarning() {
    if (!confirm('Admin paneline yönlendiriliyorsunuz. Devam etmek istiyor musunuz?')) {
        return false;
    }
    return true;
}

// Admin çıkışı
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminEmail');
    
    const adminMenuItem = document.getElementById('adminMenuItem');
    if (adminMenuItem) {
        adminMenuItem.style.display = 'none';
    }
    
    alert('Admin çıkışı yapıldı.');
}

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', initApp);

window.addEventListener('load', function() {
    checkAdminStatus();
});
// Admin panelinden gelen mesajları dinle
window.addEventListener('message', function(event) {
    if (event.data === 'adminLoggedIn') {
        checkAdminStatus();
    } else if (event.data === 'adminLoggedOut') {
        const adminMenuItem = document.getElementById('adminMenuItem');
        if (adminMenuItem) {
            adminMenuItem.style.display = 'none';
        }
    }
});

// Ana siteden admin verilerini yükleme
function loadAdminDataToSite() {
    // Duyuruları ana siteye yükleme (ileride kullanılabilir)
    const announcements = JSON.parse(localStorage.getItem('roxyAnnouncements') || '[]');
    const activeAnnouncements = announcements.filter(a => a.active);
    
    // İlanları ana siteye yükleme (ileride kullanılabilir)
    const products = JSON.parse(localStorage.getItem('roxyProducts') || '[]');
    
    // Değerlendirmeler zaten yükleniyor
    const reviews = JSON.parse(localStorage.getItem('roxyStoreReviews') || '[]');
    
    console.log('Admin verileri yüklendi:', {
        announcements: activeAnnouncements.length,
        products: products.length,
        reviews: reviews.length
    });
}

// Sayfa yüklendiğinde admin verilerini yükle
window.addEventListener('load', function() {
    loadAdminDataToSite();
});