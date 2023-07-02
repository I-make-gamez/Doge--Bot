const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection } = require(`discord.js`);
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const { Events } = require("discord.js")

client.commands = new Collection();

new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
});

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

//auto reactions
const reactor = require('./Schemas.js/reactSchema')
client.on(Events.MessageCreate, async message => {
    const data = await reactor.findOne({ Guild: message.guild.id, Channel: message.channel.id })
    if (!data) return
    else {
        if (message.author.bot) return
        message.react(data.Emoji).catch(async err => {
            const owner = message.guild.members.cache.get(message.guild.ownerId);
            await owner.send(`Error With Auto Reactions - \`${err}\``)
        })
    }
})


//Poll Logic
const pollSchema = require('./Schemas.js/vote');
client.on(Events.InteractionCreate, async i => {
    if (!i.guild) return;
    if (!i.message) return;
    if (!i.isButton) return;


    const data = await pollSchema.findOne({ Guild: i.guild.id, Msg: i.message.id })

    if (!data) return;
    const msg = await i.channel.messages.fetch(data.Msg);
    //await i.channel.send(i.channel.messages.fetch(data.Msg))

    if (i.customId === 'up') {
        if (data.UpMembers.includes(i.user.id)) return await i.reply({ content: 'You cannot upvote more than once!', ephemeral: true });
        let downvotes = data.Downvote
        if (data.DownMembers.includes(i.user.id)) {
            downvotes = downvotes - 1;
        }

        const newembed = EmbedBuilder.from(msg.embeds[0]).setFields({ name: "Upvotes:", value: ` **${data.Upvote + 1}** Upvotes`, inline: true }, { name: "Downvotes:", value: ` **${downvotes}** Downvotes`, inline: true }, { name: "Posted By", value: `<@${data.Owner}>`, inline: true })
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
                    .setLabel(`Votes:`)
                    .setStyle(ButtonStyle.Secondary)
            )

        await i.update({ embeds: [newembed], components: [buttons] })

        data.Upvote++;

        if (data.DownMembers.includes(i.user.id)) {
            data.Downvote = data.Downvote - 1;
        }

        data.UpMembers.push(i.user.id);
        data.DownMembers.pull(i.user.id);
        data.save();
    }

    if (i.customId === 'down') {
        if (data.DownMembers.includes(i.user.id)) return await i.reply({ content: 'You cannot downvote more than once!', ephemeral: true });
        let upvotes = data.Upvote
        if (data.UpMembers.includes(i.user.id)) {
            upvotes = upvotes - 1;
        }

        const newembed = EmbedBuilder.from(msg.embeds[0]).setFields({ name: "Upvotes:", value: ` **${upvotes}** Upvotes`, inline: true }, { name: "Downvotes:", value: ` **${data.Downvote + 1}** Downvotes`, inline: true }, { name: "Posted By", value: `<@${data.Owner}>`, inline: true })
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

        await i.update({ embeds: [newembed], components: [buttons] })

        data.Downvote++;

        if (data.UpMembers.includes(i.user.id)) {
            data.Upvote = data.Upvote - 1;
        }

        data.DownMembers.push(i.user.id);
        data.UpMembers.pull(i.user.id);
        data.save();
    }

    if (i.customId === 'votes') {
        let upvoters = [];
        data.UpMembers.forEach(async (member) => {
            upvoters.push(`<@${member}>`);
        })

        let downvoters = [];
        data.DownMembers.forEach(async (member) => {
            downvoters.push(`<@${member}>`);
        })

        const embed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '🤚 Poll System' })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setTitle('Poll Votes')
            .addFields({ name: `Upvoters: ${upvoters.length}`, value: `> ${upvoters.join(', ').slice(0, 1020) || `No Upvoters`}`, inline: true })
            .addFields({ name: `Downvoters: ${downvoters.length}`, value: `> ${downvoters.join(', ').slice(0, 1020) || `No Downvoters`}`, inline: true })

        await i.reply({ embeds: [embed], ephemeral: true })
    }
})

//Bot Setup
//const setupSchema = require('./Schemas.js/setup');
client.on(Events.InteractionCreate, async i => {
    // if (!i.guild) return;
    // if (!i.message) return;
    // if (!i.isButton) return;


    // const pdata = await setupSchema.findOne({ Guild: i.guild.id, BotMsg: i.message.id })

    // if (!pdata) return;
    // //const botmsg = await i.channel.messages.fetch(data.BotMsg);
    if (i.customId === 'prole') {
        const pnewembed = new EmbedBuilder()
            .setColor('#75C7D9')
            .setAuthor({ name: '🛠 Bot Setup' })
            .setFooter({ text: 'Bot by NitTwit' })
            .setTimestamp()
            .setDescription('Please enter desired role below:')

        await i.reply({ embeds: [pnewembed] })
        i.channel.createMessageCollector()
    }
})

// Help Commands Stuff
const commands = require('../src/commands/Other/commands.json')
var ccmds = 2;
var mcmds = 1;
//community

client.on(Events.InteractionCreate, async i => {
    if (i.customId === 'cnxt') {
        switch (ccmds) {
            case 1:
                ccmds = 2;
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
                await i.update({ embeds: [cembed], components: [cbuttons] });
                break;
            case 2:
                ccmds = 3;
                const cembed2 = new EmbedBuilder()
                    .setColor('#75C7D9')
                    .setFooter({ text: 'Bot by NitTwit' })
                    .setTimestamp()
                    .setTitle("<:s2:1122983781423382568> Bot Help")
                    .setDescription(`**${commands.community.poll.name}**\n\n${commands.community.poll.description}`)
                const cbuttons2 = new ActionRowBuilder()
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
                await i.update({ embeds: [cembed2], components: [cbuttons2] });
                break;
            case 3:
                ccmds = 1;
                const cembed3 = new EmbedBuilder()
                    .setColor('#75C7D9')
                    .setFooter({ text: 'Bot by NitTwit' })
                    .setTimestamp()
                    .setTitle("<:s2:1122983781423382568> Bot Help")
                    .setDescription(`**${commands.community.quote.name}**\n\n${commands.community.quote.description}`)
                const cbuttons3 = new ActionRowBuilder()
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
                await i.update({ embeds: [cembed3], components: [cbuttons3] });
                break;
        }
    }
    if (i.customId === 'cback') {
        switch (ccmds) {
            case 2:
                ccmds = 1;
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
                await i.update({ embeds: [cembed], components: [cbuttons] });
                break;
            case 3:
                ccmds = 2;
                const cembed2 = new EmbedBuilder()
                    .setColor('#75C7D9')
                    .setFooter({ text: 'Bot by NitTwit' })
                    .setTimestamp()
                    .setTitle("<:s2:1122983781423382568> Bot Help")
                    .setDescription(`**${commands.community.poll.name}**\n\n${commands.community.poll.description}`)
                const cbuttons2 = new ActionRowBuilder()
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
                await i.update({ embeds: [cembed2], components: [cbuttons2] });
                break;
            case 1:
                ccmds = 3;
                const cembed3 = new EmbedBuilder()
                    .setColor('#75C7D9')
                    .setFooter({ text: 'Bot by NitTwit' })
                    .setTimestamp()
                    .setTitle("<:s2:1122983781423382568> Bot Help")
                    .setDescription(`**${commands.community.quote.name}**\n\n${commands.community.quote.description}`)
                const cbuttons3 = new ActionRowBuilder()
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
                await i.update({ embeds: [cembed3], components: [cbuttons3] });
                break;
        }
    }
})

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.emoji.name == "🔒") {
        // Code to close ticket
   }
})