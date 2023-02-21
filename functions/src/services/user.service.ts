import { DealGroup } from "../models/dealGroup.model.js";
import { User } from "../models/user.model.js";
import { buildDealGroup, checkForDuplicateDeals } from "../utils/deal.util.js";

export const joinUserDealGroups = (users: User[]): string[] => {
    let dealGroups: string[] = [];
    users.forEach((user) => {
        dealGroups = [...dealGroups, ...user.intrestedGroups];
    });

    const uniqueDealGroups = [...new Set(dealGroups)];
    return uniqueDealGroups;
}

export const mapDealGroupToUser = (user: User, scrapedDealGroups: DealGroup[], checkForDuplicates: boolean): DealGroup[] => {
    const userDealGroups: DealGroup[] = []
    user.intrestedGroups.forEach((intrestedGroup) => {
        const userScrapedDealGroup = scrapedDealGroups.find(
            scrapedGroup => scrapedGroup.title === intrestedGroup
        );

        if (userScrapedDealGroup) {
            if (checkForDuplicates) {
                const userOldDealGroup = user.dealGroups.find(oldGroup => oldGroup.title === intrestedGroup);
                if (userOldDealGroup) {
                    userScrapedDealGroup.deals = checkForDuplicateDeals(userScrapedDealGroup.deals, userOldDealGroup.deals);
                }
            }
            const updatedDealGroup = buildDealGroup(userScrapedDealGroup.title, userScrapedDealGroup.deals);
            userDealGroups.push(updatedDealGroup);
        }
    });
    return userDealGroups;
}