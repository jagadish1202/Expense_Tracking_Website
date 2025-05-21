// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabButtons = document.querySelectorAll('.tab-btn');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Demo Account
const demoAccount = {
    email: 'demo@example.com',
    password: 'Demo123',
    name: 'Demo User'
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs and forms
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding form
            button.classList.add('active');
            const tabName = button.getAttribute('data-tab');
            document.getElementById(`${tabName}-form`).classList.add('active');
            
            // Clear error messages
            loginError.textContent = '';
            registerError.textContent = '';
        });
    });
    
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form submission
    registerForm.addEventListener('submit', handleRegister);
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // Redirect to main app
        window.location.href = 'main.html';
    }
});

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Clear previous error
    loginError.textContent = '';
    
    // Check for demo account
    if (email === demoAccount.email && password === demoAccount.password) {
        loginSuccess(demoAccount, rememberMe);
        return;
    }
    
    // Check for registered users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (user && user.password === password) {
        loginSuccess(user, rememberMe);
    } else {
        loginError.textContent = 'Invalid email or password';
    }
}

// Handle Register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Clear previous error
    registerError.textContent = '';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match';
        return;
    }
    
    // Validate password strength
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordPattern.test(password)) {
        registerError.textContent = 'Password must contain at least 8 characters, including uppercase, lowercase and numbers';
        return;
    }
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.email === email)) {
        registerError.textContent = 'Email already in use';
        return;
    }
    
    // Create new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after registration
    loginSuccess(newUser, true);
}

// Login Success
function loginSuccess(user, rememberMe) {
    // Create user session
    const userSession = {
        name: user.name,
        email: user.email,
        loggedInAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    
    // Set session expiry if not "remember me"
    if (!rememberMe) {
        // Session expires in 24 hours
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        localStorage.setItem('sessionExpiry', expiry.toISOString());
    } else {
        // Clear any existing expiry
        localStorage.removeItem('sessionExpiry');
    }
    
    // Redirect to main app
    window.location.href = 'main.html';
}