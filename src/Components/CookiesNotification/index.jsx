import "./style.scss";
import { Button } from "primereact/button";
import { useCookies } from "react-cookie";

const CookiesNotification = () => {
    const [cookies, setCookie] = useCookies(["_am_cookie"]);

    const onChange = (newName) => {
        const date = new Date();
        date.setFullYear(new Date().getFullYear() + 1);
        setCookie("_am_cookie", newName, { path: "/", expires: date });
    };

    return !cookies["_am_cookie"] ? (
        <div className={"cookies"}>
            <div className={"cookies-wrapper"}>
                <div className={"cookies-text"}>
                    Мы обрабатываем Cookies для улучшения работы сайта, анализа трафика, персонализации сервисов и удобства пользователей.
                    <div className={"cookies-text-secondary"}>
                        Используя сайт или кликая «Я согласен», Вы соглашаетесь с Условиями обработки метрических данных в cистеме «Всероссийский Фестиваль «Футбол в школе». Вы можете запретить
                        обработку Cookies в настройках браузера. Пожалуйста, ознакомьтесь с <span className="cookies__link" onClick={() => window.open('/docs/cookies.docx')}>Условиями обработки метрических данных в cистеме «Всероссийский фестиваль «Футбол в школе».</span>
                    </div>
                </div>
                <Button id="acceptCookies" onClick={() => onChange(true)}>
                    Я согласен
                </Button>
            </div>
        </div>
    ) : null;
};

export default CookiesNotification;
