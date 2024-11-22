import React, {useCallback, useEffect, useRef, useState} from "react";
import "./style.css";
import {Filters, Hotel} from "./types";
import {SearchForm} from "./hotel-search-block";
import {Button, Pagination, Rate, Typography} from "antd";
import {EnvironmentOutlined} from "@ant-design/icons";

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
    const reviewsTitle = reviews_amount === 1
        ? "отзыв"
        : reviews_amount > 1 && reviews_amount < 6 ?
            "отзыва" : "отзывов"
    return (<section className="hotel-card">
        <article className="hotel-card__info-block">
            <p className="hotel-card__title">{name}</p>
            <p className="hotel-card__subtitle">
                <Rate style={{fontSize: "14px"}} disabled value={rating}/>
                <span>
                    {type}
                    <span className="hotel-card__bullet">&#x2022;</span>
                    {reviews_amount} {reviewsTitle}
                </span>
                <span>
                <EnvironmentOutlined/>
                    {country}
                </span>
            </p>
            <p className="hotel-card__description">
                {description}
            </p>
        </article>
        <article className="hotel-card__booking-block">
            <b className="hotel-card__title">{min_price} {currency}</b>
            <p className="hotel-card__subtitle">цена за 1 ночь</p>
            <Button className="booking-button">Забронировать</Button>
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
        {hotels.slice(page, page + maxSize).map((hotel: Hotel) => <HotelItem
            key={hotel.name.replace(" ", "-")} {...hotel} />)}
        <Pagination onChange={handlePageChange} current={page} total={hotels.length} pageSize={maxSize}/>
    </section>);
};

const HotelsNotFound = ({onReset}) => {
    return (<article className="empty-list">
        <Typography.Title level={4}>По данным параметрам ничего не найдено</Typography.Title>
        <Typography.Paragraph type="secondary">
            Попробуйте изменить параметры фильтрации
            или вернуться в общий каталог
        </Typography.Paragraph>
        <Button onClick={onReset}>Очистить фильтр</Button>
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
            {hotels.length > 0
                ? <HotelList hotels={hotels}/>
                : <HotelsNotFound onReset={handleResetFilters}/>}
        </section>
    );
};