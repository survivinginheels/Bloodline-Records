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
fs.writeFileSync(BLACKLIST_FILE, '{}');
}

function loadBlacklist() {
try {
return JSON.parse(
fs.readFileSync(BLACKLIST_FILE, 'utf8')
);
} catch {
return {};
}
}

function saveBlacklist(data) {
fs.writeFileSync(
BLACKLIST_FILE,
JSON.stringify(data, null, 2)
);
}

export default {
data: new SlashCommandBuilder()
.setName('blacklist')
.setDescription('Manage the Bloodline Records blacklist.')
.setDefaultMemberPermissions(
PermissionFlagsBits.Administrator
)

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
.setDescription('Reason for blacklisting.')
.setRequired(true)
.setMaxLength(1000)
)
)

.addSubcommand(subcommand =>
subcommand
.setName('remove')
.setDescription('Remove a blacklist record.')
.addStringOption(option =>
option
.setName('user_id')
.setDescription('Discord ID of the user.')
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

if (
!interaction.memberPermissions?.has(
PermissionFlagsBits.Administrator
)
) {
return interaction.reply({
content: 'You do not have permission to manage the blacklist.',
ephemeral: true
});
}

const action = interaction.options.getSubcommand();
const guildId = interaction.guildId;
const blacklist = loadBlacklist();

if (!blacklist[guildId]) {
blacklist[guildId] = {};
}

const records = blacklist[guildId];

if (action === 'add') {
const user = interaction.options.getUser('user');
const reason = interaction.options.getString('reason');

if (user.id === interaction.user.id) {
return interaction.reply({
content: 'You cannot blacklist yourself.',
ephemeral: true
});
}

if (records[user.id]) {
return interaction.reply({
content: 'That user is already blacklisted.',
ephemeral: true
});
}

records[user.id] = {
username: user.username,
reason,
moderatorId: interaction.user.id,
timestamp: new Date().toISOString()
};

saveBlacklist(blacklist);

const embed = new EmbedBuilder()
.setColor(0x8B0000)
.setTitle('𖤐 BLACKLIST RECORD ADDED')
.setDescription(
'A new record has been added to the Bloodline Records blacklist.'
)
.addFields(
{
name: 'Individual',
value: `${user.tag} (\`${user.id}\`)`
},
{
name: 'Reason',
value: reason
},
{
name: 'Recorded By',
value: `${interaction.user}`
}
)
.setFooter({
text: 'BLOODLINE RECORDS • OFFICIAL BLACKLIST'
})
.setTimestamp();

return interaction.reply({
embeds: [embed]
});
}

if (action === 'remove') {
const userId = interaction.options
.getString('user_id')
.trim();

if (!/^\d{17,20}$/.test(userId)) {
return interaction.reply({
content: 'Please provide a valid Discord user ID.',
ephemeral: true
});
}

if (!records[userId]) {
return interaction.reply({
content: 'No blacklist record was found for that user.',
ephemeral: true
});
}

const removed = records[userId];
delete records[userId];

saveBlacklist(blacklist);

const embed = new EmbedBuilder()
.setColor(0x555555)
.setTitle('𖤐 BLACKLIST RECORD REMOVED')
.addFields(
{
name: 'Individual',
value: `${removed.username} (\`${userId}\`)`
},
{
name: 'Original Reason',
value: removed.reason
},
{
name: 'Removed By',
value: `${interaction.user}`
}
)
.setTimestamp();

return interaction.reply({
embeds: [embed]
});
}

if (action === 'list') {
const entries = Object.entries(records);

if (entries.length === 0) {
return interaction.reply({
content: 'The Bloodline Records blacklist is empty.',
ephemeral: true
});
}

const lines = entries.map(([userId, record], index) => {
const reason = record.reason.replace(/\n/g, ' ');

return (
`**${index + 1}. ${record.username}**\n` +
`**User ID:** \`${userId}\`\n` +
`**Reason:** ${reason.slice(0, 500)}`
);
});

const embeds = [];

for (let i = 0; i < lines.length; i += 10) {
embeds.push(
new EmbedBuilder()
.setColor(0x8B0000)
.setTitle('𖤐 BLOODLINE RECORDS BLACKLIST')
.setDescription(
lines.slice(i, i + 10).join('\n\n').slice(0, 4000)
)
.setFooter({
text: `Blacklist records: ${entries.length}`
})
.setTimestamp()
);
}

return interaction.reply({
embeds: embeds.slice(0, 10),
ephemeral: true
});
}
}
};
};
