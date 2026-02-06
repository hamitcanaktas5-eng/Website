// Admin Panel JavaScript - DÜZELTİLMİŞ
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elementleri
    const loginContainer = document.getElementById('loginContainer');
    const adminContainer = document.getElementById('adminContainer');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const announcementForm = document.getElementById('announcementForm');
    const productForm = document.getElementById('productForm');
    const announcementsTable = document.getElementById('announcementsTable');
    const productsTable = document.getElementById('productsTable');
    const adminReviewsList = document.getElementById('adminReviewsList');
    
    // Admin bilgileri
    const ADMIN_EMAIL = 'hamitcanaktas5@gmail.com';
    const ADMIN_PASSWORD = 'hamitcan3124';

    // Sayfa yüklendiğinde giriş durumunu kontrol et
    checkLoginStatus();

    // Giriş formu
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Giriş başarılı
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminEmail', email);
            
            showAdminPanel();
            loadAllData();
            showMessage('Başarılı giriş! Admin paneline hoş geldiniz.', 'success');
            
            // Ana sayfadaki admin linkini güncellemek için
            setTimeout(() => {
                if (window.opener) {
                    window.opener.postMessage('adminLoggedIn', '*');
                }
            }, 500);
        } else {
            showMessage('Hatalı e-posta veya şifre!', 'error');
        }
    });

    // Çıkış butonu
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminEmail');
        showLoginPanel();
        showMessage('Başarıyla çıkış yapıldı', 'info');
        
        // Ana sayfadaki admin linkini kaldırmak için
        if (window.opener) {
            window.opener.postMessage('adminLoggedOut', '*');
        }
    });

    // Giriş durumunu kontrol et
    function checkLoginStatus() {
        const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const adminEmail = localStorage.getItem('adminEmail');
        
        if (adminLoggedIn && adminEmail === ADMIN_EMAIL) {
            showAdminPanel();
            loadAllData();
        } else {
            showLoginPanel();
        }
    }

    // Admin panelini göster
    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
    }

    // Giriş panelini göster
    function showLoginPanel() {
        loginContainer.style.display = 'flex';
        adminContainer.style.display = 'none';
    }

    // Tüm verileri yükle
    function loadAllData() {
        loadAnnouncements();
        loadProducts();
        loadReviews();
        updateStats();
    }

    // Mesaj göster
    function showMessage(message, type = 'info') {
        // Eski mesajı temizle
        const oldMessage = document.querySelector('.admin-message');
        if (oldMessage) oldMessage.remove();
        
        // Yeni mesaj oluştur
        const messageDiv = document.createElement('div');
        messageDiv.className = `admin-message admin-message-${type}`;
        messageDiv.textContent = message;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3 saniye sonra kaldır
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    // ========== DUYURU YÖNETİMİ ==========
    function loadAnnouncements() {
        if (!announcementsTable) return;
        
        const announcements = getAnnouncements();
        announcementsTable.innerHTML = '';
        
        if (announcements.length === 0) {
            announcementsTable.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 30px; color: #666;">
                        <i class="fas fa-bullhorn" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                        Henüz duyuru eklenmemiş.
                    </td>
                </tr>
            `;
            return;
        }
        
        // En yeniden eskiye sırala
        announcements.sort((a, b) => b.id - a.id);
        
        announcements.forEach(announcement => {
            const row = document.createElement('tr');
            
            // Türüne göre renk
            let typeClass = '';
            let typeText = '';
            switch(announcement.type) {
                case 'info': typeClass = 'badge-info'; typeText = 'Bilgi'; break;
                case 'warning': typeClass = 'badge-warning'; typeText = 'Uyarı'; break;
                case 'success': typeClass = 'badge-success'; typeText = 'Kampanya'; break;
                case 'danger': typeClass = 'badge-danger'; typeText = 'Önemli'; break;
                default: typeClass = 'badge-info'; typeText = 'Bilgi';
            }
            
            row.innerHTML = `
                <td>
                    <strong>${announcement.title}</strong>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${announcement.content.substring(0, 50)}...</div>
                </td>
                <td>
                    <span class="badge ${typeClass}">${typeText}</span>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${announcement.date}</div>
                </td>
                <td>
                    <button class="btn-action btn-edit" onclick="editAnnouncement(${announcement.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteAnnouncement(${announcement.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            announcementsTable.appendChild(row);
        });
    }

    // Duyuru ekleme formu
    if (announcementForm) {
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('announcementTitle').value.trim();
            const content = document.getElementById('announcementContent').value.trim();
            const type = document.getElementById('announcementType').value;
            
            if (!title || !content) {
                showMessage('Lütfen tüm alanları doldurun!', 'error');
                return;
            }
            
            const announcement = {
                id: Date.now(),
                title: title,
                content: content,
                type: type,
                date: new Date().toLocaleDateString('tr-TR'),
                active: true,
                createdAt: new Date().toISOString()
            };
            
            // Kaydet
            saveAnnouncement(announcement);
            
            // Formu temizle
            announcementForm.reset();
            
            // Listeyi yenile
            loadAnnouncements();
            updateStats();
            
            // Mesaj göster
            showMessage('Duyuru başarıyla eklendi!', 'success');
        });
    }

    // ========== İLAN YÖNETİMİ ==========
    function loadProducts() {
        if (!productsTable) return;
        
        const products = getProducts();
        productsTable.innerHTML = '';
        
        if (products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 30px; color: #666;">
                        <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                        Henüz ilan eklenmemiş.
                    </td>
                </tr>
            `;
            return;
        }
        
        // En yeniden eskiye sırala
        products.sort((a, b) => b.id - a.id);
        
        products.forEach(product => {
            const row = document.createElement('tr');
            
            // Kategori metni
            let categoryText = '';
            switch(product.category) {
                case 'virtual-numbers': categoryText = 'Sanal Numaralar'; break;
                case 'social-media': categoryText = 'Sosyal Medya'; break;
                default: categoryText = product.category;
            }
            
            // Durum badge
            let statusBadge = '';
            switch(product.status) {
                case 'active': statusBadge = '<span class="badge badge-success">Aktif</span>'; break;
                case 'inactive': statusBadge = '<span class="badge badge-warning">Pasif</span>'; break;
                case 'out-of-stock': statusBadge = '<span class="badge badge-danger">Stokta Yok</span>'; break;
                default: statusBadge = '<span class="badge badge-info">Aktif</span>';
            }
            
            row.innerHTML = `
                <td>
                    <strong>${product.name}</strong>
                    ${product.description ? `<div style="font-size: 0.85rem; color: #666; margin-top: 5px;">${product.description}</div>` : ''}
                </td>
                <td>${categoryText}</td>
                <td>
                    <strong>${product.price}₺</strong>
                    <div style="margin-top: 5px;">${statusBadge}</div>
                </td>
                <td>
                    <button class="btn-action btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            productsTable.appendChild(row);
        });
    }

    // İlan ekleme formu
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value.trim();
            const category = document.getElementById('productCategory').value;
            const price = document.getElementById('productPrice').value;
            const status = document.getElementById('productStatus').value;
            const description = document.getElementById('productDescription').value.trim();
            
            if (!name || !category || !price) {
                showMessage('Lütfen zorunlu alanları doldurun!', 'error');
                return;
            }
            
            const product = {
                id: Date.now(),
                name: name,
                category: category,
                price: parseInt(price),
                status: status,
                description: description,
                features: [],
                createdAt: new Date().toISOString()
            };
            
            // Kaydet
            saveProduct(product);
            
            // Formu temizle
            productForm.reset();
            
            // Listeyi yenile
            loadProducts();
            updateStats();
            
            // Mesaj göster
            showMessage('İlan başarıyla eklendi!', 'success');
        });
    }

    // ========== DEĞERLENDİRME YÖNETİMİ ==========
    function loadReviews() {
        if (!adminReviewsList) return;
        
        const reviews = getReviews();
        adminReviewsList.innerHTML = '';
        
        if (reviews.length === 0) {
            adminReviewsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 15px; display: block; opacity: 0.5;"></i>
                    <p>Henüz değerlendirme bulunmamaktadır.</p>
                </div>
            `;
            return;
        }
        
        // En yeniden eskiye sırala
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            // Yanıt var mı?
            const hasReply = review.reply && review.reply.trim() !== '';
            
            // Yanıt bölümü
            let replySection = '';
            if (hasReply) {
                replySection = `
                    <div class="review-reply">
                        <div class="review-reply-header">
                            <i class="fas fa-reply"></i>
                            <span>Sizin Yanıtınız</span>
                        </div>
                        <div>${review.reply}</div>
                        <button class="btn-action btn-edit" onclick="editReply(${review.id})" style="margin-top: 10px;">
                            <i class="fas fa-edit"></i> Yanıtı Düzenle
                        </button>
                    </div>
                `;
            }
            
            reviewItem.innerHTML = `
                <div class="review-header">
                    <div>
                        <div class="reviewer-name">${review.name}</div>
                        <div class="reviewer-email">${review.email}</div>
                    </div>
                    <div class="review-date">${review.date}</div>
                </div>
                <div class="review-content">${review.content}</div>
                
                ${!hasReply ? `
                    <div class="review-actions">
                        <button class="btn-action btn-reply" onclick="replyToReview(${review.id})">
                            <i class="fas fa-reply"></i> Yanıtla
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteReview(${review.id})">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                ` : `
                    <div class="review-actions">
                        <button class="btn-action btn-reply" onclick="replyToReview(${review.id})">
                            <i class="fas fa-edit"></i> Yanıtı Düzenle
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteReview(${review.id})">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </div>
                    ${replySection}
                `}
            `;
            
            adminReviewsList.appendChild(reviewItem);
        });
    }

    // İstatistikleri güncelle
    function updateStats() {
        const products = getProducts().length;
        const reviews = getReviews().length;
        const announcements = getAnnouncements().filter(a => a.active).length;
        const pendingReplies = getReviews().filter(r => !r.reply || r.reply.trim() === '').length;
        
        document.getElementById('totalProducts').textContent = products;
        document.getElementById('totalReviews').textContent = reviews;
        document.getElementById('activeAnnouncements').textContent = announcements;
        document.getElementById('pendingReplies').textContent = pendingReplies;
    }

    // ========== VERİ YÖNETİMİ FONKSİYONLARI ==========
    
    // LocalStorage'dan duyuruları al
    function getAnnouncements() {
        try {
            return JSON.parse(localStorage.getItem('roxyAnnouncements')) || [];
        } catch (e) {
            console.error('Duyurular yüklenirken hata:', e);
            return [];
        }
    }
    
    // LocalStorage'a duyuru kaydet
    function saveAnnouncement(announcement) {
        try {
            const announcements = getAnnouncements();
            announcements.push(announcement);
            localStorage.setItem('roxyAnnouncements', JSON.stringify(announcements));
            return true;
        } catch (e) {
            console.error('Duyuru kaydedilirken hata:', e);
            return false;
        }
    }
    
    // LocalStorage'dan ilanları al
    function getProducts() {
        try {
            return JSON.parse(localStorage.getItem('roxyProducts')) || [];
        } catch (e) {
            console.error('İlanlar yüklenirken hata:', e);
            return [];
        }
    }
    
    // LocalStorage'a ilan kaydet
    function saveProduct(product) {
        try {
            const products = getProducts();
            products.push(product);
            localStorage.setItem('roxyProducts', JSON.stringify(products));
            return true;
        } catch (e) {
            console.error('İlan kaydedilirken hata:', e);
            return false;
        }
    }
    
    // LocalStorage'dan değerlendirmeleri al
    function getReviews() {
        try {
            return JSON.parse(localStorage.getItem('roxyStoreReviews')) || [];
        } catch (e) {
            console.error('Değerlendirmeler yüklenirken hata:', e);
            return [];
        }
    }
    
    // LocalStorage'a değerlendirme kaydet
    function saveReview(review) {
        try {
            const reviews = getReviews();
            reviews.push(review);
            localStorage.setItem('roxyStoreReviews', JSON.stringify(reviews));
            return true;
        } catch (e) {
            console.error('Değerlendirme kaydedilirken hata:', e);
            return false;
        }
    }

    // ========== GLOBAL FONKSİYONLAR ==========
    
    // Duyuruyu düzenle
    window.editAnnouncement = function(id) {
        const announcements = getAnnouncements();
        const announcement = announcements.find(a => a.id === id);
        
        if (!announcement) {
            showMessage('Duyuru bulunamadı!', 'error');
            return;
        }
        
        const newTitle = prompt('Duyuru başlığını düzenleyin:', announcement.title);
        if (newTitle === null) return;
        
        const newContent = prompt('Duyuru içeriğini düzenleyin:', announcement.content);
        if (newContent === null) return;
        
        // Güncelle
        announcement.title = newTitle.trim();
        announcement.content = newContent.trim();
        
        // Kaydet
        localStorage.setItem('roxyAnnouncements', JSON.stringify(announcements));
        
        // Listeyi yenile
        loadAnnouncements();
        showMessage('Duyuru başarıyla güncellendi!', 'success');
    };
    
    // Duyuruyu sil
    window.deleteAnnouncement = function(id) {
        if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            return;
        }
        
        const announcements = getAnnouncements();
        const filteredAnnouncements = announcements.filter(a => a.id !== id);
        
        localStorage.setItem('roxyAnnouncements', JSON.stringify(filteredAnnouncements));
        
        loadAnnouncements();
  