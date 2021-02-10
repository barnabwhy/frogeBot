require("dotenv").config()
const { MessageAttachment, MessageEmbed } = require('discord.js');

delete require.cache[require.resolve("../../modules/utils.js")];
let { findImage, formatDuration } = require("../../modules/utils.js")
var Jimp = require('jimp');

delete require.cache[require.resolve("../../modules/image.js")];
let { exec, readURL, jimpReadURL, readBuffer } = require("../../modules/image.js")
let { canvasText, canvasRect } = require("../../modules/canvas.js")

let procMsg
let imageUrl
async function cmdFunc(msg, args, startTime) {
    try {
        procMsg = await msg.channel.send("<a:processing:807338286753906718> Processing... This may take a minute.");
        msg.channel.startTyping()
        
        imageUrl = await findImage(msg)
        let extension = imageUrl.split("?")[0].split(".")[imageUrl.split(".").length-1];

        let imgFG = await jimpReadURL(imageUrl);

        let textCanvas = await canvasText(args, Math.round(imgFG.bitmap.width*0.1), "Roboto", Math.round(imgFG.bitmap.width*0.8), "center", 1.5, "black")
        let offset = textCanvas[1]+Math.round(imgFG.bitmap.width*0.075);
        
        let rectCanvas = await canvasRect(imgFG.bitmap.width, offset, "transparent", 0, "white")

        textCanvas[0] = await (await readBuffer(textCanvas[0])).crop(0, 0, Math.round(imgFG.bitmap.width*0.8), textCanvas[1]).getBufferAsync(Jimp.AUTO)

        let img = await exec(imageUrl, [
            ["addBackground", [imgFG.bitmap.width, imgFG.bitmap.height+offset, 'transparent', 0, offset]],
            ["composite", [rectCanvas, 0, 0]],
            ["composite", [textCanvas[0], Math.round(imgFG.bitmap.width*0.1), Math.round(imgFG.bitmap.width*0.05)]]
        ]);
        
        const attachment = new MessageAttachment(img, "image."+extension);
        let timeTaken = formatDuration(new Date().getTime() - startTime)

        let embed = new MessageEmbed({
            "title": "Caption",
            "description": `<@${msg.author.id}>`,
            "color": Number(process.env.EMBED_COLOUR),
            "timestamp": new Date(),
            "author": {
                "name": process.env.BOT_NAME,
                "icon_url": msg.client.user.displayAvatarURL()
            },
            "footer": {
                "text": `Took ${timeTaken}`
            }
        }).attachFiles(attachment).setImage("attachment://image."+extension);
        msg.channel.send({ embed }).catch(() => {
            msg.channel.send({
                embed: {
                    "title": "Error",
                    "description": `<@${msg.author.id}> - Failed to send`,
                    "color": Number(process.env.EMBED_COLOUR),
                    "timestamp": new Date(),
                    "author": {
                        "name": process.env.BOT_NAME,
                        "icon_url": msg.client.user.displayAvatarURL()
                    }
                }
            })
        })

        msg.channel.stopTyping()
        procMsg.delete();
    } catch(e) {
        console.log(e)
        msg.channel.stopTyping()
        msg.channel.send({
            embed: {
                "title": "Error",
                "description": `<@${msg.author.id}> - ${ imageUrl != undefined ? "Something went wrong" : "No images found"}`,
                "color": Number(process.env.EMBED_COLOUR),
                "timestamp": new Date(),
                "author": {
                    "name": process.env.BOT_NAME,
                    "icon_url": msg.client.user.displayAvatarURL()
                }
            }
        })
        procMsg.delete();
    }
}

module.exports = {
    cmdFunc
}