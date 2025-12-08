// 갤러리 슬라이더 기능
let currentSlide = 0;
const galleryItems = document.querySelectorAll('.gallery-item');
const dots = document.querySelectorAll('.dot');
const totalSlides = galleryItems.length;

// 갤러리 초기화
function initGallery() {
    if (galleryItems.length === 0) return;
    
    updateGallery();
    
    // 이전 버튼
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateGallery();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateGallery();
        });
    }
    
    // 도트 클릭 이벤트
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateGallery();
        });
    });
    
    // 자동 슬라이드 (선택사항)
    // setInterval(() => {
    //     currentSlide = (currentSlide + 1) % totalSlides;
    //     updateGallery();
    // }, 5000);
}

function updateGallery() {
    // 슬라이드 이동
    galleryItems.forEach((item, index) => {
        item.style.transform = `translateX(-${currentSlide * 100}%)`;
    });
    
    // 도트 업데이트
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// 스크롤 애니메이션
function initScrollAnimation() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // 모든 섹션에 fade-in 클래스 추가 및 관찰 시작
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
}

// 축하 메시지 기능
function initMessageSystem() {
    const submitBtn = document.getElementById('submit-message');
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');
    const messagesContainer = document.getElementById('messages-container');
    
    // 로컬 스토리지에서 메시지 불러오기
    loadMessages();
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const message = messageInput.value.trim();
            
            if (!name || !message) {
                alert('이름과 메시지를 모두 입력해주세요.');
                return;
            }
            
            if (name.length > 20) {
                alert('이름은 20자 이하로 입력해주세요.');
                return;
            }
            
            if (message.length > 200) {
                alert('메시지는 200자 이하로 입력해주세요.');
                return;
            }
            
            addMessage(name, message);
            nameInput.value = '';
            messageInput.value = '';
        });
    }
    
    // Enter 키로도 제출 가능 (Shift+Enter는 줄바꿈)
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitBtn.click();
            }
        });
    }
}

function addMessage(name, message) {
    const messages = getMessages();
    const newMessage = {
        id: Date.now(),
        name: name,
        message: message,
        date: new Date().toISOString()
    };
    
    messages.unshift(newMessage); // 최신 메시지가 위에 오도록
    saveMessages(messages);
    displayMessages(messages);
}

function getMessages() {
    const stored = localStorage.getItem('wedding-messages');
    return stored ? JSON.parse(stored) : [];
}

function saveMessages(messages) {
    localStorage.setItem('wedding-messages', JSON.stringify(messages));
}

function loadMessages() {
    const messages = getMessages();
    displayMessages(messages);
}

function displayMessages(messages) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">아직 축하 메시지가 없습니다. 첫 번째 메시지를 남겨주세요!</p>';
        return;
    }
    
    messagesContainer.innerHTML = messages.map(msg => `
        <div class="message-item">
            <div class="message-author">${escapeHtml(msg.name)}</div>
            <div class="message-text">${escapeHtml(msg.message).replace(/\n/g, '<br>')}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 부드러운 스크롤
function initSmoothScroll() {
    // 스크롤 인디케이터 클릭 시 다음 섹션으로 스크롤
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const firstSection = document.querySelector('section');
            if (firstSection) {
                firstSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// 네이버 지도 초기화
function initNaverMap() {
    const mapContainer = document.getElementById('naver-map');
    if (!mapContainer) return;
    
    // 네이버 지도 Geocoding을 사용하여 주소를 좌표로 변환
    naver.maps.Service.geocode({
        query: '경기 성남시 분당구 판교역로226번길 16 W스퀘어컨벤션'
    }, function(status, response) {
        if (status !== naver.maps.Service.Status.OK) {
            // Geocoding 실패 시 기본 좌표 사용
            createMap(37.3956, 127.1112);
            return;
        }
        
        const result = response.result;
        const items = result.items;
        
        if (items.length > 0) {
            const point = items[0].point;
            createMap(point.y, point.x);
        } else {
            // 검색 결과가 없을 경우 기본 좌표 사용
            createMap(37.3956, 127.1112);
        }
    });
    
    function createMap(lat, lng) {
        // 네이버 지도 생성
        const mapOptions = {
            center: new naver.maps.LatLng(lat, lng),
            zoom: 17
        };
        
        const map = new naver.maps.Map('naver-map', mapOptions);
        
        // 마커 추가
        const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(lat, lng),
            map: map,
            title: 'W스퀘어컨벤션 8층 채플홀',
            icon: {
                content: '<div style="background: #e8b4a0; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">💒</div>',
                anchor: new naver.maps.Point(20, 20)
            }
        });
        
        // 정보창 추가
        const infoWindow = new naver.maps.InfoWindow({
            content: '<div style="padding: 12px; font-size: 14px; line-height: 1.6; min-width: 200px;"><strong style="font-size: 16px; color: #8b6f47; display: block; margin-bottom: 5px;">W스퀘어컨벤션 8층 채플홀</strong><span style="color: #666; display: block;">경기 성남시 분당구 판교역로226번길 16</span></div>'
        });
        
        // 마커 클릭 시 정보창 표시
        naver.maps.Event.addListener(marker, 'click', function() {
            if (infoWindow.getMap()) {
                infoWindow.close();
            } else {
                infoWindow.open(map, marker);
            }
        });
        
        // 지도 로드 시 정보창 자동 열기
        infoWindow.open(map, marker);
    }
}

// 계좌번호 복사 기능
function initAccountCopy() {
    const accountCards = document.querySelectorAll('.account-card');
    
    accountCards.forEach(card => {
        card.addEventListener('click', () => {
            const accountNumber = card.getAttribute('data-account');
            const bank = card.getAttribute('data-bank');
            const fullText = `${bank} ${accountNumber}`;
            
            // 클립보드에 복사
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(accountNumber).then(() => {
                    showCopyMessage(card, '계좌번호가 복사되었습니다!');
                }).catch(() => {
                    fallbackCopy(accountNumber, card);
                });
            } else {
                fallbackCopy(accountNumber, card);
            }
        });
    });
}

function fallbackCopy(text, card) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyMessage(card, '계좌번호가 복사되었습니다!');
    } catch (err) {
        showCopyMessage(card, '복사 실패. 계좌번호를 직접 선택해주세요.');
    }
    
    document.body.removeChild(textArea);
}

function showCopyMessage(card, message) {
    // 기존 힌트 메시지 업데이트
    const hint = card.querySelector('.copy-hint');
    if (hint) {
        const originalText = hint.textContent;
        hint.textContent = message;
        hint.style.color = '#00ff41';
        hint.style.opacity = '1';
        hint.style.fontWeight = '500';
        
        setTimeout(() => {
            hint.textContent = originalText;
            hint.style.color = '';
            hint.style.opacity = '0.7';
            hint.style.fontWeight = '';
        }, 2000);
    }
    
    // 토스트 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #0d1117;
        color: #00ff41;
        padding: 15px 25px;
        border: 2px solid #00ff41;
        box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
        z-index: 10000;
        font-family: 'Galmuri9', monospace;
        font-size: 0.9rem;
        border-radius: 0;
        animation: toastSlideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 토스트 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initScrollAnimation();
    initSmoothScroll();
    initNaverMap();
    initAccountCopy();
});

// 모바일 터치 스와이프 지원 (갤러리)
let touchStartX = 0;
let touchEndX = 0;

const gallerySlider = document.querySelector('.gallery-slider');
if (gallerySlider) {
    gallerySlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    gallerySlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 왼쪽으로 스와이프 (다음)
            currentSlide = (currentSlide + 1) % totalSlides;
        } else {
            // 오른쪽으로 스와이프 (이전)
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        }
        updateGallery();
    }
}

