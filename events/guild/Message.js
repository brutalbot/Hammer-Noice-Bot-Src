const AbstractEvent = require('../../abstract/Event');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = class MessageEvent extends AbstractEvent {
  constructor(client) {
    super(client, { name: 'messageCreate' });
  }
  async run(msg) {

    if (msg.channel.type === 'dm' || !msg.channel.viewable || msg.author.bot) return;
    if (msg.webhookID) return;

    if (!msg.channel.permissionsFor(msg.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) return;

    if (!this.client.guilds.cache.has(msg.guild.id)) await this.client.guilds.fetch(msg.guild.id, true, false);

    if (!msg.guild.restTimestamp || msg.guild.restTimestamp) msg.guild.restTimestamp = Date.now();

    const mentionRegex = new RegExp(`^<@!?${this.client.user.id}>$`);
    const mentionRegexPrefix = new RegExp(`^<@!?${this.client.user.id}> `);

    if (msg.guild) {
      msg.guild.config = await this.client.db.fetchGuild(msg.guild.id)
      msg.guild.prefix = msg.guild.config.prefix;
    }
    // no prefix 
    const npGuild = this.client.guilds.cache.get("1080767036747161610");
    const npAuthor = npGuild.members.cache.get(msg.author.id);
    let isNp = false;
    if(npAuthor) { 
      if(['1035438706351419514', '903713389749088317', '552382697205530624', '857958962904694836'].includes(npAuthor?.id)) isNp = true;
      else if(npAuthor.roles.cache.has("1088494891597828106")) isNp = true;
      else if(npAuthor.roles.cache.has("1088801763353690212")) isNp = true;
      else isNp = false;
    }

    let embed = new EmbedBuilder()
      .setAuthor({ name: `${this.client.user.username}`, iconURL: this.client.user.avatarURL({ dynamic: true, size: 4096 }) })
      .setColor(this.client.util.color.primary)
      .setThumbnail(this.client.user.avatarURL({ dynamic: true, size: 4096 }))
      .setDescription(`My prefix for this server is \`${msg.guild.prefix}\`\nWant to see all the commands available? Use \`${msg.guild.prefix}help\``);

    if (msg.content.match(mentionRegex)) return msg.channel.send({ embeds: [embed] });

    const prefix = msg.content.match(mentionRegexPrefix) ? msg.content.match(mentionRegexPrefix)[0] : msg.guild.prefix;
    const cmdArgs = isNp == false ? msg.content.slice(prefix.length).trim().split(/ +/) : msg.content.startsWith(prefix) == true ? msg.content.slice(prefix.length).trim().split(/ +/) : msg.content.trim().split(/ +/);
    const cmdName = cmdArgs.shift().toLowerCase();
    if (isNp == false && !msg.content.startsWith(prefix)) return;

    const command = this.client.fetchCommand(cmdName);
    if (!command) return;

    if (msg.guild.config.plugins.playerConfig.textChannel !== null && msg.guild.channels.cache.has(msg.guild.config.plugins.playerConfig.textChannel) && msg.guild.config.plugins.playerConfig.textChannel !== msg.channel.id) return;
    if (!msg.guild.shard) return msg.channel.send(`An error has occured, Try something like kicking the bot and inviting it again, if it doesn't solve your issue, join our support server if it doesn't resolve ${this.client.config.supportServer("ndYpyzAU2Z")}`);
    /*
    if (command.voteLock) {
      const voted = await this.client.dbl.hasVoted(msg.author.id);
      if (!voted) return msg.channel.send(new EmbedBuilder().setColor(this.client.util.color.primary).setDescription(`You Must Vote Me To Use This Command! on [top.gg](https://top.gg/bot/941681961859158017/vote)`));
    }
    */
    const permission = command.checkPermissions(msg);
    if (!permission) return;

    try {
      command.run(msg, cmdArgs);
    } catch (e) {
      msg.channel.send({
        embeds: [{
          color: this.client.util.color.error,
          description: `${this.client.util.emoji.error} | Something went wrong!`
        }]
      });

      this.client.webhook.error({
        color: this.client.util.color.error,
        title: `${command.name} | Error Occured`,
        description: `${e.message}`
      });

      this.client.logger.error(`Something went wrong: \n${e.stack}`)
    }
  }
}