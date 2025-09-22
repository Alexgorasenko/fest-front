import React, {useState, useEffect, useRef} from "react"

import {inject, observer} from "mobx-react";

import {YMInitializer} from "react-yandex-metrika";

import App from "./App";
import CookiesNotification from "../Components/CookiesNotification/index.jsx";

import {Toast} from "primereact/toast";

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '../assets/scss/index.scss';

const Root = inject("mainStore")(observer(({ mainStore }) => {
    const toastRef = useRef();

    useEffect(() => {
        const appHeight = window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${appHeight}px`);

        mainStore.setMainStore("toastRef", toastRef);
    }, []);

    return (
        <>
            <Toast ref={toastRef} position="top-right" />
            <CookiesNotification/>
            <YMInitializer
                accounts={[95174104]}
                version='2'
                options={{
                    clickmap: true,
                    trackLinks: true,
                    accurateTrackBounce: true,
                    webvisor: true,
                    trackHash: true,
                }}
            />
            <App />
        </>
    )
}))

export default Root
