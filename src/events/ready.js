const mongoose = require('mongoose');
const MONGODBURL = process.env.MONGODBURL;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!');

        if(!MONGODBURL) return;

        mongoose.set('strictQuery', true);

        mongoose.connect(MONGODBURL || '', {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })


        if(mongoose.connect){
            console.log('mongoose connected :)')
            client.user.setPresence({ activities: [{ name: 'Doge Clicker' }], status: 'online' });
        }

        async function pickPresence () {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                await client.user.setPresence({
                    activities: [
                        {
                            name: statusArray[option].content,
                            type: statusArray[option].type,

                        },
                    
                    ],

                    status: statusArray[option].status
                })
            } catch (error) {
                console.error(error);
            }
        }
    },
};