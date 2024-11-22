import React, {ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState} from "react";
import "./style.css";
import {Filters, Hotel} from "./types";
import {SearchForm} from "./hotel-search-block";
import {Pagination} from "antd";

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
    return (<section className="hotel-card">
        <article className="hotel-card__info-block">
            <p className="hotel-card__title">{name}</p>
            <p className="hotel-card__subtitle">
                {rating} {type} {reviews_amount} {country}
            </p>
            <p className="hotel-card__description">
                {description}
            </p>
        </article>
        <article className="hotel-card__booking-block">
            <b className="hotel-card__title">{min_price} {currency}</b>
            <p className="hotel-card__subtitle">цена за 1 ночь</p>
            <button className="booking-button">Забронировать</button>
        </article>
    </section>);
};
type HotelProps = {
    hotels: Array<Hotel>;
}
const HotelList = ({hotels}: HotelProps) => {
    const [page, setPage] = useState(0);
    const maxSize = 3;
    const handlePageChange = (page: number) => {
        setPage(page);
    }
    return (<section className="list">
        {hotels.slice(page, page + maxSize).map((hotel: Hotel) => <HotelItem key={hotel.name.replace(" ", "-")} {...hotel} />)}
        <Pagination onChange={handlePageChange} current={page} total={hotels.length} pageSize={maxSize}/>
    </section>);
};

const HotelsNotFound = ({ onReset }) => {
    return (<article className="empty-list">
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

        if (filters.starCount.length > 0)
            isValid &&= filters.starCount.includes(hotel.stars);

        if (filters.priceFrom)
            isValid &&= filters.priceFrom <= hotel.min_price;

        if (filters.priceTo)
            isValid &&= filters.priceTo >= hotel.min_price;

        if (filters.country.length > 0)
            isValid &&= filters.country.includes(hotel.country);

        return isValid;
    })
}

export const Application = () => {
    const [hotels, setHotels] = useState<Array<Hotel>>([]);
    const formRef = useRef();
    const handleSearch = useCallback((filters: Filters) => {
        void loadHotelData()
            .then(list => {
                setHotels(applyFiltersToList(filters, list));
            });
    }, []);
    const [availableCountries, setAvailableCountries] = useState([]);
    const handleResetFilters = () => {
        formRef.current.reset();
        void loadHotelData().then(result => {
            setHotels(result);
        });
    };
    useEffect(() => {
        void loadHotelData().then(result => {
            setHotels(result);
            const countries = new Set(result.map((hotel: Hotel) => hotel.country));

            setAvailableCountries([...countries.values()])
        });
    }, []);
    return (
        <section className="content">
            <SearchForm
                forwardRef={formRef}
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