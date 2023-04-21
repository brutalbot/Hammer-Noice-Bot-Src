const BaseEvent = require('../../abstract/Event');
const { EmbedBuilder, PermissionsBitField, WebhookClient, ChannelType } = require('discord.js');
const guildLogs = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/1087810019002683565/P4pl85EHEojGqxGGzfoFocMxcA9jzN65M1TFJzcsmKNXv_KimXrYhpeGfZBo2bqn88SE' });
module.exports = class GuildCreateEvent extends BaseEvent {
  constructor(client) {
    super(client, { name: 'guildCreate' });
  }
  async run(guild) {
    if (!guild || (guild && !guild.available)) return;

    if (!guild.owner) guild.owner = await guild.fetchOwner().catch(e => this.client.logger.error(e))

    let defaultChannel;

    await guild.channels.cache.forEach((channel) => {
	if(channel.type === ChannelType.GuildText && guild.members.me.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages) && !defaultChannel){
	defaultChannel = channel;
}
})

const invite = await defaultChannel.createInvite({maxAge : 0});

    let embed = new EmbedBuilder()
      .setAuthor({name: `${this.client.user.username}`, iconURL: this.client.user.avatarURL({ dynamic: true, size: 4096 })})
      .setColor(this.client.util.color.primary)
      .setThumbnail(this.client.user.avatarURL({ dynamic: true, size: 4096 }))
      .setDescription(`My prefix for this server is \`${this.client.config.prefix}\`\nWant to see all the commands available? Use \`${this.client.config.prefix}help\`\nFound a bug or facing any issues? [Support Server](https://discord.gg/hammertech) to join my server.\nWant to invite the bot? [Click here](${this.client.config.inviteURL(this.client.user.id)}) to invite me in your server.`);

    if(defaultChannel) defaultChannel.send({embeds : [embed]});

    let guilds = await this.client.shard.fetchClientValues(`guilds.cache.size`);
    return guildLogs.send({ embeds: [{
      color: this.client.util.color.success,
      title: 'Guild Joined',
      thumbnail: { url: guild.iconURL({ dynamic: true, size: 1024 }) },
      description: `Name: ${guild.name}\nGuild ID: ${guild.id}\nGuild Owner: ${(guild.owner ? guild.owner.user.tag : await this.client.users.resolve(guild.ownerID || "")) || "NA"}\nInvite: https://discord.gg/${invite.code} \n Member Count: ${guild.memberCount}\nTotal Guilds: ${guilds.reduce((acc, cur) => acc + cur).toLocaleString()}\nOn Shard: ${guild.shardId}`
    }]});
  }
}
