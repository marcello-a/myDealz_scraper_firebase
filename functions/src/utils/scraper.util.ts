import { Deal, DealBuilder, DealMetaData } from "../models/deal.model.js";

import axios from "axios";
import cheerio = require("cheerio");
import functions = require("firebase-functions");

const MAX_EXPIRED_DEALS_IN_A_ROW = 5;

const extractNumberFromString = (str: string): number | null => {
    if (str.indexOf('Gratis') !== -1) {
        return 0;
    }
    const match = str.match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
}
const extractDateFromString = (str: string): Date | null => {
    const match = str.match(/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/);
    if (null != match) {
        const dateComponents = match[0].split(".");
        const day = parseInt(dateComponents[0], 10);
        const month = parseInt(dateComponents[1], 10) - 1;
        const year = parseInt(dateComponents[2], 10);

        return new Date(year, month, day);
    }

    return null;
}

const processMetaData = (meta: string[]): DealMetaData => {
    const hotKeywords = ['heiß seit '];
    const createdKeywords = ['eingestellt am ', 'aktualisiert '];
    const expiresKeywords = ['Läuft bis ', 'ENDET HEUTE'];
    const shippingKeywords = ['Kostenlos', 'Lieferung aus '];

    const dealMeta: DealMetaData = {};

    meta.forEach((value) => {
        if (expiresKeywords.some(expiresKey => value.includes(expiresKey))) {
            if (value.includes('ENDET HEUTE')) {
                const today = new Date();
                today.setHours(23, 59, 59, 0);
                dealMeta.expires = today;
                return;
            }
            dealMeta.expires = extractDateFromString(value);
            return;
        }
        const createdKey = createdKeywords.find(createdKey => value.includes(createdKey))
        if (createdKey != null) {
            dealMeta.created = value.replace(createdKey, '');
            return;
        }
        const hotKeyword = hotKeywords.find(hotKeyword => value.includes(hotKeyword))
        if (hotKeyword != null) {
            dealMeta.hot = value.replace(hotKeyword, '');
            dealMeta.hot = value;
            return;
        }
        const shippingKeyword = shippingKeywords.find(shippingKeyword => value.includes(shippingKeyword))
        if (shippingKeyword != null) {
            dealMeta.shipping = value.replace(shippingKeyword, '');
            dealMeta.shipping = value;
            return;
        }
    });

    return dealMeta;
}

/**
 * Scrapes deals from my dealz url
 * If MAX_EXPIRED_DEALS_IN_A_ROW count matches the amount of expired deals in a row the scraper terminates
 * @param url scrape from this url
 * @param callback const is called after scraping is finished. Callback contains the scraped data
 */
export const scrapeDealsFromUrl = (url: string): Promise<Deal[]> => {
    return new Promise((resolve, reject) => {
        // get data from mydealz and get the articles
        axios.get(url).then(({ data: html }) => {

            const $ = cheerio.load(html);
            // const deals: Deal[] = [];
            const expiredDealCount = { index: 0, expiredCount: 0 };

            const deals: Deal[] = $('article').map((i, deal) => {
                // Look for expired deals and ignor them.
                if ($(deal).find('.cept-show-expired-threads').text() == "Abgelaufen") {
                    if (expiredDealCount.index == i - 1) {
                        expiredDealCount.expiredCount += 1;

                        if (expiredDealCount.expiredCount === MAX_EXPIRED_DEALS_IN_A_ROW) {
                            functions.logger.info(`Found ${MAX_EXPIRED_DEALS_IN_A_ROW} expired deals in a row. Scraper terminated`);
                            return false; // Break cheerio each loop
                        }
                    }
                    expiredDealCount.index = i;
                    return;
                }

                // Find all meta information which could lead to the information when the deal expires
                const scrapedMeta: string[] = [];
                $(deal).find('span').find('.hide--toW3').each((i, metaElement) => {
                    scrapedMeta[i] = $(metaElement).text();
                });
                const metaObj = processMetaData(scrapedMeta);

                return new DealBuilder()
                    .withTitle($(deal).find('.thread-link').text())
                    .withPrice(extractNumberFromString($(deal).find('.thread-price').text()))
                    .withPriceWas(extractNumberFromString($(deal).find('span').find('.mute--text, .text--lineThrough').text()))
                    .withImageUrl($(deal).find('img').attr('src'))
                    .withMeta(metaObj)
                    .withLink($(deal).find('.thread-link').attr('href'))
                    .withScrapedDate(new Date())
                    .build();
            }).get();

            resolve(deals);
        }), (err: any) => {
            reject(err);
        };
    });
}

