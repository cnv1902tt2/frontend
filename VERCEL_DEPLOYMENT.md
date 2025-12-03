# Hướng Dẫn Deploy Frontend lên Vercel

## Bước 1: Chuẩn Bị Code

### 1.1. Xóa quotes trong .env
File `.env` không cần quotes cho giá trị:
```env
REACT_APP_API_URL=https://api-keymanagement.onrender.com
REACT_APP_SITE_NAME=Simple Bim
```

### 1.2. Tạo .gitignore (nếu chưa có)
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### 1.3. Push code lên GitHub
```cmd
cd d:\Workspace\Revit\Web\frontend

# Khởi tạo git (nếu chưa có)
git init

# Add files
git add .

# Commit
git commit -m "Initial frontend deployment"

# Tạo repo trên GitHub: https://github.com/new
# Sau đó link:
git remote add origin https://github.com/YOUR_USERNAME/revit-key-frontend.git
git branch -M main
git push -u origin main
```

---

## Bước 2: Deploy lên Vercel (Recommended - Miễn phí)

### 2.1. Đăng ký Vercel
1. Truy cập: https://vercel.com/signup
2. Đăng nhập bằng GitHub
3. Authorize Vercel để truy cập GitHub repos

### 2.2. Import Project
1. Truy cập: https://vercel.com/new
2. Click **Import Git Repository**
3. Chọn repository `revit-key-frontend`
4. Click **Import**

### 2.3. Cấu hình Project
**Framework Preset:** 
- Vercel tự động nhận diện **Create React App**

**Build Settings:**
- **Build Command**: `npm run build` (tự động)
- **Output Directory**: `build` (tự động)
- **Install Command**: `npm install` (tự động)

**Root Directory:**
- Nếu repo của bạn có thư mục cha `Web`, chọn `frontend` làm root
- Nếu repo chỉ có frontend, để trống

### 2.4. Environment Variables
Click **Environment Variables** và thêm:

```
REACT_APP_API_URL = https://api-keymanagement.onrender.com
REACT_APP_SITE_NAME = Simple Bim
```

⚠️ **Lưu ý:** 
- KHÔNG có dấu ngoặc kép
- Environment variables sẽ được build vào code (không thể thay đổi sau khi deploy)
- URL backend phải chính xác

### 2.5. Deploy
1. Click **Deploy**
2. Đợi 2-5 phút để Vercel build và deploy
3. Theo dõi logs trong màn hình deploy

### 2.6. URL của bạn
Sau khi deploy thành công:
```
https://revit-key-frontend.vercel.app
```
hoặc
```
https://your-project-name-abc123.vercel.app
```

---

## Bước 3: Cập Nhật CORS Backend

Sau khi có URL frontend, cập nhật backend CORS:

### 3.1. Trên Render Dashboard
1. Vào service `revit-key-backend`
2. **Environment** → Edit `CORS_ORIGINS`
3. Thay đổi từ:
   ```
   CORS_ORIGINS = *
   ```
   Sang:
   ```
   CORS_ORIGINS = https://revit-key-frontend.vercel.app,http://localhost:3000
   ```
4. **Manual Deploy** → **Deploy latest commit**

---

## Bước 4: Custom Domain (Optional)

### 4.1. Thêm Domain của bạn
1. Trong Vercel project → **Settings** → **Domains**
2. Nhập domain: `yourdomain.com`
3. Vercel sẽ hướng dẫn cấu hình DNS
4. Thêm records vào DNS provider (Cloudflare, GoDaddy, etc.):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 4.2. Cập nhật CORS Backend
Thêm custom domain vào `CORS_ORIGINS`:
```
CORS_ORIGINS = https://yourdomain.com,https://www.yourdomain.com,http://localhost:3000
```

---

## Bước 5: Test Deployment

### 5.1. Kiểm tra Frontend
1. Truy cập: https://revit-key-frontend.vercel.app
2. Test login với `admin` / `@Abc12324`
3. Test tạo key mới
4. Kiểm tra responsive trên mobile

### 5.2. Kiểm tra API Connection
Mở DevTools → Console, kiểm tra:
- Không có CORS errors
- API requests đi đến đúng backend URL
- Responses trả về đúng dữ liệu

### 5.3. Test PWA (Progressive Web App)
1. Trên mobile, mở site trong browser
2. Tap "Add to Home Screen"
3. App sẽ hoạt động như native app

---

## Alternative: Deploy lên Netlify

### Option B.1. Netlify Deploy
1. Truy cập: https://app.netlify.com/start
2. Connect GitHub
3. Chọn repository `revit-key-frontend`
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `build`
5. **Environment variables:**
   ```
   REACT_APP_API_URL = https://api-keymanagement.onrender.com
   REACT_APP_SITE_NAME = Simple Bim
   ```
6. Click **Deploy site**

### Option B.2. Netlify URL
```
https://your-site-name.netlify.app
```

---

## Alternative: Deploy lên Render (Static Site)

### Option C.1. Render Static Site
1. Truy cập: https://dashboard.render.com/
2. Click **New** → **Static Site**
3. Connect repository
4. **Settings:**
   - Build Command: `npm run build`
   - Publish Directory: `build`
5. **Environment variables:**
   ```
   REACT_APP_API_URL = https://api-keymanagement.onrender.com
   REACT_APP_SITE_NAME = Simple Bim
   ```
6. Click **Create Static Site**

---

## Bước 6: Auto Deploy (CI/CD)

### 6.1. Vercel Auto Deploy
✅ Mặc định, Vercel tự động deploy khi:
- Push code lên branch `main`
- Merge Pull Request
- Tạo new branch (preview deployment)

### 6.2. Deploy Preview
- Mỗi branch/PR sẽ có URL preview riêng
- Test trước khi merge vào production
- VD: `https://revit-key-frontend-git-feature-abc.vercel.app`

### 6.3. Rollback
- Vercel → **Deployments** → Chọn deployment cũ
- Click **⋯** → **Promote to Production**

---

## Troubleshooting

### Lỗi: "Build failed"
**Nguyên nhân:** Dependencies hoặc build errors
**Fix:**
```cmd
# Test build local:
cd d:\Workspace\Revit\Web\frontend
npm run build

# Nếu có lỗi, fix rồi push lại
```

### Lỗi: "Environment variables not working"
**Nguyên nhân:** Vercel không rebuild sau khi thêm env
**Fix:**
1. Vào **Deployments** → Latest deployment
2. Click **⋯** → **Redeploy**
3. ✅ Check "Use existing Build Cache" = OFF

### Lỗi: "CORS still blocked"
**Nguyên nhân:** Backend CORS chưa có frontend URL
**Fix:**
```env
# Render backend environment:
CORS_ORIGINS = https://revit-key-frontend.vercel.app,http://localhost:3000
```

### Lỗi: "API calls fail"
**Nguyên nhân:** 
- REACT_APP_API_URL có dấu `/` cuối
- Backend URL sai
**Fix:**
```env
# Bỏ dấu / cuối:
REACT_APP_API_URL=https://api-keymanagement.onrender.com
```

### Lỗi: "Route not found on refresh"
**Nguyên nhân:** React Router cần SPA fallback
**Fix Vercel:** Tạo file `vercel.json` trong frontend root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Lỗi: "Can't find react-scripts"
**Nguyên nhân:** Dependencies không đúng
**Fix:**
```cmd
cd d:\Workspace\Revit\Web\frontend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Fix dependencies"
git push
```

---

## Chi Phí

### Vercel Free Plan (Đủ cho production nhỏ):
- **Bandwidth**: 100 GB/month
- **Build time**: 6000 minutes/month
- **Deployments**: Unlimited
- **SSL**: Free (tự động)
- **Custom domain**: Free (unlimited)
- **Total**: $0/month

### Vercel Pro Plan (Nếu cần scale):
- **Bandwidth**: 1 TB/month
- **Build time**: Unlimited
- **Team collaboration**: Yes
- **Total**: $20/month

---

## Checklist Deploy

- [ ] Xóa quotes trong `.env`
- [ ] Tạo `.gitignore` cho frontend
- [ ] Push code lên GitHub
- [ ] Deploy trên Vercel/Netlify/Render
- [ ] Cấu hình Environment Variables
- [ ] Đợi build hoàn tất (2-5 phút)
- [ ] Copy URL frontend
- [ ] Cập nhật `CORS_ORIGINS` trên backend
- [ ] Redeploy backend
- [ ] Test login và key management
- [ ] Test trên mobile
- [ ] (Optional) Setup custom domain

---

## So Sánh Platforms

| Feature | Vercel | Netlify | Render Static |
|---------|--------|---------|---------------|
| **Free Plan** | ✅ Generous | ✅ Good | ✅ Limited |
| **Build Time** | ⚡ Very Fast | ⚡ Fast | 🐌 Slower |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free |
| **CDN** | ✅ Global | ✅ Global | ⚠️ Limited |
| **Preview Deploy** | ✅ Yes | ✅ Yes | ❌ No |
| **Best For** | React/Next | Any static | Backend + Frontend |

**Recommendation:** **Vercel** cho React apps (tốc độ build nhanh, CDN toàn cầu, preview deployments)

---

## Tài Liệu

- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Create React App Deploy: https://create-react-app.dev/docs/deployment/

**🎉 Chúc bạn deploy thành công!**
