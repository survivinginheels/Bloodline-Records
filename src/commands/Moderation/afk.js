const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const afkUsers = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set yourself as AFK')
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason you are AFK')
                .setRequired(false)
        ),

    async execute(interaction) {
        const reason =
            interaction.options.getString('reason') ||
            'No reason provided';

        afkUsers.set(interaction.user.id, {
            reason,
            timestamp: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor(0xF1A500)
            .setDescription(
                `🟠 **${interaction.user}** is currently AFK!\n\n` +
                `**${reason}**`
            );

        await interaction.reply({
            embeds: [embed]
        });
    },

    afkUsers
};
