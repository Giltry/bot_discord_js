const { Client, GuildMember, Intents } = require("discord.js");
const { Player, QueryType } = require("discord-player");
const config = require("./config.json");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
  ],
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("error", console.error);
client.on("warn", console.warn);

client.login(config.token);
