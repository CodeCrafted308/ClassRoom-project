# Demo Accounts for Testing

## Working Login Credentials

### Teacher Account
- **Email**: `teacher@scholarrank.com`
- **Password**: `teacher123`
- **Role**: Teacher

### Student Account  
- **Email**: `student@scholarrank.com`
- **Password**: `student123`
- **Role**: Student

## How to Test

1. **Start Application**:
   ```bash
   python start.py
   ```

2. **Access Pages**:
   - Homepage: http://localhost:8000/home
   - Login: http://localhost:8000/login  
   - Register: http://localhost:8000/register

3. **Test Login**:
   - Use teacher credentials → Should redirect to teacher dashboard
   - Use student credentials → Should redirect to student dashboard

4. **Test Registration**:
   - Create new account with any email/password
   - Should redirect to appropriate dashboard

## Current Status

✅ MongoDB: Connected and working
✅ FastAPI: Server starts successfully  
✅ Static Files: CSS and JS serving correctly
✅ Templates: All pages loading properly
✅ Authentication: Basic login/register flow working
✅ Glass Morphism: UI effects applied
✅ Theme Toggle: Light/dark mode functional

## Features Working

- Separate login and register pages
- Glass morphism UI with background image
- Theme toggle functionality
- Responsive design
- Error handling and validation
- Session management
- Redirect to appropriate dashboards

The application is ready for testing!
