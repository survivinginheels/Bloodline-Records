const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const options = [
    {
        name: '🏝️ Booster Role of Choice',
        description: 'Choose any available booster role.',
        type: 'boosterRole'
    },
    {
        name: '🌊 +1 Level',
        description: 'You gain one level.',
        type: 'level'
    },
    {
        name: '💎 Booster Perks — 24 Hours',
        description: 'Access booster perks for one day.',
        type: 'perks'
    },
    {
        name: '💰 +500 Coins',
        description: 'You found something valuable on the island.',
        type: 'coins'
    },
    {
        name: '🗺️ Treasure Finder',
        description: 'You get a special treasure reward.',
        type: 'treasure'
    },
    {
        name: '☠️ Nothing',
        description: 'The compass led you nowhere.',
        type: 'nothing'
    },
    {
        name: '🌴 +250 Coins',
        description: 'A small piece of the treasure.',
        type: 'coins250'
    },
    {
        name: '🧭 Spin Again',
        description: 'The compass gives you another chance.',
        type: 'again'
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deathcompass')
        .setDescription('Spin the Death Compass and see what fate has waiting for you.'),

    async execute(interaction) {

        // Randomly choose an option
        const result = options[Math.floor(Math.random() * options.length)];

        const embed = new EmbedBuilder()
            .setTitle('☠️ THE DEATH COMPASS')
            .setDescription(
                `The compass spins...\n` +
                `The needle turns wildly before finally stopping.\n\n` +
                `**${result.name}**\n` +
                `*${result.description}*`
            )
            .setFooter({
                text: `Spun by ${interaction.user.username} • Paradise on Earth`
            })
            .setTimestamp();

        const row = new ActionRowBuilder();

        // Special button for booster role
        if (result.type === 'boosterRole') {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`boosterrole_${interaction.user.id}`)
                    .setLabel('Claim Booster Role')
                    .setEmoji('💎')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        // Special button for level
        if (result.type === 'level') {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`level_${interaction.user.id}`)
                    .setLabel('Claim +1 Level')
                    .setEmoji('🌊')
                    .setStyle(ButtonStyle.Success)
            );
        }

        // Special button for 24-hour perks
        if (result.type === 'perks') {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`perks_${interaction.user.id}`)
                    .setLabel('Claim 24H Perks')
                    .setEmoji('💎')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        // Spin again button
        if (result.type === 'again') {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`deathcompass_${interaction.user.id}`)
                    .setLabel('Spin Again')
                    .setEmoji('🧭')
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        await interaction.reply({
            embeds: [embed],
            components: row.components.length ? [row] : []
        });
    }
};
