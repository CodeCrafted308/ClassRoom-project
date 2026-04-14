// Login page authentication
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
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
                    messageDiv.textContent = data.detail || 'Login failed';
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            }
        });
    }
});
