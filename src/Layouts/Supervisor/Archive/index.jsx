import {useEffect, useState} from "react";

import {inject, observer} from "mobx-react";

import moment from "moment/moment.js";

import List from "./List";
import Detail from "./Detail";

import './style.scss'
import {computed} from "mobx";

const Archive = inject('mainStore')(observer(({ mainStore, token }) => {
    const festival = computed(() => mainStore.getMainStore('festival')).get();

    const [data, setData] = useState([])
    const [activeOrg, setActiveOrg] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (token) {
            setLoading(true)
            mainStore.getByUrl(token, "svr/get_archive")
                .then(resp => {
                    if (resp && resp.success) {
                        const sortedData = resp.data.filter(d => d._id !== festival?._id).sort((a, b) => moment(a.dateStart, "DD.MM.YYYY") < moment(b.dateStart, "DD.MM.YYYY") ? 1 : -1)
                        const modelData = [{label: "Все года", organizations: sortedData.map(s => s.organizations.map(o => o)).flat()}, ...sortedData]
                        setData(modelData)
                    }
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [token]);

    const handleSvrBack = () => {
        setActiveOrg(null)
    }

    const Specified = activeOrg ? Detail : List

    return (
        <div className="archive-svr">
            {loading ? (
                <div className="archive-svr__loader">
                    <i className="pi pi-spin pi-spinner"/>
                </div>
            ) : (
                <Specified data={data} activeOrg={activeOrg} handleOrg={setActiveOrg} token={token} handleSvrBack={handleSvrBack}/>
            )}
        </div>
    )
}))

export default Archive