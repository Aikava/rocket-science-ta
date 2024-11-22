import React, {ChangeEvent, FormEvent, useCallback, useEffect, useState} from "react";
import "./style.css";
import {Filters, Hotel} from "./types";
import {SearchForm} from "./hotel-search-block";

const HotelItem = (props: Hotel) => {
    const {
        name,
        rating,
        min_price,
        type,
        reviews_amount,
        country,
        description,
        currency
    } = props;
    return (<article className="hotel-card">
        <p className="hotel-card__info-block">
            <div className="hotel-card__title">{name}</div>
            <div className="hotel-card__subtitle">
                {rating} {type} {reviews_amount} {country}
            </div>
            <div className="hotel-card__description">
                {description}
            </div>
        </p>
        <p className="hotel-card__booking-block">
            <div className="hotel-card__title">{min_price} {currency}</div>
            <div className="hotel-card__subtitle">цена за 1 ночь</div>
            <button className="booking-button">Забронировать</button>
        </p>
    </article>);
};
type HotelProps = {
    hotels: Array<Hotel>;
}
const HotelList = ({hotels}: HotelProps) => {
    return (<section className="list">
        {hotels.map((hotel: Hotel) => <HotelItem key={hotel.name.replace(" ", "-")} {...hotel} />)}
    </section>);
};

const HotelsNotFound = ({ onReset }) => {
    return (<article>
        <b>По данным параметрам ничего не найдено</b>
        <p>
            Попробуйте изменить параметры фильтрации
            или вернуться в общий каталог
        </p>
        <button onClick={onReset}>Очистить фильтр</button>
    </article>);
}

const loadHotelData = async (): Promise<Array<Hotel>> => {
    const response = await fetch("./hotels.json");
    const hotelList = await response.json();

    return hotelList.hotels;
}
const applyFiltersToList = (filters: Partial<Filters>, list: Array<Hotel>) => {
    return list.filter(hotel => {
        let isValid = true;

        if (filters.reviewCount)
            isValid &&= hotel.reviews_amount >= filters.reviewCount;

        if (filters.type.length > 0)
            isValid &&= filters.type.includes(hotel.type);

        return isValid;
    })
}
const localStorageNS = `${window.location.href}--search-form`;
export const Application = () => {
    const [hotels, setHotels] = useState([]);
    const [filters, setFilters] = useState({});
    const handleSearch = useCallback((data: Partial<Filters>) => {
        void loadHotelData().then(list => {
            setHotels(applyFiltersToList(data, list));
        });
    }, []);
    const [availableCountries, setAvailableCountries] = useState([]);
    const handleResetFilters = () => {
        void loadHotelData().then(hotels => setHotels(hotels));
    };
    useEffect(() => {
        void loadHotelData().then(result => {
            setHotels(result);
            const countries = new Set(result.map((hotel: Hotel) => hotel.country));

            setAvailableCountries([...countries.values()])
        });
    }, []);

    useEffect(() => {
        const storedFilters = localStorage.getItem(localStorageNS);
        console.log(storedFilters);
        if (storedFilters)
            setFilters(JSON.parse(storedFilters));
    }, []);
    const handleFormChange = (event: ChangeEvent<FormEvent>) => {
        window.localStorage.setItem(localStorageNS, JSON.stringify(filters));
    };

    return (
        <section className="content">
            <SearchForm
                value={filters}
                onChange={handleFormChange}
                onApply={handleSearch}
                onReset={handleResetFilters}
                availableCountries={availableCountries}
            />
            { hotels.length > 0
                ? <HotelList hotels={hotels} />
                : <HotelsNotFound onReset={handleResetFilters} /> }
        </section>
    );
};