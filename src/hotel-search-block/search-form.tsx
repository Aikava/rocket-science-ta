import React, {
    ChangeEvent,
    FormEvent,
    forwardRef,
    Fragment,
    Ref,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {Filters} from "../types";

import "./style.css";

const CountryInputField = ({availableCountries, value}) => {
    const [search, setSearch] = useState("");
    const [countryList, setCountryList] = useState([]);
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    useEffect(() => {
        if (!search)
            setCountryList(availableCountries);
        else
            setCountryList(availableCountries.filter((country: string) => {
                return country.indexOf(search) >= 0;
            }));
    }, [search]);
    useEffect(() => {
        setCountryList(availableCountries);
    }, [availableCountries]);

    return (
        <>
            <label htmlFor="country">
                <b>Страна</b>
            </label>
            <input type="text"
                   name="country" value={search}
                   onChange={handleSearchChange}
            />
            {countryList.length === 0 && <p>
                К сожалению, по вашему запросу ничего не найдено :(
            </p>}
            {
                countryList.map((country: string) => {
                    const isChecked = value.includes(country);

                    return (<Fragment key={country}>
                        <label>{country}</label>
                        <input data-field-name="country" data-value={country} checked={isChecked} type="checkbox"
                               id={`${country}`}/>
                    </Fragment>);
                })
            }
        </>
    );
};

type HotelTypeProps = {
    value?: Filters["type"];
}
const HotelTypeField = ({value = []}: HotelTypeProps) => {
    return (
        <section>
            <b>Тип</b>
            <fieldset className="hotel-type">
                <label htmlFor="apartment">
                    Апартаменты
                </label>
                <input data-field-name="type" data-value="Апартаменты" checked={value.includes("Апартаменты")}
                       id="apartment" type="checkbox" name="Апартаменты"/>
                <label htmlFor="hotel">
                    Отель
                </label>
                <input data-field-name="type" data-value="Отель" checked={value.includes("Отель")} id="hotel"
                       type="checkbox" name="Отель"/>
            </fieldset>
        </section>
    );
}

const createStarCountList = (checkedStars = []) => Array(5)
    .fill("")
    .map((_, i) => {
        let title = "звезды"
        if (i === 0) {
            title = "звезда"
        } else if (i === 4) {
            title = "звезд"
        }
        const starNumber = i + 1;

        return (<Fragment key={`star-${i}`}>
            <label htmlFor={`star-${i}`}>{starNumber} {title}</label>
            <input
                data-field-name="starCount"
                data-value={starNumber}
                data-value-type="number"
                checked={checkedStars.includes(starNumber)} name={`star-${starNumber}`} type="checkbox"
                id={`star-${i}`}/>
        </Fragment>)
    })
type StarCountFieldProps = {
    value: Filters["starCount"];
}
const StarCountField = ({value = []}: StarCountFieldProps) => {
    const starCountList = useMemo(() => {
        return createStarCountList(value);
    }, [value]);

    return (
        <section className="star-count">
            <b>
                <b>Колличество звезд</b>
            </b>
            <fieldset className="star-count__counts">
                {starCountList}
            </fieldset>
        </section>
    );
};

type ReviewCountFieldProps = {
    value: Filters["reviewCount"];
}
const ReviewCountField = ({value}: ReviewCountFieldProps) => {
    return (
        <section>
            <label htmlFor="reviews">
                <b>Количество отзывов (от)</b>
            </label>
            <input
                value={value < 0 ? "" : value}
                data-field-name="reviewCount"
                data-value-type="number"
                id="reviews" name="reviews" type="number" inputMode="numeric"></input>
        </section>
    );
}

type PriceFieldProps = {
    from: Filters["priceFrom"];
    to: Filters["priceTo"];
    currency: "RUR"
}
const PriceField = ({from = 0, to = 100500, currency}: PriceFieldProps) => {

    return (<section>
        <article className="price-from-to">
            <b>Цена</b>
            <p className="price-from-to__from">
                <input
                    data-field-name="priceFrom"
                    data-value-type="number"
                    id="price-from" value={from}/>
            </p>
            <p className="price-from-to__to">
                <input
                    data-field-name="priceTo"
                    data-value-type="number"
                    id="price-to" value={to}/>
            </p>
        </article>
        <input
            data-field-name="priceFrom"
            data-value-type="number"
            max={100500 - 1} name="min-price" type="range" value={from}/>
        <input
            data-field-name="priceTo"
            max={100500} name="max-price" type="range" value={to}/>
    </section>)
};

type SearchFormProps = {
    onApply?: (filters: Partial<Filters>) => void;
    onReset?: () => void;
    value?: Partial<Filters>;
    availableCountries?: Array<string>;
    forwardRef: Ref<HTMLFormElement>;
}
const initialFilters: Filters = {
    type: [],
    country: [],
    priceFrom: 0,
    priceTo: 100500,
    starCount: [],
    reviewCount: -1
}
export const SearchForm = ({forwardRef, onApply, onReset, availableCountries = []}: SearchFormProps) => {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const handleSubmit = (event: SubmitEvent) => {
        event.preventDefault();
        onApply(filters);
    }
    const handleReset = () => {
        setFilters(initialFilters);
        onReset();
    }
    const handleFormChange = (event: ChangeEvent<HTMLFormElement>) => {
        const {fieldName, valueType} = event.target.dataset;
        let value = "value" in event.target.dataset
            ? event.target.dataset.value
            : event.target.value;
        const isCheckbox = event.target.type === "checkbox";
        const isChecked = event.target.checked;

        if (valueType === "number")
            value = parseInt(value);

        if (!fieldName)
            return;

        if (Array.isArray(filters[fieldName])) {
            setFilters((prev: Filters) => {
                if (isCheckbox && !isChecked)
                    return ({
                        ...prev,
                        [fieldName]: prev[fieldName].filter((val: string | number) => val !== value)
                    })
                else
                    return ({
                        ...prev,
                        [fieldName]: [...prev[fieldName], value]
                    });
            })
        } else {
            setFilters((prev: Filters) => {
                return ({
                    ...prev,
                    [fieldName]: value
                });
            });
        }
    };

    return (<form
        ref={forwardRef}
        method="get"
        action=""
        onSubmit={handleSubmit}
        onReset={handleReset}
        onChange={handleFormChange}
        className="search-form"
    >
        <CountryInputField
            value={filters.country}
            availableCountries={availableCountries}/>
        <HotelTypeField
            value={filters.type}/>
        <StarCountField value={filters.starCount}/>
        <ReviewCountField value={filters.reviewCount}/>
        <PriceField currency={"RUR"}
                    from={filters.priceFrom}
                    to={filters.priceTo}/>
        <button type="submit">Apply filters</button>
        <button type="reset">Clear filters</button>
    </form>);
};