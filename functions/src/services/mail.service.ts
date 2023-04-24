
import async = require('async');
import nodemailer = require("nodemailer");
import { MailOptions, MailOptionsBuilder } from "../models/mailOption.model.js";
import { DealGroup } from "../models/dealGroup.model.js";
import functions = require("firebase-functions");
import { User } from '../models/user.model.js';

import * as dotenv from 'dotenv';
dotenv.config();

export const buildMailOptions = (mailTo: string, dealGroup: DealGroup): MailOptions => {
  if (process.env.EMAIL_USER) {
    return new MailOptionsBuilder(dealGroup)
      .from(process.env.EMAIL_USER)
      .to(mailTo)
      .build();
  }
  throw Error("Please set in your .env file the process.env.EMAIL_USER")
}

export const useNodemailer = async (mailOptions: MailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    host: 'mail.gmx.net',
    port: 587,
    tls: { rejectUnauthorized: false },
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  const emailQueue = async.queue(async (mailOptions: MailOptions) => {
    try {
      const info = await transporter.sendMail(mailOptions);
      functions.logger.info("Email sent: " + info.response);
    } catch (error) {
      functions.logger.error('########## ERROR INFO ##########You may have to login on www.gmx.de and verify your phone number and change the password!########## ERROR INFO ##########');
      functions.logger.error(error);
    }
  }, 1);

  await emailQueue.push(mailOptions);
}


export const sendMail = async (user: User): Promise<void> => {
  for (const dealGroup of user.dealGroups) {
    const mailOptions: MailOptions = buildMailOptions(user.recipient, dealGroup);
    await useNodemailer(mailOptions);
  }
}