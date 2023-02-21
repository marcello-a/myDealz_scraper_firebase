
import async = require('async');
import nodemailer = require("nodemailer");
import { MailOptions, MailOptionsBuilder } from "../models/mailOption.model.js";
import { DealGroup } from "../models/dealGroup.model.js";
import functions = require("firebase-functions");
import { User } from '../models/user.model.js';

import * as dotenv from 'dotenv';
dotenv.config();

export const buildMailOptions = (mailTo: string, dealGroup: DealGroup): MailOptions => {
  if (process.env.MAIL_USER) {
    return new MailOptionsBuilder(dealGroup)
      .from(process.env.MAIL_USER)
      .to(mailTo)
      .build();
  }
  throw Error("Please set in your .env file the process.env.MAIL_USER")
}

export const useNodemailer = (mailOptions: MailOptions): void => {
  const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    host: 'mail.gmx.net',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_SECRET
    },
  });

  const emailQueue = async.queue((mailOptions: MailOptions, callback) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        functions.logger.error('########## ERROR INFO ##########You may have to login on www.gmx.de and verify your phone number and change the password!########## ERROR INFO ##########');
        functions.logger.error(error);
      } else {
        functions.logger.info("Email sent: " + info.response);
      }
      callback(error);
    });
  }, 1);

  emailQueue.push(mailOptions);
}

export const sendMail = (user: User): void => {
  user.dealGroups.forEach((dealGroup) => {
    const mailOptions: MailOptions = buildMailOptions(user.recipient, dealGroup);
    useNodemailer(mailOptions);
  });
}