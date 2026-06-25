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

function buildMessage(): string {
  const days = daysRemaining();
  if (days > 1) return `**${days} days** until August 13 drops. The wait continues.`;
  if (days === 1) return "**Tomorrow.** August 13 releases tomorrow.";
  if (days === 0) return "**Today is the day.** August 13 is out NOW.";
  return `August 13 has been out for **${Math.abs(days)} days**.`;
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
  // Fire at 10:00 AM UTC every day
  const now = new Date();
  const next = new Date();
  next.setUTCHours(10, 0, 0, 0);
  if (now >= next) next.setUTCDate(next.getUTCDate() + 1);

  const msUntilFirst = next.getTime() - now.getTime();
  console.log(`First message in ${(msUntilFirst / 3_600_000).toFixed(1)}h (at ${next.toISOString()} UTC).`);

  setTimeout(() => {
    sendCountdown();
    setInterval(sendCountdown, 24 * 60 * 60 * 1000);
  }, msUntilFirst);
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag} — ${daysRemaining()} days remaining.`);
  scheduleDaily();
});

client.login(TOKEN);
