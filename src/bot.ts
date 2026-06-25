import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN!;
const CHANNEL_ID = process.env.CHANNEL_ID!;

const RELEASE_DATE = new Date("2026-08-13T00:00:00.000Z");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function daysRemaining(): number {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const diff = RELEASE_DATE.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const SONGS = [
  "https://www.youtube.com/watch?v=3RmQTYLD398",
  "https://www.youtube.com/watch?v=uVBG11XyeBs",
  "https://www.youtube.com/watch?v=TDfG2SiS1IA",
  "https://www.youtube.com/watch?v=1RHo_ZG-YGo",
  "https://www.youtube.com/watch?v=i43xxh09d40",
  "https://www.youtube.com/watch?v=BIikfdNIHQE"
];

function dailySong(): string {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return SONGS[dayIndex % SONGS.length];
}

function buildMessage(): string {
  const days = daysRemaining();
  const song = dailySong();
  if (days > 1) return `@here **FALTAN ${days} dias** para el GOTY of the year.\n${song}`;
  if (days === 1) return `@here **FALTA UN DIA para el GOTY of the year.**\n${song}`;
  if (days === 0) return `@here **SALIO EL GOTY OF THE YEAR!!!**\n${song}`;
  return "";
}

async function sendCountdown(): Promise<void> {
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel || !(channel instanceof TextChannel)) {
    console.error("Channel not found or is not a text channel.");
    return;
  }
  const message = buildMessage();
  await channel.send(message);
  console.log(`[${new Date().toISOString()}] Sent: ${message}`);
}

function scheduleDaily(): void {
  // Fire at 11:00 AM UTC-3 (14:00 UTC) every day
  const now = new Date();
  const next = new Date();
  next.setUTCHours(14, 0, 0, 0);
  if (now >= next) next.setUTCDate(next.getUTCDate() + 1);

  const msUntilFirst = next.getTime() - now.getTime();
  console.log(`First message in ${(msUntilFirst / 3_600_000).toFixed(1)}h (at ${next.toISOString()} UTC).`);

  setTimeout(() => {
    sendCountdown();
    setInterval(sendCountdown, 24 * 60 * 60 * 1000);
  }, msUntilFirst);
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag} — ${daysRemaining()} dias restantes.`);
  scheduleDaily();
});

client.login(TOKEN);
