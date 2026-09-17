const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');
const path = require('path');

// ==============================
// AFK DATA
// ==============================

const dataFolder = path.join(__dirname, '../../../data');
const dataFile = path.join(dataFolder, 'afk.json');

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '{}');
}

let afkUsers = new Map();

// Load saved AFK users
try {
    const savedData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    for (const [userId, data] of Object.entries(savedData)) {
        afkUsers.set(userId, data);
    }
} catch (error) {
    console.error('Failed to load AFK data:', error);
}

// Save AFK users
function saveAfkUsers() {
    const data = Object.fromEntries(afkUsers);

    fs.writeFileSync(
        dataFile,
        JSON.stringify(data, null, 4)
    );
}

// ==============================
// TIME FORMAT
// ==============================

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    // Show seconds only if AFK for less than a minute
    if (parts.length === 0) {
        parts.push(`${secs}s`);
    }

    return parts.join(' ');
}

// ==============================
// COMMAND
// ==============================

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set or remove your AFK status.')
        .addStringOption(option =>
            option
                .setName('status')
                .setDescription('The reason/status shown while you are AFK.')
                .setRequired(false)
                .setMaxLength(500)
        ),

    async execute(interaction) {

        const userId = interaction.user.id;
        const status = interaction.options.getString('status');

        // ==============================
        // REMOVE AFK
        // ==============================

        if (!status) {

            if (!afkUsers.has(userId)) {
                return interaction.reply({
                    content: '🔔 You are not currently AFK.',
                    ephemeral: true
                });
            }

            const afkData = afkUsers.get(userId);
            const duration = formatDuration(Date.now() - afkData.startedAt);

            afkUsers.delete(userId);
            saveAfkUsers();

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `🔔 **${interaction.user.username}** is no longer AFK!\n\n` +
                            `They were AFK for **${duration}**.`
                        )
                        .setColor(0x9b59b6)
                ]
            });
        }

        // ==============================
        // SET / UPDATE AFK
        // ==============================

        const existing = afkUsers.get(userId);

        const afkData = {
            status: status,
            startedAt: existing ? existing.startedAt : Date.now()
        };

        afkUsers.set(userId, afkData);
        saveAfkUsers();

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `🟠 **${interaction.user.username}** is currently AFK!\n\n` +
                        `> ${status}\n\n` +
                        `They have been AFK for **0s**.`
                    )
                    .setColor(0x9b59b6)
            ]
        });
    },


    // Export the AFK users so messageCreate.js can access them
    afkUsers
};
