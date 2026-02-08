<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Redis Playground: The Robot Warehouse

[![Live Demo](https://img.shields.io/badge/Live-Demo-red?style=for-the-badge&logo=redis)](https://redis.bhavinsachaniya.in)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

Master Redis commands through an interactive robot warehouse simulation. Learn key-value operations, data structures, and best practices with hands-on exercises.

## 🚀 Features

- 📚 **6 Interactive Modules**: Learn strings, expiration, lists, sets, hashes, and housekeeping
- 🤖 **Visual Warehouse**: See your Redis operations come to life
- 💻 **Real-time CLI Simulation**: Practice Redis commands in a safe environment
- ✨ **Progressive Learning**: Step-by-step guidance from beginner to advanced
- 🎯 **Hands-on Exercises**: Complete tasks to master each command
- 📱 **Mobile Responsive**: Learn on any device

## 🎓 What You'll Learn

1. **The Basics**: Strings, SET, GET, EXISTS, DEL
2. **Expiration**: EXPIRE, TTL, PERSIST
3. **Lists**: LPUSH, RPUSH, LPOP, LRANGE
4. **Sets**: SADD, SMEMBERS, SISMEMBER
5. **Hashes**: HSET, HGET, HGETALL
6. **Housekeeping**: KEYS, INFO, FLUSHALL

## 🏃 Run Locally

**Prerequisites:** Node.js 20+

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set environment variables** (if needed)
   ```bash
   # Create .env.local file
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 🚢 Deploy to Cloudflare Pages

### Via Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist
```

### Via Cloudflare Dashboard

1. Connect your GitHub repository
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `20`
3. Deploy!

## 🔍 SEO & Production Features

✅ **SEO Optimized**
- Comprehensive meta tags
- Open Graph & Twitter Cards
- Structured data (JSON-LD)
- Sitemap & robots.txt

✅ **Performance**
- Optimized caching headers
- Static asset optimization
- Fast load times

✅ **Security**
- Content Security Policy
- Security headers
- XSS protection

✅ **PWA Support**
- Web App Manifest
- Installable on mobile
- Offline-ready structure

📖 See [SEO_CHECKLIST.md](SEO_CHECKLIST.md) for complete SEO details.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v3
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages

## 📂 Project Structure

```
├── components/          # React components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Terminal.tsx    # CLI terminal simulator
│   ├── WarehouseVisualizer.tsx
│   └── StepGuide.tsx   # Step-by-step guide
├── services/           # Business logic
│   └── mockRedis.ts    # Redis command simulation
├── public/             # Static assets
│   ├── robots.txt      # SEO: Search engine directives
│   ├── sitemap.xml     # SEO: Site structure
│   ├── manifest.json   # PWA: App manifest
│   ├── _headers        # Cloudflare: Security headers
│   └── _redirects      # Cloudflare: SPA routing
├── constants.ts        # Curriculum data
├── types.ts           # TypeScript definitions
└── App.tsx            # Main application

```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this project for learning and teaching!

## 👨‍💻 Author

**Bhavin Sachaniya**

- Website: [bhavinsachaniya.in](https://bhavinsachaniya.in)
- GitHub: [@bhavinsachaniya](https://github.com/bhavinsachaniya)
- LinkedIn: [Bhavin Sachaniya](https://linkedin.com/in/bhavinsachaniya)

## 🙏 Acknowledgments

- Inspired by the power of Redis
- Built with modern web technologies
- Designed for developers learning Redis

---

<div align="center">
Made with ❤️ for the developer community
</div>
