const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { useMainPlayer, QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("play a song from YouTube.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("search")
        .setDescription("Searches for a song and plays it")
        .addStringOption((option) =>
          option
            .setName("cancion")
            .setDescription("search keywords")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("playlist")
        .setDescription("Plays a playlist from YT")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("the playlist's url")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("song")
        .setDescription("Plays a single song from YT")
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("the song's url")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    //console.log("Tipo de interacción:", interaction);

    if (!interaction.commandName) {
      // Usa isCommand() en lugar de isChatInputCommand()
      console.log("❌ Interacción incorrecta.");
      return;
    }

    await interaction.deferReply(); // Marca la interacción como "en proceso"
    try {
      const player = interaction.client.player;
      const query = interaction.options.getString("cancion");
      const isURL = query.startsWith("http://") || query.startsWith("https://");

      if (!query || (isURL && query.length < 2)) {
        return interaction.followUp("❌ Debes proporcionar una canción o URL.");
      }

      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
      });

      if (!searchResult || !searchResult.tracks.length) {
        return interaction.editReply({
          content: "❌ No se encontraron resultados.",
        });
      }
      const queue = await player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel,
        },
      });

      if (!interaction.member.voice.channel) {
        return await interaction.editReply(
          "❌ Debes estar en un canal de voz para usar este comando."
        );
      }

      if (!queue.connection)
        await queue.connect(interaction.member.voice.channel);

      const result = await player.search(query, {
        requestedBy: interaction.user,
      });

      if (!result.tracks.length) {
        return await interaction.editReply("❌ No se encontraron resultados.");
      }

      queue.addTrack(result.tracks[0]);

      if (!queue.playing) await queue.node.play();

      // Si todo está bien, responde con la canción encontrada
      await interaction.followUp({
        content: `✅ Reproduciendo: ${searchResult.tracks[0].title}`,
      });
    } catch (error) {
      console.error("Error en el comando:", error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(
          "❌ Hubo un error al reproducir la canción."
        );
      } else {
        await interaction.reply("❌ Hubo un error al reproducir la canción.");
      }
    }
  },
};
