function switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.querySelector('.tabs .tab-btn:first-child');
    const registerBtn = document.querySelector('.tabs .tab-btn:last-child');
    
    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        loginBtn.classList.remove('active');
        registerBtn.classList.add('active');
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message';
    messageDiv.textContent = '';
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.role === 'teacher') {
                window.location.href = '/teacher/dashboard';
            } else {
                window.location.href = '/student/dashboard';
            }
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message';
    messageDiv.textContent = '';
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.role === 'teacher') {
                window.location.href = '/teacher/dashboard';
            } else {
                window.location.href = '/student/dashboard';
            }
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred. Please try again.';
    }
});


