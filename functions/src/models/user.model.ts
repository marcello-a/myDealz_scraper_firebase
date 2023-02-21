import { DealGroup } from "./dealGroup.model";

export interface User {
    id: string;
    recipient: string;
    intrestedGroups: string[]; // represent the search quary in the url after mydealz.de/gruppe/
    dealGroups: DealGroup[];
}