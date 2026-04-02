#!/usr/bin/env node
/**
 * News Fetching Script
 * Fetches news from RSS feeds and free APIs
 * Updates src/data/news.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'DailyNewsDigest/1.0'
  }
});

// RSS Feed Sources - Expanded with more reliable sources
const RSS_SOURCES = {
  philippines: [
    'https://www.inquirer.net/fullfeed',
    'https://www.rappler.com/rss/',
    'https://mb.com.ph/feed/',
  ],
  energy: [
    'https://www.marketwatch.com/rss/marketpulse',
    'https://www.investing.com/rss/news.rss',
    'https://feeds.bbci.co.uk/news/business/rss.xml',
  ],
  tech: [
    'https://www.cnbc.com/id/19854910/device/rss/rss.html',
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://www.wired.com/feed/rss',
  ],
  gaming: [
    'https://www.polygon.com/rss/index.xml',
    'https://kotaku.com/rss',
    'https://www.ign.com/rss/articles/feed',
  ],
  world: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.cnn.com/rss/edition_world.rss',
    'https://feeds.reuters.com/reuters/worldnews',
  ],
  sports: [
    'https://www.espn.com/espn/rss/news',
    'https://feeds.bbci.co.uk/sport/rss.xml',
    'https://www.sportsnet.ca/feed/',
  ],
  entertainment: [
    'https://variety.com/feed/',
    'https://deadline.com/feed/',
    'https://www.hollywoodreporter.com/feed/',
  ]
};

// Free API Sources
const GN_FREE_API_KEY = process.env.GNEWS_API_KEY || 'YOUR_GNEWS_API_KEY';
const MARKETAUX_FREE_API_KEY = process.env.MARKETAUX_API_KEY || 'YOUR_MARKETAUX_API_KEY';

async function fetchFromRSS(category, feeds) {
  const articles = [];
  
  for (const feedUrl of feeds) {
    try {
      console.log(`Fetching RSS: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items.slice(0, 3)) {
        if (item.title && item.link) {
          articles.push({
            title: item.title,
            description: item.contentSnippet || item.content || '',
            source: feed.title || new URL(feedUrl).hostname,
            url: item.link,
            publishedAt: item.isoDate || new Date().toISOString(),
            imageUrl: item.enclosure?.url || null,
            category: category
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${feedUrl}: ${error.message}`);
    }
  }
  
  return articles;
}

async function fetchFromGNews(category, query) {
  if (GN_FREE_API_KEY === 'YOUR_GNEWS_API_KEY') {
    console.log(`Skipping GNews for ${category} - no API key`);
    return [];
  }
  
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${GN_FREE_API_KEY}`;
    
    console.log(`Fetching GNews: ${query}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return (data.articles || []).map(article => ({
      title: article.title,
      description: article.description || '',
      source: article.source?.name || 'GNews',
      url: article.url,
      publishedAt: article.publishedAt,
      imageUrl: article.image || null,
      category: category
    }));
  } catch (error) {
    console.warn(`GNews fetch failed: ${error.message}`);
    return [];
  }
}

async function fetchFromMarketaux(query) {
  if (MARKETAUX_FREE_API_KEY === 'YOUR_MARKETAUX_API_KEY') {
    console.log(`Skipping marketaux - no API key`);
    return [];
  }
  
  try {
    const url = `https://api.marketaux.com/v1/news/all?search=${encodeURIComponent(query)}&limit=5&api_token=${MARKETAUX_FREE_API_KEY}`;
    
    console.log(`Fetching marketaux: ${query}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`marketaux API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return (data.data || []).map(article => ({
      title: article.title,
      description: article.description || '',
      source: article.source || 'Marketaux',
      url: article.url,
      publishedAt: article.published_at,
      imageUrl: article.image_url || null,
      category: 'tech'
    }));
  } catch (error) {
    console.warn(`marketaux fetch failed: ${error.message}`);
    return [];
  }
}

async function fetchAllNews() {
  console.log('🚀 Starting news fetch...\n');
  
  const news = {
    philippines: [],
    energy: [],
    tech: [],
    gaming: [],
    world: [],
    sports: [],
    entertainment: [],
    lastUpdated: new Date().toISOString()
  };
  
  // Fetch Philippines news
  console.log('📍 Fetching Philippines news...');
  const phRSS = await fetchFromRSS('philippines', RSS_SOURCES.philippines);
  const phAPI = await fetchFromGNews('philippines', 'Philippines Manila Makati BGC');
  news.philippines = [...phRSS, ...phAPI].slice(0, 8);
  console.log(`✅ Got ${news.philippines.length} Philippines articles\n`);
  
  // Fetch Energy & Markets news
  console.log('⚡ Fetching Energy & Markets news...');
  const energyRSS = await fetchFromRSS('energy', RSS_SOURCES.energy);
  const energyAPI = await fetchFromGNews('energy', 'oil gas energy stock market finance');
  news.energy = [...energyRSS, ...energyAPI].slice(0, 8);
  console.log(`✅ Got ${news.energy.length} Energy articles\n`);
  
  // Fetch Tech news
  console.log('📈 Fetching Tech Stocks news...');
  const techRSS = await fetchFromRSS('tech', RSS_SOURCES.tech);
  const techAPI = await fetchFromGNews('tech', 'AI stocks semiconductor NASDAQ tech');
  const marketauxNews = await fetchFromMarketaux('AI stocks memory photonics');
  news.tech = [...techRSS, ...techAPI, ...marketauxNews].slice(0, 8);
  console.log(`✅ Got ${news.tech.length} Tech articles\n`);
  
  // Fetch Gaming news
  console.log('🎮 Fetching Gaming news...');
  const gamingRSS = await fetchFromRSS('gaming', RSS_SOURCES.gaming);
  const gamingAPI = await fetchFromGNews('gaming', 'video games gaming PlayStation Xbox Nintendo');
  news.gaming = [...gamingRSS, ...gamingAPI].slice(0, 8);
  console.log(`✅ Got ${news.gaming.length} Gaming articles\n`);
  
  // Fetch World news
  console.log('🌍 Fetching World news...');
  const worldRSS = await fetchFromRSS('world', RSS_SOURCES.world);
  const worldAPI = await fetchFromGNews('world', 'world news international Asia Europe');
  news.world = [...worldRSS, ...worldAPI].slice(0, 8);
  console.log(`✅ Got ${news.world.length} World articles\n`);
  
  // Fetch Sports news
  console.log('⚽ Fetching Sports news...');
  const sportsRSS = await fetchFromRSS('sports', RSS_SOURCES.sports);
  const sportsAPI = await fetchFromGNews('sports', 'NBA football soccer sports');
  news.sports = [...sportsRSS, ...sportsAPI].slice(0, 8);
  console.log(`✅ Got ${news.sports.length} Sports articles\n`);
  
  // Fetch Entertainment news
  console.log('🎬 Fetching Entertainment news...');
  const entRSS = await fetchFromRSS('entertainment', RSS_SOURCES.entertainment);
  const entAPI = await fetchFromGNews('entertainment', 'movies TV shows celebrity entertainment');
  news.entertainment = [...entRSS, ...entAPI].slice(0, 8);
  console.log(`✅ Got ${news.entertainment.length} Entertainment articles\n`);
  
  // Save to file
  const dataPath = path.join(__dirname, '..', 'data', 'news.json');
  await fs.writeFile(dataPath, JSON.stringify(news, null, 2));
  
  const totalArticles = Object.values(news).filter(v => Array.isArray(v)).reduce((a, b) => a + b.length, 0);
  console.log(`💾 News saved to ${dataPath}`);
  console.log(`📊 Total articles: ${totalArticles}`);
  console.log(`⏰ Last updated: ${news.lastUpdated}`);
  
  return news;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAllNews().catch(error => {
    console.error('❌ Error fetching news:', error);
    process.exit(1);
  });
}

export { fetchAllNews };
