const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField } = require('discord.js')
const commands = require('../Other/commands.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list a various commands that come with the bot')
        .addSubcommand(command => command
            .setName('community')
            .setDescription('Commands accessible by everyone'))
        .addSubcommand(command => command
            .setName('moderation')
            .setDescription('Commands accessible by admins')),
    async execute(interaction) {
        const { options } = interaction;
        const sub = options.getSubcommand();

        switch (sub) {
            case 'community':
                const cembed = new EmbedBuilder()
                    .setColor('#75C7D9')
                    .setFooter({ text: 'Bot by NitTwit' })
                    .setTimestamp()
                    .setTitle("<:s2:1122983781423382568> Bot Help")
                    .setDescription(`**${commands.community.ping.name}**\n\n${commands.community.ping.description}`)
                const cbuttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cback`)
                            .setLabel(`Last Command`)
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`cnxt`)
                            .setLabel(`Next Command`)
                            .setStyle(ButtonStyle.Primary),
                    )
                const msg = await interaction.reply({ embeds: [cembed], components: [cbuttons] });
                msg.createMessageComponentCollector()
                break;
            case 'moderation':
                await interaction.reply({content: 'Not Finished Yet. Come Back Soon', ephemeral: true})
                break;
        }
    }
}