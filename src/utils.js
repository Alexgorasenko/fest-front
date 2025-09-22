import React, {useState, useEffect, useCallback, useRef} from 'react'
import moment from "moment";

export const checkSwipeDirection = (e, startX, startY) => {
    let dir = ''
    let pageX = e.touches[0].pageX
    let pageY = e.touches[0].pageY

    let distX = pageX - startX;
    let distY = pageY - startY;

    if (Math.abs(distX) > Math.abs(distY)) {
        dir = (distX < 0) ? 'left' : 'right'
    } else {
        dir = (distY < 0) ? 'up' : 'down'
    }

    return dir
}

export const useClickOutside = (val, ref, cb) => {

    const handleClick = e => {
        if (ref.current && !ref.current.contains(e.target)) {
            cb()
        }
    }

    useEffect(() => {
        if (val) {
            document.addEventListener('click', handleClick, { capture: true })
        } else {
            document.removeEventListener('click', handleClick, { capture: true })
        }

        return () => {
            document.removeEventListener('click', handleClick, { capture: true })
        }
    })
}

export const isEmpty = (obj) => {
    for (let key in obj) {
        // если тело цикла начнет выполняться - значит в объекте есть свойства
        return false
    }
    return true
}

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const intToString = (value) => {
    const suffixes = ["", "k", "m", "b", "t"];
    const suffixNum = Math.floor(("" + value).length / 3);
    let shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
    if (shortValue % 1 != 0) {
        shortValue = shortValue.toFixed(1);
    }
    return shortValue + suffixes[suffixNum];
}

export const getElemHeight = (id) => {
    const elem = document.getElementById(id)
    if (elem) return elem.clientHeight
}

export const scrollOffsetTop = (id) => {
    const elem = document.getElementById(id)
    if (elem) return elem.offsetTop
}

export const getHeightToScrollContainer = (id, cb) => {
    const resizeObserverRef = useRef(null);

    const resizeFunc = useCallback(() => {
        const mainContainer = document.getElementById('offset-container');
        const elem = document.getElementById(id);

        if (!elem || !mainContainer) {
            return;
        }

        const elemTop = elem.getBoundingClientRect().top;
        const containerBottom = mainContainer.clientHeight + mainContainer.offsetTop;
        cb(containerBottom - elemTop);
    }, [id, cb]);

    useEffect(() => {
        resizeFunc();

        window.addEventListener('resize', resizeFunc);

        resizeObserverRef.current = new ResizeObserver(resizeFunc);
        const observer = resizeObserverRef.current;

        const mainContainer = document.getElementById('offset-container');
        const elem = document.getElementById(id);

        if (mainContainer) observer.observe(mainContainer);
        if (elem) observer.observe(elem);

        return () => {
            window.removeEventListener('resize', resizeFunc);
            observer.disconnect();
        };
    }, [resizeFunc, id]);
}

export const pluralForm = (n, arrType = []) => {
    return arrType[(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)]
}

export function useDebounce(value, delay) {

    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {

        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };

    }, [value]);

    return debouncedValue;
}

export const formatBalance = (balance) => {
    const integerBalance = Math.floor(balance);

    if (integerBalance < 1_000) {
        return integerBalance.toString();
    } else if (integerBalance < 1_000_000) {
        return `${(integerBalance / 1_000).toFixed(1)}к`;
    } else if (integerBalance < 1_000_000_000) {
        return `${(integerBalance / 1_000_000).toFixed(1)}м`;
    } else {
        return `${(integerBalance / 1_000_000_000).toFixed(1)}b`;
    }
}

export const formatNumberWithSpaces = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const getRelativeDay = (dateString) => {
    const inputDate = moment(dateString, "YYYY-MM-DD").startOf('day');
    const today = moment().startOf('day');

    const diff = inputDate.diff(today, 'days');

    if (diff === 0) return "Сегодня";
    if (diff === 1) return "Завтра";
    if (diff === -1) return "Вчера";

    return inputDate.format('DD.MM');
};

export const getLocalized = (obj, lang) => obj?.[lang] || obj?.en || '';

export const handleDownloadFile = async (file) => {
    try {
        const response = await fetch(file.fullpath || file.objectURL, { mode: "cors" });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = file.filename || file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Ошибка скачивания:", err);
    }
};

export const formatToOneDecimal = (number) => {
    const fixed = number.toFixed(1);
    return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
}
