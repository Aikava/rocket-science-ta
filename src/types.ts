export type Hotel = {
    "name": string
    "country": string,
    "address": string,
    "stars": number,
    "type": string,
    "description": string,
    "services": Array<string>,
    "min_price": number,
    "currency": string,
    "rating": number,
    "reviews_amount": number,
    "last_review": string
}

export type Filters = {
    country: Array<string>;
    type: Array<"apartment" | "hotel" | "">;
    starCount: Array<number>;
    reviewCount: number;
    priceFrom: number;
    priceTo: number;
}