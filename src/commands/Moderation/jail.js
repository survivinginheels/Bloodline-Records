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
        'You cannot lock yourself in the tomb.'
      );
    }

    if (user.id === client.user.id) {
      throw new TitanBotError(
        'Cannot jail bot',
        ErrorTypes.VALIDATION,
        'There is no tombs made for bots.'
      );
    }

const member = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!member) {
      throw new TitanBotError(
        'User not found',
        ErrorTypes.USER_INPUT,
        'That being has disappeared.'
      );
    }

    const jailRole = interaction.guild.roles.cache.find(
      role => role.name === "Jailed"
    );

    if (!jailRole) {
      throw new TitanBotError(
        'Jailed role missing',
        ErrorTypes.CONFIGURATION,
        'The **Jailed** role does not exist. Please create it first.'
      );
    }
    if (member.roles.cache.has(jailRole.id)) {
      throw new TitanBotError(
        'Already jailed',
        ErrorTypes.VALIDATION,
        `${user.tag} is already locked in the tomb.`
      );
    }

    // Save the user's current roles before stripping them
const savedRoles = member.roles.cache
    .filter(role => role.id !== interaction.guild.id) // exclude @everyone
    .map(role => role.id);

// TODO: save savedRoles to your database/file
await saveJailedRoles(member.id, savedRoles);

// Remove all roles and give them only the Jailed role
await member.roles.set([jailRole.id], reason);
    
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
