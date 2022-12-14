import { DateTime } from "luxon";
import { Telegraf } from "telegraf";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
dotenv.config();

import { questions } from "../vizualizer/questions.js";
import { ticket } from "../vizualizer/ticket.js";

const defaultTicket = {
  id: "",
  name: "",
  odd: "",
  market: "",
  value: "",
  buyerName: "",
  sellerName: process.env.SELLER_NAME,
  createdAt: "",
};

export class TelegramBot {
  constructor({ botToken }) {
    this.botToken = botToken;
    this.chatId = "";
    this.step = 0;
    this.lastMessageId = undefined;
    this.bot = new Telegraf(this.botToken);
    this.questionsObj = questions;
    this.ticket = defaultTicket;

    this.init();
    this.#middlewares();
    this.#events();
    this.#commands();
    this.#help();

    this.bot.startPolling();
  }

  init() {
    this.bot.start((content) => {
      content.reply(this.questionsObj.default);
      this.chatId = content.chat.id;
    });
  }

  #middlewares() {
    this.bot.on("text", (content, next) => {
      if (this.step !== 0 && content.message.text === "iniciar") {
        content.replyWithMarkdownV2(this.questionsObj.continue);
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (this.step === 0 && content.message.text.toLowerCase() !== "iniciar") {
        content.replyWithMarkdownV2(this.questionsObj.default);
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
      if (this.step === 6) {
        this.ticket.createdAt = DateTime.now()
          .setLocale("pt-BR")
          .toFormat("dd / MM / yyyy       hh:mm");

        this.ticket.id = uuid();

        content.replyWithMarkdownV2(ticket(this.ticket));

        this.#updateStepAndLastMessageId({
          step: 7,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (this.step === 7) {
        content.replyWithMarkdownV2(
          "Reutilizar informa????o do bilhete? Digite *1* para *SIM* e *2* para *N??O*"
        );

        this.#updateStepAndLastMessageId({
          step: 8,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (this.step === 8 && content.message.text == "1") {
        content.reply(this.questionsObj.passo5);

        this.#updateStepAndLastMessageId({
          step: 9,
          lastMessageId: content.message.message_id,
        });
      }

      if (this.step === 8 && content.message.text == "2") {
        content.reply(
          `Atendimento, finalizado! Obrigado ${this?.ticket?.sellerName}!`
        );

        this.#updateStepAndLastMessageId({});
      }

      next();
    });

    this.bot.on("text", (content, next) => {
      if (
        this.step === 9 &&
        this.lastMessageId !== content.message.message_id
      ) {
        this.ticket.buyerName = content.message.text;

        this.ticket.createdAt = DateTime.now()
          .setLocale("pt-BR")
          .toFormat("dd / MM / yyyy       hh:mm");

        this.ticket.id = uuid();

        content.replyWithMarkdownV2(ticket(this.ticket));
        setTimeout(
          () =>
            content.replyWithMarkdownV2(
              "Reutilizar informa????o do bilhete? Digite *1* para *SIM* e *2* para *N??O*"
            ),
          100
        );

        this.#updateStepAndLastMessageId({
          step: 8,
          lastMessageId: content.message.message_id,
        });
      }

      next();
    });
  }

  #events() {
    this.bot.on("text", (content, next) => {
      if (this.step === 0 && content.message.text.toLowerCase() === "iniciar") {
        content.reply(this.questionsObj.passo1);

        this.#updateStepAndLastMessageId({
          step: 1,
          lastMessageId: content.message.message_id,
        });
      }
      next();
    });
  }

  #help() {
    this.bot.help((content) => {
      content.replyWithMarkdownV2(`
        Lista de comandos dispon??veis:

        *iniciar* \\=\\> D?? in??cio ao atendimento
        */iniciar* \\=\\> D?? in??cio ao atendimento
        */help* \\=\\> Mostrar essa mensagem

        `);
    });
  }

  #commands() {
    this.bot.command("/iniciar", (content, next) => {
      content.reply(this.questionsObj.passo1);

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
