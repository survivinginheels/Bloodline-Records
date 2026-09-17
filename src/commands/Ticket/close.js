import { getColor } from '../../config/bot.js';
import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import { successEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { replyUserError, ErrorTypes } from '../../utils/errorHandler.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { getTicketPermissionContext } from '../../utils/ticket/ticketPermissions.js';
import { closeTicket } from '../../services/ticket.js';

export default {
    data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("Close this ticket and lay the matter to rest.")
        .setDMPermission(false)
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("The reason for laying this matter to rest.")
                .setRequired(false),
        ),

    async execute(interaction, guildConfig, client) {
        const deferred = await InteractionHelper.safeDefer(interaction, {
            flags: MessageFlags.Ephemeral
        });

        if (!deferred) {
            return;
        }

        const permissionContext = await getTicketPermissionContext({
            client,
            interaction
        });

        if (!permissionContext.ticketData) {
            return await replyUserError(interaction, {
                type: ErrorTypes.VALIDATION,
                message: 'This command can only be used within a valid ticket channel.'
            });
        }

        if (!permissionContext.canCloseTicket) {
            return await replyUserError(interaction, {
                type: ErrorTypes.PERMISSION,
                message: 'You need the `Manage Channels` permission, the configured `Ticket Staff Role`, or be the ticket creator to close this ticket.'
            });
        }

        const reason =
            interaction.options?.getString("reason") ||
            "Laid to rest without a specific reason.";

        await closeTicket(interaction.channel, interaction.user, reason);

        await InteractionHelper.safeEditReply(interaction, {
            embeds: [
                successEmbed(
                    "Ticket Laid to Rest 🩸",
                    `This matter has been laid to rest by **${interaction.user}**.`
                ),
            ],
        });

        logger.info('Ticket closed successfully', {
            userId: interaction.user.id,
            userTag: interaction.user.tag,
            channelId: interaction.channel.id,
            channelName: interaction.channel.name,
            guildId: interaction.guildId,
            reason: reason,
            commandName: 'close'
        });
    },
};
