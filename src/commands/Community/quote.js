const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

var c = [
    "age",
    "alone",
    "amazing",
    "anger",
    "architecture",
    "art",
    "attitude",
    "beauty",
    "best",
    "birthday",
    "business",
    "car",
    "change",
    "communications",
    "computers",
    "cool",
    "courage",
    "dating",
    "death",
    "design",
    "dreams",
    "education",
    "environmental",
    "equality",
    "experience",
    "failure",
    "faith",
    "family",
    "famous",
    "fear",
    "fitness",
    "food",
    "forgiveness",
    "freedom",
    "friendship",
    "funny",
    "future",
    "god",
    "good",
    "government",
    "graduation",
    "great",
    "happiness",
    "health",
    "history",
    "home",
    "hope",
    "humor",
    "imagination",
    "inspirational",
    "intelligence",
    "jealousy",
    "knowledge",
    "leadership",
    "learning",
    "legal",
    "life",
    "love",
    "marriage",
    "medical",
    "men",
    "money",
    "morning",
    "movies",
    "success"
]

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var category = c[getRandomInt(0, 64)]
var quote;
var auth;
$.ajax({
    method: 'GET',
    url: 'https://api.api-ninjas.com/v1/quotes?category=' + category,
    headers: { 'X-Api-Key': 'qKZDql0VPPQTYNZdWepcAg==AcdYqEg8YhUA4w1A' },
    contentType: 'application/json',
    success: function (result) {
        quote = '"' + result[0].quote + '"'
        auth = result[0].author

    },
    error: function ajaxError(jqXHR) {
        console.log('Error: ', jqXHR.responseText);
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Gives you a random quote'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '🖊️ Quotifier for discord' })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle(`${quote}`)
            .setDescription(` -${auth}`)
        await interaction.reply({embeds: [embed]})
    }
}