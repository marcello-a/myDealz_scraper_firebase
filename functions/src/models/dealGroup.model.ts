import { Deal } from "./deal.model.js";

export interface DealGroup {
    title: string;
    newDealsAmount: number;
    htmlTable: string;
    deals: Deal[];
}

export class DealGroupBuilder {
    private title: string;
    private newDealsAmount: number;
    private htmlTable: string;
    private deals: Deal[];

    constructor() {
        this.title = "";
        this.newDealsAmount = 0;
        this.htmlTable = "";
        this.deals = [];
    }

    setTitle(title: string): DealGroupBuilder {
        this.title = title;
        return this;
    }

    setNewDealsAmount(newDealsAmount: number): DealGroupBuilder {
        this.newDealsAmount = newDealsAmount;
        return this;
    }

    setHtmlTable(htmlTable: string): DealGroupBuilder {
        this.htmlTable = htmlTable;
        return this;
    }

    setDeals(deals: Deal[]): DealGroupBuilder {
        this.deals = deals;
        return this;
    }

    build(): DealGroup {
        const dealGroup: DealGroup = {
            title: this.title,
            newDealsAmount: this.newDealsAmount,
            htmlTable: this.htmlTable,
            deals: this.deals,
        };
        return dealGroup;
    }
}