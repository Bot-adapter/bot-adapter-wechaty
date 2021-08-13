import "reflect-metadata";
import {
  Contact,
  Message,
  ScanStatus,
  Wechaty,
  log,
  WechatyOptions,
} from "wechaty";
import { generate } from "qrcode-terminal";
import { Adapter } from "@bot-adapter/core";

import dotenv from "dotenv";

dotenv.config();

export * from "@bot-adapter/core";
export * from "wechaty";

export default class WechatyAdapter {
  bot: Wechaty;
  adapter: Adapter;

  constructor(
    options: WechatyOptions = {
      puppet: "wechaty-puppet-wechat",
    },
    controllers?: Function[]
  ) {
    this.bot = new Wechaty(options);
    this.adapter = new Adapter(controllers);
  }

  async start() {
    const { messageHandler } = this.adapter.getHandlers((msg: Message) =>
      msg.text()
    );
    this.bot.on("scan", this.onScan);
    this.bot.on("login", this.onLogin);
    this.bot.on("logout", this.onLogout);
    this.bot.on("message", messageHandler);
    return this.bot.start();
  }

  onScan(qrcode: string, status: ScanStatus) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      generate(qrcode, { small: true }); // show qrcode on console

      const qrcodeImageUrl = [
        "https://wechaty.js.org/qrcode/",
        encodeURIComponent(qrcode),
      ].join("");

      log.info(
        "StarterBot",
        "onScan: %s(%s) - %s",
        ScanStatus[status],
        status,
        qrcodeImageUrl
      );
    } else {
      log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
    }
  }

  onLogin(user: Contact) {
    log.info("StarterBot", "%s login", user);
  }

  onLogout(user: Contact) {
    log.info("StarterBot", "%s logout", user);
  }
}
