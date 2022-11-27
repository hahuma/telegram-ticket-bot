import dotenv from "dotenv";
dotenv.config();

import { TelegramBot } from "./classes/TelegramBot.js";

const { BOT_TOKEN } = process.env;

new TelegramBot({ botToken: BOT_TOKEN });
