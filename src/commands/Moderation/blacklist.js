import {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} from 'discord.js';

import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const BLACKLIST_FILE = path.join(DATA_DIR, 'blacklist.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(BLACKLIST_FILE)) {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify({}, null, 2));
}

function loadBlacklist() {
    try {
        return JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveBlacklist(data) {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(data, null, 2));
}

export default {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Manage the Bloodline Records blacklist.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a user to the blacklist.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to blacklist.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('The reason for blacklisting this user.')
                        .setRequired(true)
                        .setMaxLength(1000)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from the blacklist.')
                .addStringOption(option =>
                    option
                        .setName('user_id')
                        .setDescription('The Discord ID of the user.')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View the server blacklist.')
        ),

    async execute(interaction) {
        if (!interaction.inGuild()) {
            return interaction.reply({
                content: 'This command can only be used in a server.',
                ephemeral: true
            });
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You do not have permission to manage the blacklist.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const blacklist = loadBlacklist();

        if (!blacklist[guildId]) {
            blacklist[guildId] = {};
        }

        const guildBlacklist = blacklist[guildId];

        if (subcommand === 'add')
          {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');

            if (user.id === interaction.user.id) {
                return interaction.reply({
                    content: 'You cannot blacklist yourself.',
                    ephemeral: true
                });
            }

            if (guildBlacklist[user.id]) {
                return interaction.reply({
                    content: 'That user is already on this server’s blacklist.',
                    ephemeral: true
                });
            }

            guildBlacklist[user.id] = {
                username: user.username,
                reason,
                moderatorId:
                  interaction.user.id,
                timestamp: new Date().toISOString()
            };

            saveBlacklist(blacklist);

            const embed = new EmbedBuilder()
                .setColor(0x8B0000)
                .setTitle('𖤐  BLACKLIST RECORD ADDED')
                .setDescription(
                    A new record has been added to the Bloodline Records blacklist.\n\n +
                    **Individual:** ${user.tag}\n +
                    **User ID:** \${user.id}`\n+                    Reason: ${reason}                )                 .addFields(                     {                         name: 'Recorded By',                         value:${interaction.user},                         inline: true                     },                     {                         name: 'Date Recorded',                         value: <t:${Math.floor(Date.now() / 1000)}:F>,                         inline: true                     }                 )                 .setFooter({ text: 'BLOODLINE RECORDS • OFFICIAL BLACKLIST' })                 .setTimestamp();              return interaction.reply({ embeds: [embed] });         }          if (subcommand === 'remove') {             const userId = interaction.options.getString('user_id').trim();              if (!/^\d{17,20}$/.test(userId)) {                 return interaction.reply({                     content: 'Please provide a valid Discord user ID.',                     ephemeral: true                 });             }              if (!guildBlacklist[userId]) {                 return interaction.reply({                     content: 'No blacklist record was found for that user.',                     ephemeral: true                 });             }              const removedRecord = guildBlacklist[userId];             delete guildBlacklist[userId];              saveBlacklist(blacklist);              const embed = new EmbedBuilder()                 .setColor(0x555555)                 .setTitle('𖤐  BLACKLIST RECORD REMOVED')                 .setDescription(                     The blacklist record has been removed.\n\n+                    Individual: ${removedRecord.username}\n+                    User ID: `${userId}`\n+                    Original Reason: ${removedRecord.reason}                )                 .addFields({                     name: 'Removed By',                     value:${interaction.user}                })                 .setFooter({ text: 'BLOODLINE RECORDS • RECORD UPDATED' })                 .setTimestamp();              return interaction.reply({ embeds: [embed] });         }          if (subcommand === 'list') {             const entries = Object.entries(guildBlacklist);              if (entries.length === 0) {                 return interaction.reply({                     content: 'The Bloodline Records blacklist is currently empty.',                     ephemeral: true                 });             }              const description = entries                 .map(([userId, record], index) =>                    ${index + 1}. ${record.username}\n+                    ID: `${userId}`\n+                    Reason: ${record.reason}\n+                    Recorded: <t:${Math.floor(new Date(record.timestamp).getTime() / 1000)}:d>                )                 .join('\n\n');              const embed = new EmbedBuilder()                 .setColor(0x8B0000)                 .setTitle('𖤐  BLOODLINE RECORDS BLACKLIST')                 .setDescription(description.slice(0, 4000))                 .setFooter({                     text:${entries.length} blacklist record(s) • Bloodline Records`
                })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};
