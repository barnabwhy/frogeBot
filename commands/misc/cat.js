require("dotenv").config()

const request = require("request")

async function cmdFunc(msg, args, startTime) {
    let catUrl = `https://api.thecatapi.com/v1/images/search` // Cat API URL
    request(catUrl, function(error, response, body){ // Request response
        if (error) // Send an error message if the request fails
            msg.channel.send({
                embed: {
                    "title": "Error",
                    "description": `<@${msg.author.id}> - ${process.env.MSG_SEND_FAIL}`,
                    "color": Number(process.env.EMBED_COLOUR),
                    "timestamp": new Date(),
                    "author": {
                        "name": process.env.BOT_NAME,
                        "icon_url": msg.client.user.displayAvatarURL()
                    }
                }
            })
        else {
            let catJSON = JSON.parse(response.body) // Parse JSON of response
            
            // Send cat image
            msg.channel.send({
                embed: {
                    "title": "Cat",
                    "description": `<@${msg.author.id}> ${process.env.MSG_CAT}`,
                    "color": Number(process.env.EMBED_COLOUR),
                    "timestamp": new Date(),
                    "author": {
                        "name": process.env.BOT_NAME,
                        "icon_url": msg.client.user.displayAvatarURL()
                    },
                    "footer": {
                        "text": "mmmmmm cat"
                    },
                    "image": {
                        "url": catJSON[0].url
                    }
                }
            })
        }
    });
}

module.exports = {
    cmdFunc
}