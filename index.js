const { 
  Client, 
  GatewayIntentBits, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

let filaNormal = [];
let filaInf = [];
let painelMsg = null;
let modoGlobal = "";
let precoGlobal = "";

// ATUALIZAR PAINEL
async function atualizarPainel() {
  if (!painelMsg) return;

  const embed = new EmbedBuilder()
    .setTitle(`🎮 ${modoGlobal}`)
    .setDescription(
      `💰 Preço: R$${precoGlobal}\n\n` +
      `🧊 Gel Normal (${filaNormal.length}/2):\n${filaNormal.map(id => `<@${id}>`).join('\n') || '---'}\n\n` +
      `♾️ Gel Infinito (${filaInf.length}/2):\n${filaInf.map(id => `<@${id}>`).join('\n') || '---'}`
    )
    .setColor('Green');

  await painelMsg.edit({ embeds: [embed] });
}

// CRIAR SALA
async function criarSala(guild, players, tipo) {
  const canal = await guild.channels.create({
    name: `ap-${tipo}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      ...players.map(id => ({
        id: id,
        allow: [PermissionsBitField.Flags.ViewChannel],
      }))
    ]
  });

  canal.send(`🎮 PARTIDA CRIADA (${tipo})\n<@${players[0]}> VS <@${players[1]}>\n💰 Chamem o MID!`);
}

client.on('ready', () => {
  console.log('Bot PRO online 🚀');
});

// BOTÕES
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;

  if (interaction.customId === 'normal') {
    if (!filaNormal.includes(userId)) {
      filaNormal.push(userId);
      filaInf = filaInf.filter(id => id !== userId);
    }
  }

  if (interaction.customId === 'inf') {
    if (!filaInf.includes(userId)) {
      filaInf.push(userId);
      filaNormal = filaNormal.filter(id => id !== userId);
    }
  }

  if (interaction.customId === 'sair') {
    filaNormal = filaNormal.filter(id => id !== userId);
    filaInf = filaInf.filter(id => id !== userId);
  }

  await interaction.reply({ content: 'Atualizado ✅', ephemeral: true });

  // CRIAR PARTIDAS
  if (filaNormal.length >= 2) {
    const players = filaNormal.splice(0, 2);
    criarSala(interaction.guild, players, "normal");
  }

  if (filaInf.length >= 2) {
    const players = filaInf.splice(0, 2);
    criarSala(interaction.guild, players, "infinito");
  }

  atualizarPainel();
});

// COMANDO PAINEL
client.on('messageCreate', async message => {
  if (!message.content.startsWith('!painel')) return;

  const args = message.content.split(' ');
  modoGlobal = args.slice(1, -1).join(' ');
  precoGlobal = args[args.length - 1];

  const embed = new EmbedBuilder()
    .setTitle(`🎮 ${modoGlobal}`)
    .setDescription(
      `💰 Preço: R$${precoGlobal}\n\n` +
      `🧊 Gel Normal (0/2):\n---\n\n` +
      `♾️ Gel Infinito (0/2):\n---`
    )
    .setColor('Green');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('normal').setLabel('🧊 Gel Normal').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('inf').setLabel('♾️ Gel Infinito').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('sair').setLabel('❌ Sair').setStyle(ButtonStyle.Danger)
  );

  painelMsg = await message.channel.send({
    embeds: [embed],
    components: [row]
  });
});

client.login('SEU_TOKEN_AQUI');
