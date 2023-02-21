import { User } from "./models/user.model.js";
import { DealGroup } from "./models/dealGroup.model.js";
import { startScrapeDealGroups } from "./services/scraper.service.js";
import { joinUserDealGroups, mapDealGroupToUser } from "./services/user.service.js";
import { getUsers, saveUsers } from "./services/database.service.js";
import { resetDealGroups } from "./utils/deal.util.js";
import { sendMail } from "./services/mail.service.js";
import functions = require("firebase-functions");

import * as dotenv from 'dotenv';
dotenv.config();

exports.myDealzScraperTEST = functions.https.onCall(async (data: string) => { // For testing
  if (data === process.env.TEST_SECRET) {
    functions.logger.info("Job started onCall.");
    const users: User[] = await getUsers();
    main(users);
    return users;
  }
  return "Unauthorized. Please use correct key!"
});

exports.myDealzScraper = functions
  // .https.onCall(async (data: any) => { // For testing local via npm run shell
  .pubsub
  .schedule('0 18 * * *') // Run at 18:00 https://crontab.guru/#0_18_*_*_*
  .timeZone('Europe/Berlin') // specify the timezone for the schedule
  .onRun(async (context: any) => {
    functions.logger.info("Job started on schedule.");
    const users: User[] = await getUsers();
    main(users);
    return users;
  });

const main = async (users: User[]) => {
  // Get deals
  const scrapeThisDealGroups = joinUserDealGroups(users);
  const dealGroupsWithoutHTML: DealGroup[] = await startScrapeDealGroups(scrapeThisDealGroups);

  // Map deals to user and send mails
  users.forEach((user: User) => {
    const checkForDuplicates: boolean = resetDealGroups();
    user.dealGroups = mapDealGroupToUser(user, dealGroupsWithoutHTML, checkForDuplicates);

    sendMail(user);
  });

  // Update database
  const result = await saveUsers(users);
  functions.logger.info(`Save User result: ${result}`);
}