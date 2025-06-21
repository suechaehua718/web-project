        let currentEmotion = '';
        let meditationInterval = null;
        let breathingInterval = null;
        let meditationTime = 180; // Default to 3 minutes (180 seconds)
        let isInhaling = true;
        let isMeditating = false;
        let loggedInUser = null; // Stores the username of the logged-in user

        const comfortMessages = [
            "당신의 감정은 모두 소중하고 의미가 있습니다.<br>힘든 하루였다면, 그래도 여기까지 온 자신을 칭찬해주세요.<br>내일은 오늘보다 더 나은 하루가 될 거예요. 💙",
            "모든 감정에는 이유가 있고, 시간이 있습니다.<br>지금 이 순간도 지나갈 것이니, 자신에게 더 따뜻해져 주세요.<br>당신은 충분히 잘하고 있어요. 🌟",
            "완벽하지 않아도 괜찮습니다.<br>실수하고 넘어져도 괜찮습니다.<br>중요한 건 다시 일어설 수 있는 용기입니다. 🌱",
            "오늘 느낀 모든 감정이 당신을 더 성장시킬 거예요.<br>혼자가 아니니까, 천천히 걸어가도 괜찮습니다.<br>당신의 속도가 바로 맞는 속도예요. 🦋",
            "지금 이 순간, 당신이 느끼는 모든 것이 소중합니다.<br>감정을 마주하는 것만으로도 용감한 일이에요.<br>스스로를 자랑스러워해도 좋습니다. ✨",
            "힘들어도 괜찮아요. 슬퍼도 괜찮아요.<br>모든 감정은 당신이라는 사람을 더 풍성하게 만들어줍니다.<br>지금 이 순간의 당신을 있는 그대로 받아들여 주세요. 🤗",
            "당신만의 속도로 천천히 가세요.<br>남들과 비교하지 말고, 어제의 나와만 비교해보세요.<br>작은 변화도 큰 성장입니다. 🌸"
        ];

        // --- Auth Functions ---
        function getAuthMessageElement() {
            return document.getElementById('authMessage');
        }

        function getUsers() {
            return JSON.parse(localStorage.getItem('users')) || []; //null이나 오류 발생 시 빈 배열 반환
        }

        function saveUsers(users) {
            localStorage.setItem('users', JSON.stringify(users));
        }

        function register() {
            const username = document.getElementById('usernameInput').value.trim();
            const password = document.getElementById('passwordInput').value.trim();
            const authMessage = getAuthMessageElement();

            if (!username || !password) {
                authMessage.textContent = '사용자 이름과 비밀번호를 입력해주세요.';
                authMessage.style.color = 'red';
                return;
            }

            let users = getUsers();
            if (users.some(user => user.username === username)) {
                authMessage.textContent = '이미 존재하는 사용자 이름입니다.';
                authMessage.style.color = 'red';
                return;
            }

            users.push({ username: username, password: password, diaries: [] });
            saveUsers(users);
            
            authMessage.textContent = '회원가입이 완료되었습니다. 로그인해주세요!';
            authMessage.style.color = 'green';
            document.getElementById('usernameInput').value = '';
            document.getElementById('passwordInput').value = '';
        }

        function login() {
            const username = document.getElementById('usernameInput').value.trim();//trim : 문자열 공백 제거
            const password = document.getElementById('passwordInput').value.trim();
            const authMessage = getAuthMessageElement();
            authMessage.textContent = ''; // Clear any previous auth messages at the start of login attempt

            if (!username || !password) {
                authMessage.textContent = '사용자 이름과 비밀번호를 입력해주세요.';
                authMessage.style.color = 'red';
                return;
            }

            let users = getUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                loggedInUser = username;
                localStorage.setItem('loggedInUser', username); // Store logged-in state
                updateAuthUI();
                showPage('home', null); // Redirect to home page
                displayWelcomeMessage(); // Display welcome message for logged-in user
                document.getElementById('usernameInput').value = '';
                document.getElementById('passwordInput').value = '';
            } else {
                authMessage.textContent = '잘못된 사용자 이름 또는 비밀번호입니다.';
                authMessage.style.color = 'red';
            }
        }

        function logout() {
            loggedInUser = null;
            localStorage.removeItem('loggedInUser'); // Clear logged-in state
            updateAuthUI();
            showPage('auth', null); // Redirect to auth page after logout
        }

        function displayWelcomeMessage() {
            const welcomeMsgElem = document.getElementById('welcomeMessage');
            if (loggedInUser) {
                welcomeMsgElem.textContent = `환영합니다, ${loggedInUser}님!`;
                welcomeMsgElem.style.display = 'block'; // Ensure message is visible
            } else {
                welcomeMsgElem.textContent = '';
                welcomeMsgElem.style.display = 'none'; // Hide if not logged in
            }
        }

        function updateAuthUI() {
            const authNavLink = document.getElementById('authNavLink');
            const navItemsThatRequireLogin = [
                document.getElementById('diaryNavLink'),
                document.getElementById('viewDiariesNavLink'),
                document.getElementById('comfortNavLink'),
                document.getElementById('meditationNavLink')
            ];

            if (loggedInUser) {
                authNavLink.textContent = '로그아웃';
                authNavLink.onclick = logout;
                
                // Show nav items that require login
                navItemsThatRequireLogin.forEach(item => {
                    if (item) item.style.display = 'block';
                });
            } else {
                authNavLink.textContent = '로그인';
                authNavLink.onclick = (event) => showPage('auth', event);
                
                // Hide nav items that require login
                navItemsThatRequireLogin.forEach(item => {
                    if (item) item.style.display = 'none';
                });
            }
        }

        function handleAuthClick(event) {
            if (loggedInUser) {
                logout();
            } else {
                showPage('auth', event);
            }
        }

        // --- Existing Functions (with modifications for user data) ---

        function showPage(pageName, event) {
            if (event) {
                event.preventDefault();
            }

            const loggedInContent = document.getElementById('loggedInContent');
            const loggedOutContent = document.getElementById('loggedOutContent');
            const authPage = document.getElementById('auth');

            // Define restricted pages. 'home' is also restricted if not logged in.
            const restrictedPages = ['diary', 'viewDiaries', 'comfort', 'meditation', 'home']; 

            // Deactivate all .page elements (individual pages like #home, #diary, #auth)
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            // Hide the two main wrappers
            loggedInContent.style.display = 'none'; 
            loggedOutContent.style.display = 'none'; 
            // Explicitly hide the auth page, it will be made visible if pageName is 'auth'
            authPage.style.display = 'none';
            
            // Deactivate all navigation items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Logic to determine what to show
            if (pageName === 'auth') {
                authPage.classList.add('active'); // Activate auth page class
                authPage.style.display = 'block'; // Ensure auth page is displayed
                getAuthMessageElement().textContent = ''; // Clear any previous auth messages
                document.getElementById('authNavLink').classList.add('active'); // Activate auth nav link
            } else if (!loggedInUser && restrictedPages.includes(pageName)) {
                // If not logged in and trying to access a restricted page
                loggedOutContent.style.display = 'block'; // Show "login to use" message
                getAuthMessageElement().textContent = '로그인 후 이용 가능한 서비스입니다.';
                getAuthMessageElement().style.color = 'orange';
                document.getElementById('authNavLink').classList.add('active'); // Activate auth nav link
            } else if (loggedInUser) {
                // If logged in, show the logged-in content wrapper and the specific page
                loggedInContent.style.display = 'block'; 
                document.getElementById(pageName).classList.add('active');

                // Activate the corresponding navigation item
                if (pageName === 'home') {
                    document.getElementById('homeNavLink').classList.add('active');
                } else if (pageName === 'diary') {
                    document.getElementById('diaryNavLink').classList.add('active');
                } else if (pageName === 'viewDiaries') {
                    document.getElementById('viewDiariesNavLink').classList.add('active');
                    displayDiaryEntries(); // Refresh entries when viewing
                } else if (pageName === 'comfort') {
                    document.getElementById('comfortNavLink').classList.add('active');
                } else if (pageName === 'meditation') {
                    document.getElementById('meditationNavLink').classList.add('active');
                }
            }
            
            // Close mobile menu
            document.getElementById('navMenu').classList.remove('mobile-open');

            // Ensure welcome message is displayed if on home page and logged in
            if (pageName === 'home' && loggedInUser) {
                displayWelcomeMessage();
            }
        }

        function toggleMobileMenu() {
            document.getElementById('navMenu').classList.toggle('mobile-open');
        }

        function selectEmotion(button, emotion) {
            document.querySelectorAll('.emotion-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
            currentEmotion = emotion;
        }

        function submitDiary() {
            if (!loggedInUser) {
                alert('로그인이 필요합니다.');
                showPage('auth', null);
                return;
            }

            const reason = document.getElementById('emotionReason').value;
            
            if (!currentEmotion) {
                alert('감정을 선택해주세요.');
                return;
            }
            
            if (!reason.trim()) {
                alert('감정에 대한 이야기를 적어주세요.');
                return;
            }
            
            saveDiaryEntry(currentEmotion, reason);

            alert(`${currentEmotion} 감정이 기록되었습니다.\n소중한 마음을 나누어 주셔서 감사합니다.`);
            
            showPage('comfort', null);
            document.getElementById('comfortNavLink').classList.add('active'); 
            clearDiary();
        }

        function clearDiary() {
            document.getElementById('emotionReason').value = '';
            document.querySelectorAll('.emotion-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            currentEmotion = '';
        }

        function getNewComfort() {
            const randomMessage = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];
            document.getElementById('comfortMessage').innerHTML = randomMessage;
        }

        // --- Meditation Functions ---
        function toggleMeditation() {
            const btn = document.getElementById('meditationBtn');
            if (isMeditating) {
                stopMeditation();
                btn.textContent = '시작';
                document.getElementById('breathingGuide').textContent = '일시정지됨';
            } else {
                btn.textContent = '일시정지';
                startMeditation();
            }
            isMeditating = !isMeditating;
        }

        function startMeditation() {
            meditationInterval = setInterval(() => {
                meditationTime--;
                updateTimer();
                if (meditationTime <= 0) {
                    stopMeditation();
                    document.getElementById('meditationBtn').textContent = '시작';
                    document.getElementById('breathingGuide').textContent = '명상이 완료되었습니다! 🙏';
                    isMeditating = false;
                    alert('명상이 완료되었습니다. 마음이 한결 편안해지셨길 바라요.');
                    document.getElementById('breathingCircle').textContent = '호흡';
                }
            }, 1000);
            startBreathingAnimation();
        }

        function stopMeditation() {
            if (meditationInterval) {
                clearInterval(meditationInterval);
                meditationInterval = null;
            }
            if (breathingInterval) {
                clearInterval(breathingInterval);
                breathingInterval = null;
            }
            const circle = document.getElementById('breathingCircle');
            circle.classList.remove('inhale', 'exhale');
        }

        function startBreathingAnimation() {
            const circle = document.getElementById('breathingCircle');
            const guide = document.getElementById('breathingGuide');
            if (isInhaling) {
                    circle.classList.remove('exhale');
                    circle.classList.add('inhale');
                    guide.textContent = '천천히 들이마시세요... 💨';
                    circle.textContent = '들이마시기';
                } else {
                    circle.classList.remove('inhale');
                    circle.classList.add('exhale');
                    guide.textContent = '천천히 내쉬세요... 🌬️';
                    circle.textContent = '내쉬기';
                }
                isInhaling = !isInhaling;
            breathingInterval = setInterval(() => {
                if (isInhaling) {
                    circle.classList.remove('exhale');
                    circle.classList.add('inhale');
                    guide.textContent = '천천히 들이마시세요... 💨';
                    circle.textContent = '들이마시기';
                } else {
                    circle.classList.remove('inhale');
                    circle.classList.add('exhale');
                    guide.textContent = '천천히 내쉬세요... 🌬️';
                    circle.textContent = '내쉬기';
                }
                isInhaling = !isInhaling;
            }, 4000);
        }

        function updateTimer() {
            const minutes = Math.floor(meditationTime / 60);
            const seconds = meditationTime % 60;
            document.getElementById('timerDisplay').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
            // Removed the code that updated meditationMinutes and meditationSeconds here
        }

        function setMeditationTime() {
            const minutesInput = document.getElementById('meditationMinutes');
            const secondsInput = document.getElementById('meditationSeconds');

            let minutes = parseInt(minutesInput.value);
            let seconds = parseInt(secondsInput.value);

            if (isNaN(minutes) || minutes < 0) {
                minutes = 0;
            }
            if (isNaN(seconds) || seconds < 0) {
                seconds = 0;
            }

            // Cap seconds at 59 and minutes at 60 (or a reasonable max)
            seconds = Math.min(seconds, 59);
            minutes = Math.min(minutes, 60); // Max 60 minutes for simplicity

            meditationTime = (minutes * 60) + seconds;
            
            if (meditationTime <= 0) {
                meditationTime = 1; // Ensure at least 1 second for the timer to function
            }

            resetMeditation(); // Reset meditation to apply new time and stop any active sessions
            alert(`명상 시간이 ${minutes}분 ${seconds}초로 설정되었습니다.`);
        }

        function resetMeditation() {
            stopMeditation();
            // Recalculate and set input field values based on current meditationTime
            document.getElementById('meditationMinutes').value = Math.floor(meditationTime / 60);
            document.getElementById('meditationSeconds').value = meditationTime % 60;
            
            isInhaling = true;
            isMeditating = false;
            updateTimer(); // This will now correctly display the current meditationTime
            document.getElementById('meditationBtn').textContent = '시작';
            document.getElementById('breathingGuide').textContent = '준비되면 시작 버튼을 눌러주세요';
            document.getElementById('breathingCircle').textContent = '호흡';
        }

        // --- Modified Diary Functions for User Accounts ---

        function saveDiaryEntry(emotion, reason) {
            let users = getUsers();
            const currentUserIndex = users.findIndex(u => u.username === loggedInUser);

            if (currentUserIndex === -1) {
                console.error("Logged-in user not found in users array.");
                return;
            }

            const now = new Date();
            const dateString = now.toLocaleString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const newEntry = {
                date: dateString,
                emotion: emotion,
                reason: reason
            };

            users[currentUserIndex].diaries.push(newEntry);
            saveUsers(users);
        }

        function displayDiaryEntries() {
            const container = document.getElementById('diaryEntriesContainer');
            let users = getUsers();
            const currentUser = users.find(u => u.username === loggedInUser);
            
            // Clear previous entries
            container.innerHTML = ''; 

            if (!currentUser || currentUser.diaries.length === 0) {
                container.innerHTML = '<p class="no-entries-message">아직 기록된 일기가 없어요. 감정 일기를 작성해 보세요!</p>';
                return;
            }

            // Display entries in reverse chronological order
            currentUser.diaries.reverse().forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('card', 'diary-entry');

                entryDiv.innerHTML = `
                    <div class="diary-entry-date">${entry.date}</div>
                    <div class="diary-entry-emotion">${entry.emotion}</div>
                    <div class="diary-entry-reason">${entry.reason}</div>
                `;
                container.appendChild(entryDiv);
            });
        }

        // --- Initial Setup and Load ---
        function init() {
            // Check if a user is already logged in from a previous session
            loggedInUser = localStorage.getItem('loggedInUser');
            updateAuthUI();

            // Set initial values for timer inputs
            document.getElementById('meditationMinutes').value = Math.floor(meditationTime / 60);
            document.getElementById('meditationSeconds').value = meditationTime % 60;
            
            // Show appropriate content based on login status
            showPage(loggedInUser ? 'home' : 'auth', null); 
            
            // Display welcome message if user is logged in (after showPage ensures home is active)
            if (loggedInUser) {
                displayWelcomeMessage();
            }

            updateTimer(); // Initialize timer display
        }

        // Assign IDs to nav links for easier access and correct 'active' state
        document.addEventListener('DOMContentLoaded', () => {
            // Corrected ID assignment for the first nav item
            document.querySelector('.nav-menu button:nth-child(1)').id = 'homeNavLink'; 
            document.querySelector('.nav-menu button:nth-child(2)').id = 'diaryNavLink';
            document.querySelector('.nav-menu button:nth-child(3)').id = 'viewDiariesNavLink';
            document.querySelector('.nav-menu button:nth-child(4)').id = 'comfortNavLink';
            document.querySelector('.nav-menu button:nth-child(5)').id = 'meditationNavLink';
            document.querySelector('.nav-menu button:nth-child(6)').id = 'authNavLink'; 
            
            init(); // Call the initialization function when the DOM is ready
        });