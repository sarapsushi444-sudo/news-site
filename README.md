# Daily News Digest

A modern, static news aggregation website built with Astro and Tailwind CSS. Features dark mode, mobile-responsive design, and automatic daily updates.

## 🌟 Features

- **3 News Sections**: Philippines, Energy & Geopolitics, US Tech Stocks
- **Dark Mode Toggle**: Seamless light/dark theme switching
- **Auto-Updates**: Daily refresh at 5PM PHT via GitHub Actions
- **Modern Design**: Clean, card-based layout with Tailwind CSS
- **Mobile-Friendly**: Responsive grid layout
- **Free Tier Only**: Uses RSS feeds and free APIs (no paid services required)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd news-site
npm install
```

### 2. Get API Keys (Optional but Recommended)
- **GNews**: [gnews.io](https://gnews.io) - Free tier: 100 requests/day
- **marketaux**: [marketaux.com](https://marketaux.com) - Free tier: 100 requests/day

Add them as GitHub Secrets:
- Go to Settings → Secrets and variables → Actions
- Add `GNEWS_API_KEY` and `MARKETAUX_API_KEY`

### 3. Update the script
Edit `src/scripts/fetch-news.js` and add your API keys:
```javascript
const GN_FREE_API_KEY = 'your-gnews-api-key';
const MARKETAUX_FREE_API_KEY = 'your-marketaux-api-key';
```

### 4. Fetch news manually
```bash
npm run fetch-news
```

### 5. Run dev server
```bash
npm run dev
```

### 6. Build for production
```bash
npm run build
```

## 📅 Automatic Updates

The site updates automatically via GitHub Actions:
- **Schedule**: Every day at 5:00 PM PHT (9:00 AM UTC)
- **Manual trigger**: Go to Actions → Update News Daily → Run workflow

## 📁 Project Structure

```
news-site/
├── .github/workflows/     # GitHub Actions cron job
├── src/
│   ├── components/         # Astro components
│   │   ├── DarkModeToggle.astro
│   │   ├── NewsCard.astro
│   │   └── SectionHeader.astro
│   ├── data/
│   │   └── news.json      # Auto-generated news data
│   ├── layouts/
│   │   └── Layout.astro   # Base layout with dark mode
│   ├── pages/
│   │   └── index.astro    # Main page
│   ├── scripts/
│   │   └── fetch-news.js  # News fetching script
│   └── styles/
│       └── global.css     # Tailwind imports
├── astro.config.mjs       # Astro configuration
├── tailwind.config.mjs    # Tailwind configuration
└── package.json
```

## 🎨 Customization

### Change number of articles per section
Edit `src/pages/index.astro` and change `.slice(0, 8)` to your desired number.

### Add more news sources
Edit `src/scripts/fetch-news.js` and add RSS feeds or API endpoints to `RSS_SOURCES`.

### Change color scheme
Edit `src/components/SectionHeader.astro` and modify the `colorClasses` object.

## 📰 Data Sources

- **Philippines**: Inquirer, Rappler, Manila Bulletin (RSS) + GNews API
- **Energy**: OilPrice.com, Reuters Energy (RSS) + GNews API
- **Tech Stocks**: CNBC Tech, Reuters Technology (RSS) + GNews + marketaux

## 🌐 Deployment

### GitHub Pages (Recommended)
1. Push to GitHub
2. Go to Settings → Pages
3. Select "GitHub Actions" as source
4. The site will auto-deploy on every push

### Other Platforms
- **Vercel**: Connect GitHub repo, auto-deploys
- **Netlify**: Drag and drop the `dist/` folder

## 📝 License

MIT License - Feel free to use and modify!

---

Built with ❤️ using Astro, Tailwind CSS, and GitHub Actions
