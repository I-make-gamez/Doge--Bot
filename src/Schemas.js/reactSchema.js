const { model, Schema } = require('mongoose')
//const reactor = require('../commands/Moderation/reactor')

let reactor = new Schema({
    Guild: String,
    Channel: String,
    Emoji: String
})

module.exports = model('reactSchema', reactor)