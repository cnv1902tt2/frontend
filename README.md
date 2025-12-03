# Simple Bim - Frontend

React-based Progressive Web App for managing Revit license keys.

## Features

✅ **Authentication System**
- Login with username/password
- Forgot password with OTP email verification
- JWT token-based authentication
- Protected routes

✅ **Key Management**
- Create keys (Trial, Monthly, Yearly, Lifetime)
- List all keys with search and filter
- Update key status (Active/Inactive) and notes
- Delete keys
- View machine info and usage statistics

✅ **Progressive Web App (PWA)**
- Installable on mobile and desktop
- Offline support with service worker
- Responsive design for all screen sizes
- App-like experience

✅ **Mobile-First Design**
- Fully responsive layout
- Touch-friendly UI elements
- Adaptive tables for small screens
- Optimized for mobile devices

## Setup

### Prerequisites
- Node.js 16+ and npm
- Backend API running on `http://127.0.0.1:8000`

### Installation

1. Navigate to frontend directory:
```cmd
cd frontend
```

2. Install dependencies:
```cmd
npm install
```

3. Configure environment variables:
```cmd
copy .env.example .env
```

Edit `.env` to set your API URL:
```env
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_SITE_NAME=Simple Bim
```

4. Start development server:
```cmd
npm start
```

App will open at `http://localhost:3000`

### Production Build

```cmd
npm run build
```

Build output will be in `build/` directory.

## Project Structure

```
frontend/
├── public/
│   ├── css/              # CloudBOX template CSS
│   ├── js/               # CloudBOX template JS
│   ├── images/           # Logos and assets
│   ├── vendor/           # Third-party libraries
│   ├── manifest.json     # PWA manifest
│   └── index.html        # HTML template
├── src/
│   ├── components/       # Reusable components
│   │   ├── ProtectedRoute.js
│   │   ├── Sidebar.js
│   │   └── Navbar.js
│   ├── context/          # React Context
│   │   └── AuthContext.js
│   ├── pages/            # Page components
│   │   ├── Login.js
│   │   ├── ForgotPassword.js
│   │   └── KeyManagement.js
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.js            # Main app component
│   ├── index.js          # Entry point
│   ├── index.css         # Global styles
│   ├── service-worker.js # PWA service worker
│   └── serviceWorkerRegistration.js
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md             # This file
```

## Pages

### 1. Login (`/login`)
- Username and password authentication
- Remember me functionality
- Link to forgot password

### 2. Forgot Password (`/forgot-password`)
- Step 1: Enter email and new password
- Step 2: Enter OTP code from email
- Password reset confirmation

### 3. Key Management (`/dashboard`, `/keys`)
- Create new keys with type selection
- List keys with search functionality
- Edit key status and notes
- Delete keys
- View machine information
- Real-time status updates

## API Integration

All API calls use environment variables from `.env`:

```javascript
// Example API usage
import { authAPI, keyAPI } from './services/api';

// Login
const response = await authAPI.login(username, password);

// Create key
const key = await keyAPI.create('trial', 'Test key');

// List keys
const keys = await keyAPI.list();
```

### Endpoints Used

- `POST /auth/login` - User authentication
- `POST /auth/request-reset` - Request password reset OTP
- `POST /auth/verify-reset` - Verify OTP and reset password
- `POST /keys/create` - Create new key
- `GET /keys/list` - List all keys
- `GET /keys/{key_value}` - Get key details
- `PUT /keys/{key_value}` - Update key
- `DELETE /keys/{key_value}` - Delete key

## PWA Features

### Installation
Users can install the app on:
- Mobile devices (iOS, Android)
- Desktop (Chrome, Edge, Safari)

### Offline Support
- Static assets cached for offline use
- API responses cached with stale-while-revalidate strategy
- Graceful fallback when offline

### App Configuration
Edit `public/manifest.json` to customize:
- App name and description
- Theme colors
- Icons
- Display mode

## Responsive Design

### Breakpoints
- **Desktop**: > 768px
- **Tablet**: 768px - 576px
- **Mobile**: < 576px

### Mobile Optimizations
- Collapsible sidebar
- Touch-friendly buttons
- Stacked table layout on small screens
- Optimized modals and forms
- Reduced font sizes
- Improved spacing

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://127.0.0.1:8000` |
| `REACT_APP_SITE_NAME` | Application name | `Simple Bim` |

## Deployment

### Static Hosting (Netlify, Vercel)
```cmd
npm run build
```
Deploy `build/` directory

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables in Production
Set `REACT_APP_API_URL` to your production API endpoint before building.

## Development

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.js`
3. Update navigation in `src/components/Sidebar.js`

### Adding New API Endpoints
1. Add method to `src/services/api.js`
2. Use in components with error handling

### Styling
- Use existing CloudBOX classes
- Add custom styles in `src/index.css`
- Maintain responsive breakpoints

## Troubleshooting

### CORS Issues
Ensure backend has proper CORS configuration:
```python
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### API Connection Failed
Check `.env` file has correct `REACT_APP_API_URL`

### Build Errors
Clear cache and reinstall:
```cmd
del /s /q node_modules
del package-lock.json
npm install
```

### PWA Not Installing
- Ensure HTTPS in production
- Check `manifest.json` is valid
- Verify service worker is registered

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

- Template: CloudBOX Bootstrap Admin Dashboard
- Icons: Line Awesome, Remix Icon, Font Awesome
- React: Meta Open Source
