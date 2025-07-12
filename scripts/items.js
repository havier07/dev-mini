document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const itemListDiv = document.getElementById('itemList');
    const clearSearchButton = document.getElementById('clearSearchButton');
    const paginationDiv = document.getElementById('pagination');

    let allItems = []; // Toàn bộ dữ liệu vật phẩm
    let filteredItems = []; // Vật phẩm sau khi tìm kiếm
    let currentPage = 1;
    const itemsPerPage = AppConfig.ITEMS_PER_PAGE; // Lấy từ config.js

    function normalizeText(text) {
        text = text.toLowerCase();
        text = text.replace(/\s+/g, ' ').trim();
        text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return text;
    }

    async function loadItemData() {
        try {
            const response = await fetch('data/Item_Data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allItems = await response.json();
            filteredItems = [...allItems]; // Khởi tạo filteredItems bằng tất cả items
            renderPagination();
            displayCurrentPageItems();
        } catch (error) {
            console.error('Error loading item data:', error);
            itemListDiv.innerHTML = '<p class="not-found-message">Không thể tải dữ liệu vật phẩm. Vui lòng kiểm tra file "Item_Data.json" và chạy website bằng một web server cục bộ.</p>';
        }
    }

    // Hiển thị vật phẩm cho trang hiện tại
    function displayCurrentPageItems() {
        itemListDiv.innerHTML = ''; // Xóa các vật phẩm cũ
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

        if (itemsToDisplay.length === 0) {
            itemListDiv.innerHTML = '<p class="not-found-message">Không tìm thấy vật phẩm nào phù hợp.</p>';
            return;
        }

        itemsToDisplay.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('item-card');
            itemCard.dataset.itemId = item.id;

            const itemImage = document.createElement('img');
            itemImage.alt = item.name_raw;
            itemImage.onerror = function() {
                this.onerror = null;
                this.classList.add('error-image');
            };
            itemImage.src = item.image_path || ''; // Để trống để onerror kích hoạt "?"
            
            itemImage.addEventListener('click', (event) => {
                event.stopPropagation();
                // Nếu ảnh lỗi, truyền src là rỗng để modal hiển thị alt text
                const imgSrcForModal = itemImage.classList.contains('error-image') ? '' : itemImage.src;
                window.openImageModal(imgSrcForModal, item.name_raw);
            });

            const itemDetails = document.createElement('div');
            itemDetails.classList.add('item-details');

            const itemIdSpan = document.createElement('span');
            itemIdSpan.classList.add('item-id');
            itemIdSpan.textContent = `ID: ${item.id}`;

            const itemNameSpan = document.createElement('span');
            itemNameSpan.classList.add('item-name');
            itemNameSpan.textContent = item.name_raw;

            itemDetails.appendChild(itemIdSpan);
            itemDetails.appendChild(itemNameSpan);

            itemCard.appendChild(itemImage);
            itemCard.appendChild(itemDetails);

            itemCard.addEventListener('click', () => {
                navigator.clipboard.writeText(item.id)
                    .then(() => {
                        const copiedMessage = document.createElement('div');
                        copiedMessage.textContent = `Đã sao chép ID: ${item.id}`;
                        copiedMessage.style.cssText = `
                            position: fixed;
                            bottom: 20px;
                            left: 50%;
                            transform: translateX(-50%);
                            background-color: rgba(0,0,0,0.8);
                            color: white;
                            padding: 10px 20px;
                            border-radius: 5px;
                            z-index: 10000;
                            opacity: 0;
                            transition: opacity 0.5s ease-in-out;
                        `;
                        document.body.appendChild(copiedMessage);
                        setTimeout(() => { copiedMessage.style.opacity = '1'; }, 10);
                        setTimeout(() => {
                            copiedMessage.style.opacity = '0';
                            copiedMessage.addEventListener('transitionend', () => copiedMessage.remove());
                        }, 1500);
                    })
                    .catch(err => {
                        console.error('Failed to copy ID: ', err);
                    });
            });

            itemListDiv.appendChild(itemCard);
        });
        // Cuộn lên đầu trang sau khi chuyển trang
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Render các nút phân trang
    function renderPagination() {
        paginationDiv.innerHTML = '';
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

        if (totalPages <= 1 && !searchInput.value) { // Ẩn phân trang nếu chỉ có 1 trang và không tìm kiếm
            paginationDiv.style.display = 'none';
            return;
        }
        paginationDiv.style.display = 'flex'; // Hiện lại nếu cần

        // Nút Prev
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Trước';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            currentPage--;
            displayCurrentPageItems();
            renderPagination();
        });
        paginationDiv.appendChild(prevButton);

        // Nút số trang
        const maxPageButtons = 5; // Số nút trang tối đa hiển thị
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) { // Điều chỉnh nếu không đủ nút
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.classList.add('page-number');
            firstPageButton.addEventListener('click', () => {
                currentPage = 1;
                displayCurrentPageItems();
                renderPagination();
            });
            paginationDiv.appendChild(firstPageButton);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationDiv.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('page-number');
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayCurrentPageItems();
                renderPagination();
            });
            paginationDiv.appendChild(pageButton);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationDiv.appendChild(ellipsis);
            }
            const lastPageButton = document.createElement('button');
            lastPageButton.textContent = totalPages;
            lastPageButton.classList.add('page-number');
            lastPageButton.addEventListener('click', () => {
                currentPage = totalPages;
                displayCurrentPageItems();
                renderPagination();
            });
            paginationDiv.appendChild(lastPageButton);
        }

        // Nút Next
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Tiếp';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            currentPage++;
            displayCurrentPageItems();
            renderPagination();
        });
        paginationDiv.appendChild(nextButton);
    }

    // Thuật toán tìm kiếm thông minh
    function searchItems(query) {
        const normalizedQuery = normalizeText(query);
        
        if (!normalizedQuery) {
            filteredItems = [...allItems];
        } else {
            filteredItems = allItems.filter(item => {
                if (item.id.toString() === query.trim()) {
                    return true;
                }
                return item.name_normalized.includes(normalizedQuery);
            });
        }
        currentPage = 1; // Reset về trang 1 khi tìm kiếm mới
        renderPagination();
        displayCurrentPageItems();
    }

    // Xử lý sự kiện nhập liệu vào thanh tìm kiếm
    searchInput.addEventListener('input', (event) => {
        searchItems(event.target.value);
        if (event.target.value.length > 0) {
            clearSearchButton.style.display = 'block';
        } else {
            clearSearchButton.style.display = 'none';
        }
    });

    // Xử lý nút xóa tìm kiếm
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        searchItems('');
        clearSearchButton.style.display = 'none';
        searchInput.focus();
    });

    // Xử lý phím mũi tên trái/phải để chuyển trang
    document.addEventListener('keydown', (event) => {
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        if (event.key === 'ArrowLeft') {
            if (currentPage > 1) {
                currentPage--;
                displayCurrentPageItems();
                renderPagination();
            }
        } else if (event.key === 'ArrowRight') {
            if (currentPage < totalPages) {
                currentPage++;
                displayCurrentPageItems();
                renderPagination();
            }
        }
    });

    loadItemData();
});