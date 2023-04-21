const AbstractEvent = require("../../abstract/Event");
const { ButtonBuilder , ButtonStyle, ActionRowBuilder } = require(`discord.js`);
module.exports = class Interaction extends AbstractEvent{
    constructor(client){
        super(client,{name : `interactionCreate`})
    }
    async run(interaction){
        if(interaction.isButton())
        {
            if(interaction.customId === `p1`)
            {
                let dispatcher = this.client.players.get(interaction.guild.id);
                if(dispatcher && !dispatcher.player || !dispatcher){
                    return interaction.message.delete().catch(() => {});
                }
                if(interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return interaction.reply({content : `:x: You must be connected to ${interaction.guild.members.me.voice.channel}`,ephemeral : true})
                let b1 = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji(dispatcher.player.paused ? `<:hammer_pause:1089550993731096646>` : `<:hammer_resume:1089550954547920928>`).setCustomId(`p1`);
                let b2 = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji(`<:hammer_stop:1089551042997403668>`).setCustomId(`p2`);
                let b3 = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji(`<:hammer_loop:1089554839027077180>`).setCustomId(`p3`);
                let b4 = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji(`<:hammer_skip:1089554936657887362>`).setCustomId(`p4`);

                let row = new ActionRowBuilder().addComponents([b1,b2,b3,b4]);

                await dispatcher.pause(!dispatcher.player.paused);
                return interaction.update({
                    components : [row]
                });
            }
            if(interaction.customId === `p2`)
            {
                let dispatcher = this.client.players.get(interaction.guild.id);
                if(dispatcher && !dispatcher.player || !dispatcher)
                {
                    return interaction.message.delete().catch(() => {});
                }
		if(interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return interaction.reply({content : `:x: You must be connected to ${interaction.guild.members.me.voice.channel}`,ephemeral : true})
                dispatcher.setTrackRepeat(false);
                dispatcher.setQueueRepeat(false);
                dispatcher.queue.clear();
                dispatcher.filter.clearEffects();
                dispatcher.stop();

                return interaction.message.delete().catch(() => {});
            }
            if(interaction.customId === `p3`)
            {
                let dispatcher = this.client.players.get(interaction.guild.id);
                if(dispatcher && !dispatcher.player || !dispatcher)
                {
                    return interaction.message.delete().catch(() => {});
                }
		if(interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return interaction.reply({content : `:x: You must be connected to ${interaction.guild.members.me.voice.channel}`,ephemeral : true})
                let lol;
                if(!dispatcher.trackRepeat && !dispatcher.queueRepeat) lol = 'track';
                else if(dispatcher.trackRepeat) lol = 'queue';
                else if(dispatcher.queueRepeat)lol = 'none';
                else lol = dispatcher.queueRepeat ? `none` : `queue`;
                const type = getRepeatType(lol, dispatcher);
                setRepeat(dispatcher,type)

                return interaction.reply({
                    content : `<:hammer_loop:1089554839027077180> | Repeat Mode: ${dispatcher.trackRepeat ? "Current" : dispatcher.queueRepeat ? "Queue" : "None"}`,ephemeral : true
                })
            }
            if(interaction.customId === `p4`)
            {
                let dispatcher = this.client.players.get(interaction.guild.id);
                if(dispatcher && !dispatcher.player || !dispatcher)
                {
                    return interaction.message.delete().catch(() => {});
                }
		if(interaction.guild.members.me.voice.channel && interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId) return interaction.reply({content : `:x: You must be connected to ${interaction.guild.members.me.voice.channel}`,ephemeral : true})
                dispatcher.stop();

                return interaction.message.delete().catch(() => {});
            }
        }
    }
}

function getRepeatType(input, dispatcher) {
    if (!input) {
        if (!dispatcher.trackRepeat && !dispatcher.queueRepeat) return 'track';
        if (dispatcher.trackRepeat) return 'queue';
        if (dispatcher.queueRepeat) return 'none';
    } else if (input === 'queue' || input === 'all') {
        return 'queue';
    } else if (input === 'track' || input === 'single' || input === "current") {
        return 'track';
    } else if (input === 'none' || input === 'nothing') {
        return 'none';
    }

    if (!dispatcher.trackRepeat && !dispatcher.queueRepeat) return 'queue';
    if (dispatcher.queueRepeat) return 'track';

    return 'none';
}

function setRepeat(dispatcher, type) {
    if (dispatcher.trackRepeat && type === 'track') return true;
    if (dispatcher.queueRepeat && type === 'queue') return true;
    if (!dispatcher.trackRepeat && !dispatcher.queueRepeat && type === 'none') return true;

    if (type === 'queue') {
        dispatcher.setQueueRepeat(true);
        return true;
    } else if (type === 'track') {
        dispatcher.setTrackRepeat(true);
        return true;
    } else if (type === 'none') {
        dispatcher.setTrackRepeat(false);
        dispatcher.setQueueRepeat(false);
        return true;
    }

    return false;
}
