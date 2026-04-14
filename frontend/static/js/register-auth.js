// Register page authentication
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
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
                    messageDiv.textContent = data.detail || 'Registration failed';
                }
            } catch (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'An error occurred. Please try again.';
            }
        });
    }
});
