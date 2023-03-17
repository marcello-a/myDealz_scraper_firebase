import { DealGroup } from "../models/dealGroup.model.js";
import { User } from "../models/user.model.js";
import { buildDealGroup, checkForDuplicateDeals } from "../utils/deal.util.js";
import functions = require("firebase-functions");

export const joinUserDealGroups = (users: User[]): string[] => {
    let dealGroups: string[] = [];
    users.forEach((user) => {
        dealGroups = [...dealGroups, ...user.intrestedGroups];
    });

    const uniqueDealGroups = [...new Set(dealGroups)];
    functions.logger.info(`joinUserDealGroups -> ${uniqueDealGroups.length} unique deal groups found.`);
    return uniqueDealGroups;
}

export const mapDealGroupToUser = (user: User, scrapedDealGroups: DealGroup[], resetUserDeals: boolean): DealGroup[] => {
    functions.logger.info(`mapDealGroupToUser for user ${user.id} all scraped deal groups ${scrapedDealGroups.length}. Check for duplicates? -> ${resetUserDeals}`);
    const userDealGroups: DealGroup[] = []
    user.intrestedGroups.forEach((intrestedGroup) => {
        const userScrapedDealGroup = scrapedDealGroups.find(
            scrapedGroup => scrapedGroup.title === intrestedGroup
        );

        if (userScrapedDealGroup) {
            if (resetUserDeals === false) {
                const userOldDealGroup = user.dealGroups.find(oldGroup => oldGroup.title === intrestedGroup);
                if (userOldDealGroup) {
                    userScrapedDealGroup.deals = checkForDuplicateDeals(userScrapedDealGroup.deals, userOldDealGroup.deals);
                }
            }
            const updatedDealGroup = buildDealGroup(userScrapedDealGroup.title, userScrapedDealGroup.deals);
            userDealGroups.push(updatedDealGroup);
        }
    });
    functions.logger.info(`Mapped from user ${user.id} all ${user.intrestedGroups.length} intrestgroups.`);
    return userDealGroups;
}