import React, {
    ChangeEvent,
    Ref,
    useEffect,
    useMemo,
    useState
} from "react";
import {Filters} from "../types";

import "./style.css";
import {Button, Checkbox, Flex, Input, Slider, Typography} from "antd";
import {CloseOutlined, LineOutlined, MinusOutlined, SearchOutlined} from "@ant-design/icons";

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
    const handleClearSearch = () => {
        setSearch("");
    }

    return (
        <section>
            <Typography.Title level={5}>
                Страна
            </Typography.Title>
            <Input
                prefix={<SearchOutlined/>}
                suffix={<CloseOutlined onClick={handleClearSearch}/>}
                type="text"
                name="country"
                value={search}
                onChange={handleSearchChange}
            />
            <fieldset className="country-list">
                {countryList.length === 0 && <p>
                    К сожалению, по вашему запросу ничего не найдено :(
                </p>}
                {
                    countryList.map((country: string) => {
                        const isChecked = value.includes(country);

                        return (<Checkbox
                            key={country}
                            data-field-name="country"
                            data-value={country}
                            checked={isChecked}
                            type="checkbox">
                            {country}
                        </Checkbox>);
                    })
                }
            </fieldset>
        </section>
    );
};

type HotelTypeProps = {
    value?: Filters["type"];
}
const HotelTypeField = ({value = []}: HotelTypeProps) => {
    return (
        <section>
            <Typography.Title level={5}>
                Тип
            </Typography.Title>
            <fieldset className="hotel-type">
                <Checkbox
                    data-field-name="type"
                    data-value="Апартаменты"
                    checked={value.includes("Апартаменты")}
                    type="checkbox"
                    name="Апартаменты"
                >
                    Апартаменты
                </Checkbox>
                <Checkbox
                    data-field-name="type"
                    data-value="Отель"
                    checked={value.includes("Отель")}
                    type="checkbox">
                    Отель
                </Checkbox>
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

        return (
            <Checkbox
                key={`star-${i}`}
                data-field-name="starCount"
                data-value={starNumber}
                data-value-type="number"
                checked={checkedStars.includes(starNumber)}
                name={`star-${starNumber}`} type="checkbox"
                id={`star-${i}`}>
                {starNumber} {title}
            </Checkbox>);
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
            <Typography.Title level={5}>
                Колличество звезд
            </Typography.Title>
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
            <Typography.Title level={5} >
                Количество отзывов (от)
            </Typography.Title>
            <Input
                placeholder="Например от 10"
                value={value < 0 ? "" : value}
                data-field-name="reviewCount"
                data-value-type="number"
                id="reviews"
                name="reviews"
                inputMode="numeric"></Input>
        </section>
    );
}

type PriceFieldProps = {
    from: Filters["priceFrom"];
    to: Filters["priceTo"];
    currency: string,
    onChange: (from: Filters["priceFrom"], to: Filters["priceTo"]) => void;
}
const PriceField = ({onChange, from = 0, to = 100500, currency}: PriceFieldProps) => {
    const [fromValue, setFromValue] = useState();
    const [toValue, setToValue] = useState();

    const handleSliderChange = ([min, max]) => {
        setFromValue(min);
        setToValue(max);
        onChange(min, max);
    };
    const handleFromPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFromValue(event.target.value);
    }
    const handleToPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
        setToValue(event.target.value);
    }

    useEffect(() => {
        setFromValue(from);
        setToValue(to);
    }, [from, to]);
    return (<section>
        <Typography.Title level={5}>
            Цена
        </Typography.Title>
        <fieldset>
            <article className="price-from-to">
                <p className="price-from-to__from">
                    <Input
                        onChange={handleFromPriceChange}
                        prefix="От"
                        suffix={currency}
                        data-field-name="priceFrom"
                        data-value-type="number"
                        value={fromValue}/>
                </p>
                <MinusOutlined />
                <p className="price-from-to__to">
                    <Input
                        onChange={handleToPriceChange}
                        prefix="До"
                        suffix={currency}
                        data-field-name="priceTo"
                        data-value-type="number"
                        value={toValue}/>
                </p>
            </article>

            <Slider
                range
                onChange={handleSliderChange}
                value={[from, to]}
                max={100500 - 1}/>
        </fieldset>
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
    const handlePriceChange = (from, to) => {
        setFilters(prev => ({
            ...prev,
            priceFrom: parseInt(from),
            priceTo: parseInt(to)
        }))
    }

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
        <PriceField
            onChange={handlePriceChange}
            currency={"₽"}
            from={filters.priceFrom}
            to={filters.priceTo}/>
        <section className="button-block">
            <Button type="primary" htmlType="submit">Apply filters</Button>
            <Button htmlType="reset">Clear filters</Button>
        </section>
    </form>);
};