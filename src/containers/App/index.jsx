import {useEffect, useState} from "react";
import {inject, observer} from "mobx-react";

import { YMInitializer } from 'react-yandex-metrika'
import axios from "axios";

import {ENDPOINT} from "../../env.js";

import Layout from "../../Layouts/Layout.jsx";

import './style.scss'

const App = inject('mainStore')(observer(({ mainStore }) => {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth)

    const [preflow, setPreflow] = useState(null)

    const [data, setData] = useState()
    const [error, setError] = useState(null)
    const [token, setToken] = useState(window.location.pathname.includes('/admin/init') ? null : localStorage.getItem('_amateum_tkn'))
    const [svrToken, setSvrToken] = useState(window.location.pathname.includes('/admin/init') ? null : localStorage.getItem('_amateum_svr'))
    const [toastMessage, setToastMessage] = useState({status: '', value: ''})
    const [activeSubLink, setActiveSubLink] = useState(0)

    const [device, setDevice] = useState(window.innerWidth <= 600 && window.innerWidth > 0 ? 'mobile' : 'desktop')

    useEffect(() => {
        if (window.location.pathname.includes('/admin/init')) {
            localStorage.removeItem('_amateum_tkn')
            localStorage.removeItem('_amateum_svr')
        }

        axios.get(`${ENDPOINT}userflow/preflow`).then(resp => {
            if(resp.data) {
                setPreflow(resp.data)
                mainStore.setMainStore("preflow", resp.data?.data)
            } else {
                setError(true)
            }
        })
    }, []);

    useEffect(() => {
        if (token && !data) {
            axios.get(`${ENDPOINT}userflow/preload_data`, {
                headers: {
                    Authorization: localStorage.getItem('_amateum_tkn')
                }
            }).then(resp => {
                if(resp.data) {
                    setData(resp.data)
                    mainStore.setMainStore("festival", resp.data?.data?.festival)
                    mainStore.setMainStore("queries", resp.data?.data?.queries)
                    mainStore.setMainStore("canCertDownload", resp.data?.data?.canCertDownload)
                    mainStore.setMainStore("earlyRegistrationPoints", resp.data?.data?.earlyRegistrationPoints)
                } else {
                    setError(true)
                }
            })
        }
    }, [token]);

    useEffect(() => {
        const onResize = () => {
            window.innerWidth <= 600 && window.innerWidth > 0 ? setDevice('mobile') : setDevice('desktop')
            setScreenWidth(window.innerWidth)
        }

        window.addEventListener("resize", onResize)
        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [screenWidth])

    return (
        <Layout
            error={error}
            userToken={token}
            svrToken={svrToken}
            data={data}
            updateToken={e => {
                setSvrToken(e.svr)
                setToken(e.user)
            }}
            updateData={setData}
            device={device}
            toastMessage={toastMessage}
            updateToastMessage={setToastMessage}
            activeSubLink={activeSubLink}
            updateActiveSubLink={setActiveSubLink}
            preflow={preflow?.data}
        />
    )
}))

export default App
