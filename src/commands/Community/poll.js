const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js')
const pollSchema = require('../../Schemas.js/vote')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('creates a poll for users to vote on')
        .addStringOption(option => option.setName('topic').setDescription('topic of poll').setMinLength(1).setMaxLength(2000).setRequired(true)),
    async execute(interaction) {
        await interaction.reply({ content: '✔ Poll has been created!', ephemeral: true })
        const topic = await interaction.options.getString(`topic`)

        const embed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '📄 Poll System' })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle('📌 Poll:')
            .setDescription(`${topic}`)
            .addFields({ name: "Upvotes:", value: "**No votes**", inline: true })
            .addFields({ name: "Downvotes:", value: "**No votes**", inline: true })
            .addFields({ name: "Posted By:", value: `${interaction.user}`, inline: false })

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`up`)
                    .setLabel(`✅`)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`down`)
                    .setLabel(`❌`)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`votes`)
                    .setLabel(`Votes`)
                    .setStyle(ButtonStyle.Secondary)
            )

        const msg = await interaction.channel.send({ embeds: [embed], components: [buttons] })
        msg.createMessageComponentCollector()

        await pollSchema.create({
            Msg: msg.id,
            Upvote: 0,
            Downvote: 0,
            UpMembers: [],
            DownMembers: [],
            Guild: interaction.guild.id,
            Owner: interaction.user.id
        })
    }
}

/*

        */