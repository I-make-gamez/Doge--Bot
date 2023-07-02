const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data:  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('replies pong'),
    async execute(interaction, client) {
        await interaction.reply({ content: "pong"})
    }
}