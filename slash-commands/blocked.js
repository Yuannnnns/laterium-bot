/// @Slash.Commands : blocked.js

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');

const connection = require('../mysql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-blocked')
        .setDescription('Add a channel to the blocked list.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel to block')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const guildId = interaction.guild.id;
        const channelId = interaction.options.getChannel('channel').id;

        const queryCheck = 'SELECT * FROM blocked_channels WHERE guild_id = ? AND channel_id = ?';
        connection.query(queryCheck, [guildId, channelId], (err, results) => {
            if (err) {
                console.error('Error checking database:', err);
                return interaction.reply({ content: 'There was an error checking the blocked list.', flags: MessageFlags.Ephemeral });
            }

            if (results.length > 0) {
                return interaction.reply({ content: 'This channel is already in the blocked list.', flags: MessageFlags.Ephemeral });
            }

            const queryInsert = 'INSERT INTO blocked_channels (guild_id, channel_id) VALUES (?, ?)';
            connection.query(queryInsert, [guildId, channelId], (err, results) => {
                if (err) {
                    console.error('Error inserting into database:', err);
                    return interaction.reply({ content: 'There was an error adding the channel to the blocked list.', flags: MessageFlags.Ephemeral });
                }

                interaction.reply({
                    content: `Channel with ID ${channelId} has been added to the blocked list for guild with ID ${guildId}.`,
                    flags: MessageFlags.Ephemeral
                });
            });
        });
    },
};
