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
let naverMapRetryCount = 0;
const maxNaverMapRetries = 25; // 최대 5초 (25 * 200ms)

function initNaverMap() {
    const mapContainer = document.getElementById('naver-map');
    if (!mapContainer) {
        console.log('지도 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 네이버 지도 API 확인
    if (typeof naver === 'undefined' || !naver.maps) {
        if (naverMapRetryCount < maxNaverMapRetries) {
            naverMapRetryCount++;
            setTimeout(initNaverMap, 200);
        } else {
            console.error('네이버 지도 API 로드 실패');
        }
        return;
    }
    
    console.log('네이버 지도 API 로드 완료');
    
    // W스퀘어컨벤션 정확한 좌표 (네이버 지도 URL 기준)
    const lat = 37.400489;  // 위도
    const lng = 127.1114764; // 경도
    
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
        title: 'W스퀘어컨벤션 8층 채플홀'
    });
    
    // 정보창 추가
    const infoWindow = new naver.maps.InfoWindow({
        content: '<div style="padding: 12px;"><strong>W스퀘어컨벤션 8층 채플홀</strong><br>경기 성남시 분당구 판교역로226번길 16</div>'
    });
    
    // 지도 로드 시 정보창 자동 열기
    infoWindow.open(map, marker);
}

// 계좌번호 복사 기능
function initAccountCopy() {
    const accountCards = document.querySelectorAll('.account-card');
    
    if (accountCards.length === 0) {
        console.log('계좌 카드를 찾을 수 없습니다.');
        return;
    }
    
    accountCards.forEach(card => {
        card.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const accountNumber = card.getAttribute('data-account');
            const bank = card.getAttribute('data-bank');
            const fullText = `${bank} ${accountNumber}`;
            
            console.log('복사 시도:', fullText);
            
            // 클립보드에 복사 (은행명 포함)
            let copied = false;
            
            // 방법 1: Clipboard API (HTTPS 필요)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(fullText);
                    copied = true;
                    console.log('Clipboard API로 복사 성공');
                } catch (err) {
                    console.log('Clipboard API 실패:', err);
                }
            }
            
            // 방법 2: Fallback (모든 환경에서 작동)
            if (!copied) {
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = fullText;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    if (successful) {
                        copied = true;
                        console.log('execCommand로 복사 성공');
                    } else {
                        console.log('execCommand 실패');
                    }
                } catch (err) {
                    console.log('execCommand 에러:', err);
                }
            }
            
            if (copied) {
                showCopyMessage(card, '계좌번호가 복사되었습니다!');
            } else {
                showCopyMessage(card, '복사 실패. 계좌번호를 직접 선택해주세요.');
            }
        });
    });
    
    console.log('계좌번호 복사 기능 초기화 완료:', accountCards.length, '개');
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

// 네이버 지도 인증 실패 처리
window.navermap_authFailure = function() {
    console.error('네이버 지도 API 인증 실패. Client ID를 확인해주세요.');
};

// BGM 초기화
function initBGM() {
    const bgm = document.getElementById('bgm');
    const bgmToggle = document.getElementById('bgm-toggle');
    const bgmIcon = document.getElementById('bgm-icon');
    
    if (!bgm) return;
    
    bgm.volume = 0.3; // 볼륨 30%로 설정
    
    // BGM 토글 버튼 이벤트
    if (bgmToggle) {
        bgmToggle.addEventListener('click', () => {
            if (bgm.paused) {
                bgm.play().catch(err => {
                    console.log('BGM 재생 실패:', err);
                });
            } else {
                bgm.pause();
            }
            updateBGMIcon();
        });
    }
    
    // BGM 재생 상태에 따라 아이콘 업데이트
    const updateBGMIcon = () => {
        if (bgmToggle) {
            if (bgm.paused) {
                bgmToggle.classList.add('muted');
            } else {
                bgmToggle.classList.remove('muted');
            }
        }
    };
    
    // BGM 재생 상태 변경 감지
    bgm.addEventListener('play', updateBGMIcon);
    bgm.addEventListener('pause', updateBGMIcon);
    
    // 페이지 로드 시 즉시 재생 시도
    const playBGM = () => {
        // autoplay 속성이 있어도 브라우저 정책으로 차단될 수 있으므로 명시적으로 재생 시도
        const attemptPlay = () => {
            bgm.play().catch(err => {
                console.log('BGM 자동 재생 실패, 사용자 상호작용 대기:', err);
                // 자동 재생 실패 시 사용자 상호작용 후 재생
                const playOnInteraction = () => {
                    bgm.play().catch(e => console.log('BGM 재생 실패:', e));
                    document.removeEventListener('click', playOnInteraction);
                    document.removeEventListener('touchstart', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction, { once: true });
                document.addEventListener('touchstart', playOnInteraction, { once: true });
            });
            updateBGMIcon();
        };
        
        // 여러 시점에서 재생 시도
        attemptPlay();
        
        // DOMContentLoaded 시도
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attemptPlay);
        }
        
        // load 이벤트 시도
        if (document.readyState !== 'complete') {
            window.addEventListener('load', attemptPlay);
        }
    };
    
    // 즉시 재생 시도
    playBGM();
    
    // 초기 아이콘 상태 설정
    updateBGMIcon();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initScrollAnimation();
    initSmoothScroll();
    initBGM();
    // 네이버 지도는 스크립트 로드 후 초기화
    window.addEventListener('load', () => {
        setTimeout(initNaverMap, 500);
    });
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

