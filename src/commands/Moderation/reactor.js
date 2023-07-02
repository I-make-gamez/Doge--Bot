const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js')
const reactor = require('../../Schemas.js/reactSchema')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactor')
        .setDescription('Manage Guild Auto React System')
        .addSubcommand(command => command.setName('setup').setDescription('setup Auto React').addStringOption(option => option.setName('emoji').setDescription('the emoj to use.').setRequired(true)).addChannelOption(option => option.setName('channel').setDescription('sets the channel the bot will react in.').setRequired(false)))
        .addSubcommand(command => command.setName('disable').setDescription('exempt a channel from auto reator').addChannelOption(option => option.setName('channel').setDescription('the channel that will be disabled in.').setRequired(true)))
        .addSubcommand(command => command.setName('disable-all').setDescription('exempts all channels from auto reactions')),

    async execute(interaction) {
        const { options } = interaction;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'Error: Missing Permissions!', ephemeral: true });

        const channel = options.getChannel('channel') || interaction.channel;
        const sub = options.getSubcommand();
        const data = await reactor.findOne({ Guild: interaction.guild.id, Channel: channel.id });

        switch (sub) {
            case 'setup':
                if (data) {
                    return await interaction.reply({ content: '❌ Auto reactions already setup in this channel!', ephemeral: true })
                } else {
                    const emoji = options.getString('emoji');

                    await reactor.create({
                        Guild: interaction.guild.id,
                        Channel: channel.id,
                        Emoji: emoji
                    })

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(`🛠 Auto reactions sucessfully created in ${channel}! with ${emoji} as the emoji`)


                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }

                break;
            case 'disable':
                if (!data) {
                    await interaction.reply({ content: `❌Error: Nothing to disable.`, ephemeral: true })
                } else {
                    await reactor.deleteMany({ Guild: interaction.guild.id, Channel: channel.id })
                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(`🛠 Auto reactions disabled for ${channel}!`)


                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }

                break;
            case 'disable-all':
                const removeData = await reactor.findOne({ Guild: interaction.guild.id });

                if (!removeData) {
                    return await interaction.reply({ content: '❌ Auto Reactions not setup in this server.', ephemeral: true });
                } else {
                    await reactor.deleteMany({ Guild: interaction.guild.id });
                    await reactor.deleteMany({ Guild: interaction.guild.id, Channel: channel.id })
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(`🛠 Auto Reactions Completely Deleted!`)


                    await interaction.reply({ embeds: [embed], ephemeral: true });
                }
        }
    }
}
