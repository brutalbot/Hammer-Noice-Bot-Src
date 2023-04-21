const BaseEvent = require('../../abstract/Event');
const { WebhookClient } = require('discord.js');
const guildLogs = new WebhookClient({ url: 'https://discord.com/api/webhooks/1089495056777478264/XEXtDNi0zPz2Q8c765NkhILY1HbZh8_qVOBQZTVEvrHp2Fc6xcmVZtJl_mYc0Annv6u7' });
module.exports = class GuildDeleteEvent extends BaseEvent {
  constructor(client) {
    super(client, { name: 'guildDelete' });
  }
  async run(guild) {
    if (!guild || (guild && !guild.available)) return;

    if (!guild.owner) guild.owner = await guild.fetchOwner().catch(e => this.client.logger.error(e))

    await this.client.db.deleteGuild(guild.id);
    
    if (this.client.players.has(guild.id)) this.client.players.get(guild.id).destroy();

    if (!guild.name && !guild.memberCount) return;

    let guilds = await this.client.shard.fetchClientValues(`guilds.cache.size`);

    return guildLogs.send({ embeds: [{
      color: this.client.util.color.success,
      title: 'Guild Deleted',
      thumbnail: { url: guild.iconURL({ dynamic: true, size: 1024 }) },
      description: `Name: ${guild.name}\nGuild ID: ${guild.id}\nGuild Owner: ${(guild.owner ? guild.owner.user.tag : await this.client.users.resolve(guild.ownerID || "")) || "NA"}\nMember Count: ${guild.memberCount}\nTotal Guilds: ${guilds.reduce((acc, cur) => acc + cur).toLocaleString()}\nOn Shard: ${guild.shardID + 1}`
    }]});
  }
}
