const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { afkUsers } = require('./afk');

function formatDuration(ms) {
    let seconds = Math.floor(ms / 1000);

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);

    const parts = [];

    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);

    if (!parts.length) {
        parts.push(`${Math.max(1, seconds)}s`);
    }

    return parts.join(' ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unafk')
        .setDescription('Remove your AFK status'),

    async execute(interaction) {
        const afkData = afkUsers.get(interaction.user.id);

        if (!afkData) {
            return interaction.reply({
                content: '❌ You are not currently AFK.',
                ephemeral: true
            });
        }

        const duration = formatDuration(
            Date.now() - afkData.timestamp
        );

        afkUsers.delete(interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor(0x8A0303)
            .setDescription(
                `🔴 **${interaction.user}** is no longer AFK!\n\n` +
                `They were AFK for **${duration}**.`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};
