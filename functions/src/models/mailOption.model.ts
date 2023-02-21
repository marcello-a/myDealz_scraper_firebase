import { DealGroup } from "./dealGroup.model.js";

export interface MailOptions {
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
    html?: string;
}

export class MailOptionsBuilder {
    private options: MailOptions;

    constructor(group: DealGroup) {
        this.options = {};
        this.subject(group);
        this.text(group);
        this.html(group.htmlTable);
    }

    from(from: string): MailOptionsBuilder {
        this.options.from = from;
        return this;
    }

    to(to: string): MailOptionsBuilder {
        this.options.to = to;
        return this;
    }

    subject(group: DealGroup): MailOptionsBuilder {
        this.options.subject = `(${group.newDealsAmount}) ${group.title}`;
        return this;
    }

    text(group: DealGroup): MailOptionsBuilder {
        this.options.text = `${group.title} has ${group.newDealsAmount} new deals. Enable HTML in your mail to see the deals :)`;
        return this;
    }

    html(html: string): MailOptionsBuilder {
        this.options.html = html;
        return this;
    }

    build(): MailOptions {
        return this.options;
    }
}
