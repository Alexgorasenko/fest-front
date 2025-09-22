import React, { Component } from 'react'

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Provider } from 'mobx-react'

import appStore from '../stores/appStore';
import mainStore from '../stores/mainStore';

import Root from './Root'

const stores = {
    appStore,
    mainStore,
};

const Routing = () => {
    return (
        <>
            <Provider {...stores}>
                <BrowserRouter>
                    <Routes>
                        <Route path={"/:firstParam/:secondParam/:thirdParam/:fourthParam/:fifthParam/:sixthParam"} element={<Root />} />
                        <Route path={"/:firstParam/:secondParam/:thirdParam/:fourthParam/:fifthParam"} element={<Root />} />
                        <Route path={"/:firstParam/:secondParam/:thirdParam/:fourthParam"} element={<Root />} />
                        <Route path={"/:firstParam/:secondParam/:thirdParam"} element={<Root />} />
                        <Route path={"/:firstParam/:secondParam"} element={<Root />} />
                        <Route path={"/:firstParam"} element={<Root />} />
                        <Route path={"/"} element={<Root />} />
                    </Routes>
                </BrowserRouter>
            </Provider>
        </>
    )
}

export default Routing
