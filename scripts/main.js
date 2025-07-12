// Hàm để chuẩn hóa văn bản
function normalizeText(text) {
    text = text.toLowerCase();
    text = text.replace(/\s+/g, ' ').trim();
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return text;
}

// Hàm khởi tạo các tính năng chung
document.addEventListener('DOMContentLoaded', () => {
    // --- Khởi tạo từ Config ---
    const logoIcon = document.getElementById('logo-icon');
    const logoTextSpan = document.getElementById('logo-text');
    const heroSection = document.getElementById('hero-section');

    if (logoIcon) logoIcon.className = AppConfig.LOGO_ICON_CLASS;
    if (logoTextSpan) logoTextSpan.textContent = AppConfig.LOGO_TEXT;
    if (heroSection) heroSection.style.backgroundImage = `url('${AppConfig.HERO_BACKGROUND_IMAGE}')`;


    // --- Logic cho Sidebar ---
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');

    function toggleSidebar() {
        if (window.innerWidth <= 768) { // Chỉ hoạt động trên mobile
            sidebar.classList.toggle('active');
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }

    // Đảm bảo sidebar đóng nếu người dùng resize từ mobile sang PC
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // --- Logic cho Dark Mode 3 trạng thái ---
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    let themeState = localStorage.getItem('themeState') || 'system'; // Mặc định là 'system'

    function applyTheme() {
        const body = document.body;
        const icon = themeToggle.querySelector('i');

        if (themeState === 'dark') {
            body.classList.add('dark-mode');
            icon.className = 'fas fa-moon';
        } else if (themeState === 'light') {
            body.classList.remove('dark-mode');
            icon.className = 'fas fa-sun';
        } else { // 'system'
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
            icon.className = 'fas fa-adjust';
        }
        localStorage.setItem('themeState', themeState);
    }

    // Chuyển đổi trạng thái khi click
    themeToggle.addEventListener('click', () => {
        if (themeState === 'light') {
            themeState = 'dark';
        } else if (themeState === 'dark') {
            themeState = 'system';
        } else {
            themeState = 'light';
        }
        applyTheme();
    });

    // Lắng nghe thay đổi theme của hệ thống
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (themeState === 'system') {
            applyTheme();
        }
    });

    // Áp dụng theme ban đầu
    applyTheme();


    // --- Logic cho Modal hình ảnh (phóng to ảnh) ---
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("img01");
    const captionText = document.getElementById("caption");
    const span = document.getElementsByClassName("close-button")[0];

    window.openImageModal = function(src, alt) {
        modal.style.display = "block";
        modalImg.src = src;
        captionText.innerHTML = alt;
    };

    span.onclick = function() {
        modal.style.display = "none";
    };

    modal.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
});