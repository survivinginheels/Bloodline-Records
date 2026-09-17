import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import { successEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { TitanBotError, ErrorTypes } from '../../utils/errorHandler.js';

export default {
  data: new SlashCommandBuilder()

    .setName("jail")

    .setDescription("Jail a user in the server")

    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to jail")
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the jail")
        .setRequired(false)
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  category: "moderation",

  async execute(interaction, config, client) {

    const user = interaction.options.getUser("target");

    const reason =
      interaction.options.getString("reason") ||
      "No reason provided";

    if (!user) {
      throw new TitanBotError(
        'Missing target user',
        ErrorTypes.USER_INPUT,
        'You must specify a user to jail.',
        { subtype: 'invalid_user' }
      );
    }

    if (user.id === interaction.user.id) {
      throw new TitanBotError(
        'Cannot jail self',
        ErrorTypes.VALIDATION,
        'You cannot jail yourself.'
      );
    }

    if (user.id === client.user.id) {
      throw new TitanBotError(
        'Cannot jail bot',
        ErrorTypes.VALIDATION,
        'You cannot jail the bot.'
      );
    }

   const member = await interaction.guild.members
  .fetch(user.id)
  .catch(() => null);

if (!member) {
  throw new TitanBotError(
    'User not found',
    ErrorTypes.USER_INPUT,
    'That user is not in this server.'
  );
}

// Find the Jailed role
const jailedRole = interaction.guild.roles.cache.find(
  role => role.name === 'Jailed'
);

if (!jailedRole) {
  throw new TitanBotError(
    'Jailed role not found',
    ErrorTypes.VALIDATION,
    'The Jailed role does not exist in this server.'
  );
}

// Remove all other roles and give Jailed
await member.roles.set([jailedRole.id]);
    if (member.roles.cache.has(jailRole.id)) {
      throw new TitanBotError(
        'Already jailed',
        ErrorTypes.VALIDATION,
        `${user.tag} is already jailed.`
      );
    }

    await member.roles.add(jailRole, reason);

    await InteractionHelper.universalReply(interaction, {
      embeds: [
        successEmbed(
          `🔒 ${user.tag} has been locked in the tomb.`,
          `**Reason:** ${reason}`
        ),
      ],
    });
  },
};
