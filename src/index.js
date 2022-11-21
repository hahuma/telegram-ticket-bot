import dotenv from "dotenv";
import { TelegramBot } from "./classes/TelegramBot.js";

dotenv.config();

const { BOT_TOKEN } = process.env;

new TelegramBot({ botToken: BOT_TOKEN });
