import { DateTime } from "luxon";
import { Telegraf } from "telegraf";
import { v4 as uuid } from "uuid";
import { ticket } from "../vizualizer/ticket.js";

const defaultTicket = {
  name: "",
  odd: "",
  market: "",
  value: "",
  buyerName: "",
  sellerName: "",
  createdAt: "",
};

export class TelegramBot {
  constructor({ botToken }) {
    this.id = uuid();
    this.botToken = botToken;
    this.step = 0;
    this.lastMessageId = undefined;
    this.bot = new Telegraf(this.botToken);
    this.questionsObj = {
      default: "Olá, para dar início ao seu atendimento, digite *iniciar*",
      start: `Este e seu id de acesso, deixe guardado com voce para acessar nas proximas vezes: ${this.id}`,
      continue:
        "Seu atendimento ja foi iniciado, peco que continue o fluxo normalmente",
      passo1:
        "Vamos dar inicio, primeiro preciso que voce digite que aposta esta sendo criada:",
      passo2: "Qual o odd da aposta?",
      passo3: "Qual o valor apostado?",
      passo4: "Qual o mercado?",
      passo5: "Qual o colaborador?",
      passo6: "Seu nome:",
      passo7: "Imprimindo seu bilhete em tela...",
    };
    this.ticket = defaultTicket;

    this.init();
    this.#middlewares();
    this.#events();

    this.bot.startPolling();
  }

  init() {
    this.bot.start((content) => {
      content.reply(this.questionsObj.start);
    });
  }

  #middlewares() {
    this.bot.on("text", (content, next) => {
      if (this.step === 0 && content.message.text !== "iniciar") {
        content.replyWithMarkdownV2(this.questionsObj.default);
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (this.step !== 0 && content.message.text === "iniciar") {
        content.replyWithMarkdownV2(this.questionsObj.continue);
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 1 &&
        this.lastMessageId !== content.message.message_id
      ) {
        this.ticket.name = content.message.text;
        content.reply(this.questionsObj.passo2);

        this.#updateStepAndLastMessageId({
          step: 2,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 2 &&
        this.lastMessageId !== content.message.message_id
      ) {
        this.ticket.odd = content.message.text;
        content.reply(this.questionsObj.passo3);

        this.#updateStepAndLastMessageId({
          step: 3,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 3 &&
        this.lastMessageId !== content.message.message_id
      ) {
        this.ticket.value = content.message.text;

        content.reply(this.questionsObj.passo4);

        this.#updateStepAndLastMessageId({
          step: 4,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 4 &&
        this.lastMessageId !== content.message.message_id
      ) {
        this.ticket.market = content.message.text;

        content.reply(this.questionsObj.passo5);

        this.#updateStepAndLastMessageId({
          step: 5,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 5 &&
        this.lastMessageId !== content.message.message_id
      ) {
        this.ticket.buyerName = content.message.text;

        content.reply(this.questionsObj.passo6);

        this.#updateStepAndLastMessageId({
          step: 6,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 6 &&
        this.lastMessageId !== content.message.message_id
      ) {
        this.ticket.sellerName = content.message.text;

        this.#updateStepAndLastMessageId({
          step: 7,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 7 &&
        this.lastMessageId === content.message.message_id
      ) {
        this.ticket.createdAt = DateTime.now()
          .setLocale("pt-BR")
          .toFormat("dd / MM / yyyy       hh:mm");

        content.replyWithMarkdownV2(ticket(this.ticket));
        content.reply(
          `Atendimento, finalizado! Obrigado ${this?.ticket?.sellerName}`
        );

        this.ticket = defaultTicket;

        this.#updateStepAndLastMessageId({});
      }

      next();
    });
  }

  #events() {
    this.bot.hears("iniciar", (content, next) => {
      if (this.step === 0) {
        content.reply(this.questionsObj.passo1);

        this.#updateStepAndLastMessageId({
          step: 1,
          lastMessageId: content.message.message_id,
        });
      }
      next();
    });
  }

  #updateStepAndLastMessageId({ lastMessageId, step }) {
    if (step) {
      this.step = step;
    }

    if (lastMessageId) {
      this.lastMessageId = lastMessageId;
    }

    if (!step) {
      this.step = 0;
    }

    if (!lastMessageId) {
      this.lastMessageId = undefined;
    }
  }
}
