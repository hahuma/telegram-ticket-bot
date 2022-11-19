import dotenv from 'dotenv'
import { TelegramBot } from './classes/TelegramBot.js'

dotenv.config()

const { API_TOKEN } = process.env

new TelegramBot({botToken: API_TOKEN})

