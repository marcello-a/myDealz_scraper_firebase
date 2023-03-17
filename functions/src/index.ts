import { User } from "./models/user.model.js";
import { DealGroup } from "./models/dealGroup.model.js";
import { startScrapeDealGroups } from "./services/scraper.service.js";
import { joinUserDealGroups, mapDealGroupToUser } from "./services/user.service.js";
import { getUsers, saveUsers } from "./services/database.service.js";
import { resetDealGroups } from "./utils/deal.util.js";
import { sendMail } from "./services/mail.service.js";
import functions = require("firebase-functions");

import * as dotenv from 'dotenv';
import { SCHEDULE, TIMEZONE } from "./config/schedule.js";
import { deleteOnWeekday } from "./config/deleteOnWeekday.js";
dotenv.config();

// Secured test method
exports.myDealzScraperTEST = functions.https.onCall(async (data: string) => { // For testing
  if (data === process.env.TEST_SECRET) {
    functions.logger.info("Job started onCall.");
    const users: User[] = await getUsers();
    main(users);
    return users;
  }
  return "Unauthorized. Please use correct key!"
});

// Scheduled triggerd function
exports.myDealzScraper = functions
  .region('europe-west3')
  .pubsub
  .schedule(SCHEDULE)
  .timeZone(TIMEZONE)
  .onRun(async (context: any) => {
    functions.logger.info("Job started on schedule.");
    const users: User[] = await getUsers();
    functions.logger.info(`Got ${users.length} users. Start main routine.`);
    main(users);
    return users;
  });

const main = async (users: User[]) => {
  // Get deals
  const scrapeThisDealGroups = joinUserDealGroups(users);
  const dealGroupsWithoutHTML: DealGroup[] = await startScrapeDealGroups(scrapeThisDealGroups);

  // Map deals to user and send mails
  for (const user of users) {
    const resetUserDeals: boolean = resetDealGroups(deleteOnWeekday);
    user.dealGroups = mapDealGroupToUser(user, dealGroupsWithoutHTML, resetUserDeals);
    functions.logger.info(`Got all information from User ${user.id}. Send mail.`);
    await sendMail(user);
  }

  // Update database
  const result = await saveUsers(users);
  functions.logger.info(`Save User result: ${result}`);
}
