// Функция для загрузки внешних скриптов асинхронно
function loadScriptAsync(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Функция для установки cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toGMTString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

// Функция для получения cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Загрузка fetch, если не поддерживается
if (!window.fetch) {
    loadScriptAsync("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.4/fetch.min.js")
        .catch(err => console.error("Ошибка загрузки fetch:", err));
}

// Пример использования cookie (запись при загрузке)
window.onload = function() {
    if (!getCookie("userVisited")) {
        setCookie("userVisited", "true", 30); // Устанавливаем cookie на 30 дней
        console.log("Новый посетитель, cookie установлен");
    }

    // Обработка клика по игре в панели
    const gameItems = document.querySelectorAll('.game-item');
    gameItems.forEach(item => {
        item.addEventListener('click', () => {
            const game = item.getAttribute('data-game');
            document.getElementById('gameSelect').value = game;
            searchTeammates(); // Автоматический поиск по выбранной игре
        });
    });
};

// Основная функциональность поиска тиммейтов
async function loadTeammates() {
    try {
        const response = await fetch('assets/teammates.json');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function searchTeammates() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const game = document.getElementById('gameSelect').value;
    const skill = document.getElementById('skillSelect').value;
    const resultsDiv = document.getElementById('results');

    resultsDiv.innerHTML = '<p>Загрузка...</p>';

    const teammates = await loadTeammates();

    const filteredTeammates = teammates.filter(teammate => {
        return (
            (searchInput === '' || teammate.desc.toLowerCase().includes(searchInput) || teammate.name.toLowerCase().includes(searchInput)) &&
            (game === '' || teammate.game === game) &&
            (skill === '' || teammate.skill === skill)
        );
    });

    resultsDiv.innerHTML = '';

    if (filteredTeammates.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">Тиммейты не найдены</p>';
    } else {
        filteredTeammates.forEach(teammate => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h3>${teammate.name}</h3>
                <p><strong>Игра:</strong> ${teammate.game.toUpperCase()}</p>
                <p><strong>Уровень:</strong> ${teammate.skill}</p>
                <p>${teammate.desc}</p>
            `;
            resultsDiv.appendChild(card);
        });
    }
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchTeammates();
});

document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const message = document.getElementById('message');

    // Валидация
    if (!username) {
        message.textContent = 'Пожалуйста, введите имя пользователя.';
        return;
    }

    if (!validateEmail(email)) {
        message.textContent = 'Пожалуйста, введите действительный email.';
        return;
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        message.textContent = 'Пароль должен быть минимум 8 символов, содержать буквы и цифры.';
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = 'Пароли не совпадают.';
        return;
    }

    // Проверка уникальности email
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        message.textContent = 'Пользователь с таким email уже существует.';
        return;
    }

    // Сохранение пользователя
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    message.textContent = 'Регистрация успешна! Теперь вы можете войти.';
    this.reset();
});

// Функция проверки email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}