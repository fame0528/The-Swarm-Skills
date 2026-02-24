#!/usr/bin/env node
// send-embed.js — Olympus Rich Embed Sender (Hardened)
// Sends embed with avatar URLs directly. Includes Enum validation and Rate Limit retries.

const https = require('https');
const fs = require('fs');

// Olympus Imgur URLs mappings (The Core Enum)
const avatarUrls = {
    atlas: 'https://i.imgur.com/80VX159.png',
    ares: 'https://i.imgur.com/NHZBOIN.png',
    athena: 'https://i.imgur.com/JseK5FO.png',
    brain: 'https://i.imgur.com/z6TiDJ1.png',
    epimetheus: 'https://i.imgur.com/U5zgXt4.png',
    hephaestus: 'https://i.imgur.com/SZ2zrut.png',
    hermes: 'https://i.imgur.com/cHVmCOl.png',
    hyperion: 'https://i.imgur.com/NmPN0AC.png',
    kronos: 'https://i.imgur.com/WsYqBgL.png',
    mnemosyne: 'https://i.imgur.com/FRsbeqE.png',
    prometheus: 'https://i.imgur.com/hG3j8R1.png'
};

// Parse command line args
const args = process.argv.slice(2);
const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx !== -1 && idx < args.length - 1 ? args[idx + 1] : null;
};

const channelId = getArg('--channel');
const titleArg = getArg('--title');
const descArg = getArg('--desc');
const colorArg = getArg('--color');
const agentArg = getArg('--agent');
const footerArg = getArg('--footer');
const fieldsB64 = getArg('--fields');

if (!channelId || !titleArg || !descArg) {
    console.error('ERROR: Missing required args --channel, --title, --desc');
    process.exit(1);
}

// 1. AAA HARDENING: Agent Enum Validation
if (agentArg) {
    const agentLower = agentArg.toLowerCase();
    if (!avatarUrls[agentLower]) {
        console.error(`🚨 FATAL: Identity Breach! Attempted to use unauthorized persona: "${agentArg}".`);
        console.error('Only Olympus-verified personas (atlas, ares, athena, hephaestus, etc) are allowed.');
        process.exit(1);
    }
}

// Get bot token from .env
const envPath = 'C:\\Users\\spenc\\.openclaw\\workspace\\.env';
let botToken = '';
if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/DISCORD_BOT_TOKEN=(.+)/);
    if (match) botToken = match[1].trim();
}
if (!botToken) {
    console.error('ERROR: DISCORD_BOT_TOKEN not found in .env');
    process.exit(1);
}

// Color parsing
let color = 0x3498db;
if (colorArg) {
    try {
        color = parseInt(colorArg.replace('0x', ''), 16);
    } catch (e) {
        color = 0x3498db;
    }
}

// Build embed object
const embed = {
    title: titleArg,
    description: descArg,
    color: color,
    timestamp: new Date().toISOString()
};

if (footerArg) {
    embed.footer = { text: footerArg };
}

if (agentArg) {
    const agentLower = agentArg.toLowerCase();
    embed.author = { name: agentLower };
    embed.author.icon_url = avatarUrls[agentLower];
    embed.thumbnail = { url: avatarUrls[agentLower] };
}

if (fieldsB64) {
    try {
        const fieldsJson = Buffer.from(fieldsB64, 'base64').toString('utf8');
        const fields = JSON.parse(fieldsJson);
        embed.fields = fields;
    } catch (err) {
        console.error('WARNING: Failed to parse fields:', err.message);
    }
}

const payload = JSON.stringify({
    content: '',
    embeds: [embed]
});

// 2. AAA HARDENING: Rate Limit Retry Wrapper
const sendRequest = (retryCount = 0) => {
    const options = {
        hostname: 'discord.com',
        path: `/api/channels/${channelId}/messages`,
        method: 'POST',
        headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            // Handle Rate Limit (429)
            if (res.statusCode === 429) {
                const retryAfter = (res.headers['retry-after'] || 1) * 1000;
                if (retryCount < 3) {
                    console.log(`⚠️ Rate Limited! Retrying in ${retryAfter / 1000}s... (Attempt ${retryCount + 1}/3)`);
                    setTimeout(() => sendRequest(retryCount + 1), retryAfter);
                    return;
                }
            }

            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log(`✅ Embed sent to channel ${channelId}`);
                process.exit(0);
            } else {
                console.error(`❌ Discord API error ${res.statusCode}: ${body}`);
                process.exit(1);
            }
        });
    });

    req.on('error', (err) => {
        console.error(`ERROR: Request failed: ${err.message}`);
        process.exit(1);
    });

    req.write(payload);
    req.end();
};

sendRequest();