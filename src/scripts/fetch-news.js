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

// RSS Feed Sources
const RSS_SOURCES = {
  philippines: [
    'https://www.inquirer.net/fullfeed',
    'https://www.rappler.com/rss/',
    'https://mb.com.ph/feed/',
  ],
  energy: [
    'https://oilprice.com/rss',
    'https://www.reuters.com/energy/rss',
  ],
  tech: [
    'https://www.cnbc.com/id/19854910/device/rss/rss.html', // CNBC Tech
    'https://www.reuters.com/technology/rss',
  ]
};

// Free API Sources
const GN_FREE_API_KEY = 'YOUR_GNEWS_API_KEY'; // Get from gnews.io (free tier)
const MARKETAUX_FREE_API_KEY = 'YOUR_MARKETAUX_API_KEY'; // Get from marketaux.com (free tier)

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
  try {
    // GNews free tier: 100 requests/day
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
  try {
    // marketaux free tier: 100 requests/day
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
    lastUpdated: new Date().toISOString()
  };
  
  // Fetch Philippines news
  console.log('📍 Fetching Philippines news...');
  const phRSS = await fetchFromRSS('philippines', RSS_SOURCES.philippines);
  const phAPI = await fetchFromGNews('philippines', 'Philippines Manila Makati BGC');
  news.philippines = [...phRSS, ...phAPI].slice(0, 8);
  console.log(`✅ Got ${news.philippines.length} Philippines articles\n`);
  
  // Fetch Energy news
  console.log('⚡ Fetching Energy & Geopolitics news...');
  const energyRSS = await fetchFromRSS('energy', RSS_SOURCES.energy);
  const energyAPI = await fetchFromGNews('energy', 'oil gas energy geopolitics');
  news.energy = [...energyRSS, ...energyAPI].slice(0, 8);
  console.log(`✅ Got ${news.energy.length} Energy articles\n`);
  
  // Fetch Tech news
  console.log('📈 Fetching Tech Stocks news...');
  const techRSS = await fetchFromRSS('tech', RSS_SOURCES.tech);
  const techAPI = await fetchFromGNews('tech', 'AI stocks semiconductor NASDAQ tech');
  const marketauxNews = await fetchFromMarketaux('AI stocks memory photonics');
  news.tech = [...techRSS, ...techAPI, ...marketauxNews].slice(0, 8);
  console.log(`✅ Got ${news.tech.length} Tech articles\n`);
  
  // Save to file
  const dataPath = path.join(__dirname, '..', 'data', 'news.json');
  await fs.writeFile(dataPath, JSON.stringify(news, null, 2));
  
  console.log(`💾 News saved to ${dataPath}`);
  console.log(`📊 Total articles: ${news.philippines.length + news.energy.length + news.tech.length}`);
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
