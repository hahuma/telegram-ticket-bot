import { Telegraf } from 'telegraf'


export class TelegramBot {
    constructor({botToken}) {
        this.botToken = botToken
        this.lastMessageIdAfterInit = undefined
        this.bot = new Telegraf(this.botToken)
        this.questionsObj = {
            default: 'Olá, para dar início ao seu atendimento, digite *iniciar*',
            iniciar: `Veja os seguintes comandos:
            1 - Criar novo bilhete
            2 - Ver bilhetes criados`,
        }

        this.init()
        this.#middlewares()
        this.#events()

        this.bot.startPolling()
    }

    init() {
        this.bot.start(content => {
            content.replyWithMarkdownV2(this.questionsObj.default)
        })
    }

    #middlewares() {
        this.bot.on('text', (content, next) => {
            if(
                content.message.message_id == 1
                || ( content.message.message_id != 1
                   && content.message.text !== 'iniciar'
                   && !this.lastMessageIdAfterInit )
            ) {
                content.replyWithMarkdownV2(this.questionsObj.default)
            }

            next()

        })
    }

    #events() {
        this.bot.hears('iniciar', (content, next) => {
            console.log(content.message)
            content.replyWithHTML(this.questionsObj.iniciar)

            this.lastMessageIdAfterInit = content.message.message_id + 1
            next()
        })
    }
}