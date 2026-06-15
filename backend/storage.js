import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');

const MAX_PARTICIPANTS = 10;
const MAX_CHARS_PER_STORY = 500;

const PRESET_COVER_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8B500',
  '#52BE80'
];

const PRESET_EMOJIS = [
  '📖',
  '✨',
  '🌟',
  '🎭',
  '🏰',
  '🌈',
  '🦄',
  '🌙',
  '☀️',
  '🌸',
  '🎨',
  '🎪',
  '🚀',
  '🗺️',
  '🔮',
  '🎵',
  '❤️',
  '🔥',
  '💎',
  '🌊'
];

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ stories: [] }, null, 2));
  }
}

function readData() {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  return data;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return 'story_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function ensureCoverFields(story) {
  const hasCoverColor = story.coverColor && PRESET_COVER_COLORS.includes(story.coverColor);
  const hasEmoji = story.emoji && PRESET_EMOJIS.includes(story.emoji);
  if (!hasCoverColor || !hasEmoji) {
    const seed = story.id || story.title || String(Date.now());
    const hash = hashString(seed);
    if (!hasCoverColor) {
      story.coverColor = PRESET_COVER_COLORS[hash % PRESET_COVER_COLORS.length];
    }
    if (!hasEmoji) {
      story.emoji = PRESET_EMOJIS[hash % PRESET_EMOJIS.length];
    }
  }
  return story;
}

function createStory({ title, content, author, coverColor, emoji }) {
  const data = readData();
  const story = {
    id: generateId(),
    title,
    entries: [
      {
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        content,
        author,
        createdAt: new Date().toISOString()
      }
    ],
    coverColor: coverColor || PRESET_COVER_COLORS[Math.floor(Math.random() * PRESET_COVER_COLORS.length)],
    emoji: emoji || PRESET_EMOJIS[Math.floor(Math.random() * PRESET_EMOJIS.length)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.stories.unshift(story);
  writeData(data);
  return story;
}

function getAllStories() {
  const data = readData();
  return data.stories.map(story => {
    const safeStory = ensureCoverFields({ ...story });
    return {
      id: safeStory.id,
      title: safeStory.title,
      entriesCount: safeStory.entries.length,
      lastAuthor: safeStory.entries[safeStory.entries.length - 1].author,
      coverColor: safeStory.coverColor,
      emoji: safeStory.emoji,
      createdAt: safeStory.createdAt,
      updatedAt: safeStory.updatedAt,
      preview: safeStory.entries[0].content.substring(0, 100) + (safeStory.entries[0].content.length > 100 ? '...' : '')
    };
  });
}

function getStoryById(id) {
  const data = readData();
  const story = data.stories.find(s => s.id === id);
  if (!story) return null;
  return ensureCoverFields({ ...story });
}

function addEntry(storyId, { content, author }) {
  const data = readData();
  const story = data.stories.find(s => s.id === storyId);
  if (!story) {
    return { success: false, code: 404, error: '故事不存在' };
  }
  if (story.entries.length >= MAX_PARTICIPANTS) {
    return { success: false, code: 400, error: `故事已达到最大参与人数 ${MAX_PARTICIPANTS}` };
  }
  if (content.length > MAX_CHARS_PER_STORY) {
    return { success: false, code: 400, error: `续写内容不能超过 ${MAX_CHARS_PER_STORY} 字` };
  }
  const lastAuthor = story.entries[story.entries.length - 1].author;
  if (lastAuthor === author) {
    return { success: false, code: 400, error: '不能连续续写' };
  }
  story.entries.push({
    id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    content,
    author,
    createdAt: new Date().toISOString()
  });
  story.updatedAt = new Date().toISOString();
  writeData(data);
  return { success: true, story };
}

function resetStory(storyId) {
  const data = readData();
  const story = data.stories.find(s => s.id === storyId);
  if (!story) {
    return { success: false, code: 404, error: '故事不存在' };
  }
  if (story.entries.length > 1) {
    story.entries = [story.entries[0]];
    story.updatedAt = new Date().toISOString();
    writeData(data);
  }
  return { success: true, story };
}

function getPresetCoverColors() {
  return PRESET_COVER_COLORS;
}

function getPresetEmojis() {
  return PRESET_EMOJIS;
}

export {
  createStory,
  getAllStories,
  getStoryById,
  addEntry,
  resetStory,
  MAX_PARTICIPANTS,
  MAX_CHARS_PER_STORY,
  getPresetCoverColors,
  getPresetEmojis,
  PRESET_COVER_COLORS,
  PRESET_EMOJIS
};
