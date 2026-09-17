import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

import { successEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { TitanBotError, ErrorTypes } from '../../utils/errorHandler.js';

export default {
  data: new SlashCommandBuilder()

    .setName("unjail")

    .setDescription("Unjail a user in the server")

    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to unjail")
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the unjail")
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
        'You must specify a user to unjail.',
        { subtype: 'invalid_user' }
      );
    }

    const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      throw new TitanBotError(
        'User not found',
        ErrorTypes.USER_INPUT,
        'That user has disappeared.'
      );
    }

    const jailRole = interaction.guild.roles.cache.find(
      role => role.name === "Jailed"
    );

    if (!jailRole) {
      throw new TitanBotError(
        'Jailed role missing',
        ErrorTypes.CONFIGURATION,
        'The **Jailed** role does not exist.'
      );
    }

    if (!member.roles.cache.has(jailRole.id)) {
      throw new TitanBotError(
        'Not jailed',
        ErrorTypes.VALIDATION,
        `${user.tag} is currently free.`
      );
    }

if (!member.roles.cache.has(jailRole.id)) {
    throw new TitanBotError(
        'Not jailed',
        ErrorTypes.VALIDATION,
        `${user.tag} is currently free.`
    );
}
const previousRoles = await db.get(`jailed_${member.id}`);
await member.roles.remove(jailRole, reason);
if (Array.isArray(previousRoles) && previousRoles.length > 0) {
    await member.roles.add(previousRoles, reason);
}
await db.delete(`jailed_${member.id}`);
await InteractionHelper.universalReply(interaction, {
    embeds: [
        successEmbed(
            `🔓 ${user.tag} has been freed from the tomb.`,
            `**Reason:** ${reason}`
        ),
    ],
});
  },
};
