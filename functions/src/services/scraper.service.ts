import { DealGroup, DealGroupBuilder } from "../models/dealGroup.model.js";
import { scrapeDealsFromUrl } from "../utils/scraper.util.js";
import functions = require("firebase-functions");

const baseUrl = "https://www.mydealz.de/gruppe/";

export const startScrapeDealGroups = async (dealGroupTitles: string[]): Promise<DealGroup[]> => {
    const promises = dealGroupTitles.map(async (dealGroupTitle) => {
        const url = baseUrl + dealGroupTitle;

        // Get deals from URL
        const scrapedDeals = await scrapeDealsFromUrl(url);
        if (scrapedDeals.length === 0) {
            functions.logger.info(`No deals scraped - ${url}`);
            return null;
        }
        functions.logger.info(`Scraped ${scrapedDeals.length} deals in deal group ${dealGroupTitle}`);
        return new DealGroupBuilder()
            .setTitle(dealGroupTitle)
            .setDeals(scrapedDeals)
            .build();
    });

    const dealGroups = await Promise.all(promises);
    return dealGroups.filter((dealGroup) => dealGroup !== null) as DealGroup[];
};