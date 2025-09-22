import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

import { inject, observer } from "mobx-react"
import { computed } from "mobx"

import moment from "moment";

import Tabs from "./Tabs/index.jsx";
import Reports from "./Reports/index.jsx";
import Queries from "./Queries/index.jsx";

import {TabMenu} from "primereact/tabmenu";

import './style.scss'

const Archive = inject('mainStore')(observer(({ mainStore, token, svrArchiveData = false, handleSvrBack = () => {} }) => {
    const festival = computed(() => mainStore.getMainStore('festival')).get();

    const { secondParam } = useParams()
    const navigator = useNavigate()

    const [data, setData] = useState([])
    const [activeIdx, setActiveIdx] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (token) {
            setLoading(true)
            if (svrArchiveData) {
                mainStore.getByUrl(token, `svr/get_archive_by_inn?inn=${svrArchiveData.inn}`)
                    .then(resp => {
                        if (resp && resp.success) {
                            const sortedData = resp.data.sort((a, b) => moment(a.dateStart, "DD.MM.YYYY") < moment(b.dateStart, "DD.MM.YYYY") ? 1 : -1)
                            setData(sortedData)
                        }
                    })
                    .finally(() => {
                        setLoading(false)
                    })
                return
            }
            mainStore.getByUrl(token, "userflow/get_archive_from_last_query")
                .then(resp => {
                    if (resp && resp.success) {
                        const sortedData = resp.data.filter(d => d._id !== festival?._id).sort((a, b) => moment(a.dateStart, "DD.MM.YYYY") < moment(b.dateStart, "DD.MM.YYYY") ? 1 : -1)
                        setData(sortedData)
                    }
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [token, svrArchiveData]);

    const handleBack = () => {
        if (svrArchiveData && !secondParam) {
            handleSvrBack()
            return
        }
        navigator(-1)
    }

    const model = data && data.length ? data.map(d => ({
        label: `${moment(d.dateStart, "DD.MM.YYYY").format("YYYY")}/${moment(d.dateEnd, "DD.MM.YYYY").format("YYYY")}`
    })) : []

    const title = secondParam && titles[secondParam] ? titles[secondParam] : svrArchiveData ? svrArchiveData.name : "Архив"

    const subtitle = secondParam && svrArchiveData ? svrArchiveData.name : false

    const Specified = secondParam && wrap[secondParam] ? wrap[secondParam] : Tabs

    return (
        <div className="archive">
            {loading ? (
                <div className="archive__loader">
                    <i className="pi pi-spin pi-spinner"/>
                </div>
            ) : data?.length > 0 ? (
                <>
                    <div className="archive__header">
                        <div className="archive__title">
                            {(secondParam || svrArchiveData) && (
                                <div className="archive__back" onClick={handleBack}>
                                    <i className='pi pi-chevron-left'/>
                                    <span>Назад</span>
                                </div>
                            )}
                            <h1>{title}</h1>
                            {subtitle && <span>{subtitle}</span>}
                        </div>
                        <TabMenu model={model} activeIndex={activeIdx} onTabChange={(e) => setActiveIdx(e.index)} className="archive__tabmenu"/>
                    </div>

                    <Specified data={data[activeIdx]}/>
                </>
            ) : (
                <div className="archive__empty">
                    С данного профиля не было подано заявок для участия в Всероссийском фестивале &#34;Футбол в школе&#34;
                </div>
            )}
        </div>
    )
}))

const wrap = {
    reports: Reports,
    queries: Queries
}

const titles = {
    reports: "Отчёты о мероприятиях",
    queries: "Заявки на участие"
}

export default Archive