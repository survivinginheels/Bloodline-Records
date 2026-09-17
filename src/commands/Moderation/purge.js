import {
SlashCommandBuilder,
PermissionFlagsBits,
MessageFlags
} from 'discord.js';

export default {
data: new SlashCommandBuilder()
.setName('purge')
.setDescription('Delete messages from users who are no longer in the server')
.addIntegerOption(option =>
option
.setName('amount')
.setDescription('Maximum number of messages to delete (1-100)')
.setMinValue(1)
.setMaxValue(100)
.setRequired(true)
)
.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

category: 'moderation',

abuseProtection: {
maxAttempts: 5,
windowMs: 60_000
},

async execute(interaction) {
const amount = interaction.options.getInteger('amount');

await interaction.deferReply({
flags: MessageFlags.Ephemeral
});

try {
const channel = interaction.channel;

if (!channel || !channel.isTextBased()) {
return interaction.editReply(
'❌ This command can only be used in a text channel.'
);
}

// Make sure the bot can manage messages
if (
!interaction.guild.members.me.permissionsIn(channel)
.has(PermissionFlagsBits.ManageMessages)
) {
return interaction.editReply(
'❌ I need the **Manage Messages** permission in this channel.'
);
}

let messagesToDelete = [];
let lastId = null;

// Keep searching until we have enough messages
// from users who are no longer in the server.
while (messagesToDelete.length < amount) {
const options = {
limit: 100
};

if (lastId) {
options.before = lastId;
}

const messages = await channel.messages.fetch(options);

if (messages.size === 0) {
break;
}

for (const message of messages.values()) {
// Don't delete the bot's own messages
if (message.author?.bot) {
continue;
}

// Check whether the author is still in the server
const member = await interaction.guild.members
.fetch(message.author.id)
.catch(() => null);

// If the member cannot be found, they have left
if (!member) {
messagesToDelete.push(message);

if (messagesToDelete.length >= amount) {
break;
}
}
}

lastId = messages.last()?.id;

// Stop if there are no more messages to search
if (messages.size < 100) {
break;
}
}

if (messagesToDelete.length === 0) {
return interaction.editReply(
'ℹ️ I couldn\'t find any messages from users who have left the server in the messages I searched.'
);
}

let deleted = 0;
let failed = 0;

// Discord bulk deletion only works on messages newer than 14 days.
const now = Date.now();
const fourteenDays = 14 * 24 * 60 * 60 * 1000;

const recentMessages = [];
const oldMessages = [];

for (const message of messagesToDelete) {
if (now - message.createdTimestamp < fourteenDays) {
recentMessages.push(message);
} else {
oldMessages.push(message);
}
}

// Bulk delete recent messages
if (recentMessages.length > 0) {
try {
const deletedMessages = await channel.bulkDelete(
recentMessages,
true
);

deleted += deletedMessages.size;
} catch (error) {
console.error('Bulk purge error:', error);
failed += recentMessages.length;
}
}

// Delete messages older than 14 days individually
for (const message of oldMessages) {
try {
await message.delete();
deleted++;
} catch (error) {
failed++;
}
}

let response = `🧹 **Purge complete!**\n`;
response += `Deleted **${deleted}** message${deleted === 1 ? '' : 's'} from users who have left the server.`;

if (failed > 0) {
response += `\n⚠️ Failed to delete **${failed}** message${failed === 1 ? '' : 's'}.`;
}

await interaction.editReply(response);

} catch (error) {
console.error('Purge command error:', error);

await interaction.editReply(
'❌ An error occurred while trying to purge messages.'
).catch(() => {});
}
}
};
