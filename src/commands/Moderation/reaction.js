const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed } = require('discord.js')
const reactionSchema = require('../../Schemas.js/reaction')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction-role')
        .setDescription('Creates a reaction role message')
        .addStringOption(option => option
            .setName('text')
            .setDescription('Text to display')
            .setRequired(true))
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel to send the message to')
            .setRequired(true))
        .addStringOption(option => option
            .setName('emoji')
            .setDescription('Emoji to react with')
            .setRequired(true))
        .addRoleOption(option => option
            .setName('role')
            .setDescription('Role to be given')
            .setRequired(true)
        ),
    async execute(interaction) {
        const { options } = interaction;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: 'Error: Missing Permissions!', ephemeral: true });

        const text = options.getString('text')
        const channel = options.getChannel('channel') || interaction.channel;
        const emoji = options.getString('emoji')
        const role = options.getRole('role')

        const data = await reactionSchema.findOne({
            Guild: interaction.guild.id,
            Channel: channel.id,
        });

        await reactionSchema.create({
            Guild: interaction.guild.id,
            Channel: channel.id,
            Msg: text,
            Emoji: emoji,
            Role: role.id
        })

        const embed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: 'Reaction Roles' })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle(`${text}`)
            .setDescription(`React to get ${role}`)

        const msg = await channel.send({ embeds: [embed] });
        msg.react(emoji)
        await interaction.reply({content: 'Success!', ephemeral: true})

        const collectorFilter = (reaction) => {
            return reaction.emoji.name === emoji;
        };
        msg.createReactionCollector();

        
    }
}