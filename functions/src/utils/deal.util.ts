import { Deal } from "../models/deal.model";
import { DealGroup, DealGroupBuilder } from "../models/dealGroup.model";
import { HtmlTable } from "../models/htmlTable.model";
import functions = require("firebase-functions");

/**
 * Reset dealGroups on a specific weekday. 
 * So the recipient becomes a full list of all deals, even if he saw them already
 * 
 * Weekdays:
 * 0: sunday
 * 1: monday
 * 2: tuesday
 * 3: wednesday
 * 4: thursday
 * 5: friday
 * 6: saturday
 * @param weekday DEFAULT sunday
 */
export const resetDealGroups = (weekday: number): boolean => {
    if (weekday) {
        functions.logger.info(`Delete files on week day (${weekday ? weekday : '0: Sunday'})...`);

        const deleteOnThisDay: number = weekday == null ? 0 : weekday;
        const today = new Date();

        if (today.getDay() === deleteOnThisDay) {
            return true;
        }
    }
    return false;
}

export const buildDealGroup = (dealGroupTitle: string, deals: Deal[]): DealGroup => {
    // Create html table for email
    const htmlTable = HtmlTable.builder()
        .withTableStyle()
        .withTableColumns(deals)
        .build();

    return new DealGroupBuilder()
        .setTitle(dealGroupTitle)
        .setNewDealsAmount(deals.length)
        .setHtmlTable(htmlTable.getTableString())
        .setDeals(deals)
        .build();
}

// Find new deals
export const checkForDuplicateDeals = (scrapedDeals: Deal[], oldDeals: Deal[]): Deal[] => {
    if (oldDeals.length == 0) {
        return scrapedDeals;
    }

    // Check for new deals
    const oldDealsMap = new Map();
    oldDeals.forEach(deal => {
        if (deal) {
            oldDealsMap.set(deal.title, deal);
        }
    });

    const newDeals: Deal[] = [];
    scrapedDeals.forEach(newDeal => {
        const oldDeal = oldDealsMap.get(newDeal.title);
        if (null == oldDeal) {
            newDeals.push(newDeal);
        }
    });

    functions.logger.info(`Found ${newDeals.length} new deals.`);
    return newDeals;
}

const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
}

export const isTomorrow = (date: Date): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(date, tomorrow);
}

export const isDealTimesensitive = (deal: Deal): boolean => {
    if (deal.meta?.expires != null) {
        const date = new Date(deal.meta.expires);
        if (isToday(date) || isTomorrow(date)) {
            return true;
        }
    }
    return false;;
}

export const getOnlyUrgendts = (deals: Deal[]): Deal[] => {
    return deals.filter((deal: Deal) => isDealTimesensitive(deal));
};
