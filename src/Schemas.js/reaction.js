const { model, Schema } = require('mongoose')

let reaction = new Schema({
    Guild: String,
    Channel: String,
    Msg: String,
    Emoji: String,
    Role: String
})

module.exports = model('reaction', reaction)