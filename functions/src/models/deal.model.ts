export interface DealMetaData {
    hot?: string;
    created?: string;
    expires?: Date | null;
    shipping?: string;
};

// If you change the interface, you have to change the tableTitles.ts file as well!
export interface Deal {
    title: string;
    price: number | null;
    priceWas: number | null;
    imageUrl: string;
    meta: DealMetaData;
    link: string;
    scrapedDate: Date;
};

export class DealBuilder {
    private title: string;
    private price: number | null;
    private priceWas: number | null;
    private imageUrl: string;
    private meta: DealMetaData;
    private link: string;
    private scrapedDate: Date;

    constructor() {
        this.title = "";
        this.price = null;
        this.priceWas = null;
        this.imageUrl = "";
        this.meta = {};
        this.link = "";
        this.scrapedDate = new Date();
    }

    withTitle(title: string): DealBuilder {
        this.title = title;
        return this;
    }

    withPrice(price: number | null): DealBuilder {
        this.price = price;
        return this;
    }

    withPriceWas(priceWas: number | null): DealBuilder {
        this.priceWas = priceWas;
        return this;
    }

    withImageUrl(imageUrl: string | undefined): DealBuilder {
        if (imageUrl != null) {
            this.imageUrl = imageUrl;
        }
        return this;
    }

    withMeta(meta: DealMetaData): DealBuilder {
        this.meta = meta;
        return this;
    }

    withLink(link: string | undefined): DealBuilder {
        if (link != null) {
            this.link = link;
        }
        return this;
    }

    withScrapedDate(scrapedDate: Date): DealBuilder {
        this.scrapedDate = scrapedDate;
        return this;
    }

    build(): Deal {
        return {
            title: this.title,
            price: this.price,
            priceWas: this.priceWas,
            imageUrl: this.imageUrl,
            meta: this.meta,
            link: this.link,
            scrapedDate: this.scrapedDate,
        };
    }
}