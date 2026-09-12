/**
 * Auth.js - Handles login functionality for SGD ERP
 * Used only on the index.html page.
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheck = document.getElementById('rememberMe');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const loginAlert = document.getElementById('loginAlert');
    const loginCard = document.querySelector('.login-right');

    // Check if user is already logged in
    const existingUser = localStorage.getItem('sgd_user');
    if (existingUser && existingUser !== 'undefined') {
        window.location.href = 'dashboard.html';
        return;
    } else if (existingUser === 'undefined') {
        localStorage.removeItem('sgd_user');
    }

    // Check remember me
    const rememberedUser = localStorage.getItem('sgd_remembered_username');
    if (rememberedUser) {
        usernameInput.value = rememberedUser;
        rememberMeCheck.checked = true;
    }

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) return;

        // UI Loading state
        setLoadingState(true);
        loginAlert.classList.add('d-none');

        try {
            const response = await apiCall('login', { username, password });
            
            if (response.success) {
                // Handle remember me
                if (rememberMeCheck.checked) {
                    localStorage.setItem('sgd_remembered_username', username);
                } else {
                    localStorage.removeItem('sgd_remembered_username');
                }

                // Get user and token from response (handle both real API and demo data format)
                const userData = response.data ? response.data.user : response.user;
                const tokenData = response.data ? response.data.token : response.token;

                // Store session
                localStorage.setItem('sgd_user', JSON.stringify(userData));
                localStorage.setItem('sgd_token', tokenData || 'demo-token');

                // Redirect
                window.location.href = 'dashboard.html';
            } else {
                showError(response.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            showError('Network error or server unavailable.');
            console.error(error);
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            btnText.classList.add('d-none');
            btnSpinner.classList.remove('d-none');
            loginBtn.disabled = true;
            usernameInput.disabled = true;
            passwordInput.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
            loginBtn.disabled = false;
            usernameInput.disabled = false;
            passwordInput.disabled = false;
        }
    }

    function showError(msg) {
        loginAlert.textContent = msg;
        loginAlert.classList.remove('d-none');
        
        // Add shake animation
        loginCard.classList.remove('shake');
        void loginCard.offsetWidth; // trigger reflow
        loginCard.classList.add('shake');
    }

    /**
     * Local API call simulator since app.js is not loaded here.
     */
    const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbwjYasx-fhviaX1DLnQY-rm9vlbpsUfYMTdhuMnJKJ1klpnBNzIRGG_Ui1XB7Ao0QgYUw/exec';

    async function apiCall(action, data) {
        // PRODUCTION MODE — call the real backend
        if (API_BASE_URL) {
            try {
                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({ action, params: data })
                });
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                // Fallback to demo mode on network error
                return demoLogin(data);
            }
        }

        // DEMO MODE — offline fallback
        return new Promise((resolve) => {
            setTimeout(() => { resolve(demoLogin(data)); }, 800);
        });
    }

    function demoLogin(data) {
        if (data.username === 'admin' && data.password === 'admin123') {
            return {
                success: true,
                user: {
                    userId: 'USR-0001',
                    fullName: 'Administrator',
                    role: 'admin',
                    username: 'admin'
                },
                token: 'demo-jwt-token-xyz'
            };
        }
        return {
            success: false,
            message: 'Invalid username or password'
        };
    }
});
