import { tableStyle } from "../styles/tableStyle.js";
import { isToday, isTomorrow } from "../utils/deal.util.js";
import { Deal, DealMetaData } from "./deal.model.js";

/**
 * Generate a HTML table as string.
 */
export class HtmlTable {
    htmlTable: string;

    constructor(htmlTable: string) {
        this.htmlTable = htmlTable;
    }

    getTableString(): string {
        return this.htmlTable;
    }

    static builder() {
        return new HtmlTableBuilder();
    }
}

/**
 * How to use this builder:
 * const htmlTable = HtmlTable.builder()
      .withTableStyle() // optional
      .withTableColumns(newDeals)
      .build()
 */
class HtmlTableBuilder {
    private htmlTable: string = '';
    private htmlTableTagBeginSet = false;

    private beginTableTag() {
        if (this.htmlTableTagBeginSet) {
            return;
        }
        this.htmlTable += `<body style="font-family: 'Open Sans', sans-serif;">
        <table style="border-collapse: collapse; width: 100%; margin: 20px auto;">`;
        this.htmlTableTagBeginSet = true;
    }

    private isDealTimesensitive(deal: Deal): string {
        if (deal.meta?.expires != null) {
            const date = new Date(deal.meta.expires);
            if (isToday(date)) {
                return 'background-color: rgba(187, 63, 63, 0.3);'
            } if (isTomorrow(date)) {
                return 'background-color: rgba(76, 175, 80, 0.3);'
            }
        }
        return '';
    }

    private buildDealRowPrice(price: number | null, priceWas: boolean): string {
        if (price == null && priceWas == false) {
            return 'No price found.';
        }
        if (price == null) {
            return '';
        }
        let html = '<div style="padding-bottom: 4px;">Price: '
        if (priceWas) {
            html = '<div><s>Was: '
        }
        return `${html}${price === 0 ? '<b>Gratis</b>' : `${price}€`}${priceWas ? '</s></div>' : '</div>'}`;
    }
    private buildDealRowMeta(meta: DealMetaData): string {
        let dealRow: string = ''
        if (meta != null) {
            dealRow += '<div style="width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-around; padding: 0 8px;">';
            for (const [key, value] of Object.entries(meta)) {
                if (value != null) {
                    dealRow += `<div style="padding: 4px; width: 100%; text-align: center;">`;
                    if (value instanceof Date) {
                        dealRow += `${key}: <b>${isToday(value) ? '<b>Today</b>' : isTomorrow(value) ? '<b>Tomorrow</b>' : value.toLocaleDateString('de-DE')}</b>`;
                    } else {
                        dealRow += `${key}: <b>${value}</b>`;
                    }
                    dealRow += "</div>"
                }
            }
            dealRow += '</div>';
        }
        return dealRow;
    }

    // Use this available styles and try to do everythin in style-tag for max compatibility - https://developers.google.com/gmail/design/css
    private buildDealRow(deal: Deal, index: number): string {
        let dealRow =
            `<tr style="${index % 2 ? 'background-color: #f2f2f2;' : ''}">
                <td style="${this.isDealTimesensitive(deal)} border: 1px solid #dddddd; padding: 10px; display: grid; row-gap: 0px; grid-template-columns: 1fr; grid-template-rows: auto auto">   
                    <div class="deal-image-meta" style="display: grid; justify-content: center; align-items: center; padding: 15px 0;">
                        <div style="text-align: center;">
                            <img src="${deal.imageUrl}" alt="${deal.title}" style="max-width: 30rem; height: 15rem; object-fit: contain; box-shadow: 2px 2px 10px #cccccc; margin: 0 auto;">
                            ${this.buildDealRowMeta(deal.meta)}
                        </div>
                    </div>
                    <div class="deal-body" style="border: 1px solid #ddd; padding: 8px; font-size: 16px; display: grid; justify-content: center; align-items: center; grid-template-rows: auto auto auto;">
                        <div class="deal-title" style="font-weight: bold; padding-top: 12px; padding-bottom: 24px; text-align: center;">
                            ${deal.title}
                        </div>
                        <div style="margin: 16px; text-align: center;">
                            ${this.buildDealRowPrice(deal.price, false)}
                            ${this.buildDealRowPrice(deal.priceWas, true)}
                        </div>
                        <div class="deal-button" style="text-align: center;">
                            <a href="${deal.link}">
                            <button style="max-width: 10rem; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; width: 100%; min-width: 10rem; border-radius: 5px; display: inline-block;">
                                Deal
                            </button>
                            </a>
                        </div>
                    </div> 
                </td>
            </tr>`;
        return dealRow;

    }

    // Do not change: Change utils/table/tableStyle instead!
    withTableStyle() {
        this.htmlTable += tableStyle;
        this.beginTableTag();
        return this;
    }

    withTableColumns(tableColumns: Deal[]) {
        if (tableColumns.length === 0) {
            throw new Error("Input array 'tableColumns' cannot be empty");
        }
        this.beginTableTag();
        this.htmlTable += '<tbody>';
        this.htmlTable += tableColumns.map((deal, index) => {
            return this.buildDealRow(deal, index);
        }).join('');
        this.htmlTable += '</tbody>';
        return this;
    }

    build() {
        this.htmlTable += '</table></body></html>';
        return new HtmlTable(this.htmlTable);
    }
}