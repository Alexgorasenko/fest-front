import { useEffect, useState } from 'react'

import {inject, observer} from "mobx-react";
import { computed } from "mobx"

import { ENDPOINT } from '../../env'
import moment from "moment";
import axios from 'axios'

import { ProgressBar } from 'primereact/progressbar'
import {Dropdown} from "primereact/dropdown";

import './style.scss'

const PublicUserDashboard = inject('mainStore')(observer(({ mainStore, token }) => {
    const [data, setData] = useState(null)
    const [fests, setFests] = useState([])
    const [activeFestId, setActiveFestId] = useState(false)

    useEffect(() => {
        if(token) {
            mainStore.getByUrl(token, "refs/festivals")
                .then(resp => {
                    if (resp && resp.success) {
                        const sortedFests = resp.data.filter(d => moment(d.dateStart, "DD.MM.YYYY") <= moment()).sort((a, b) => moment(a.dateStart, "DD.MM.YYYY") < moment(b.dateStart, "DD.MM.YYYY") ? 1 : -1)
                        setFests(sortedFests)
                        setActiveFestId(sortedFests[0]?._id)
                    }
                })
        }
    }, [token])

    useEffect(() => {
        if (activeFestId) {
            axios.get(`${ENDPOINT}dashboards/main/${activeFestId}`, {
                headers: {
                    authorization: token
                }
            }).then(resp => {
                setData(resp.data)
            }).catch(e => {
                const error = e.response.data
                mainStore.showToast({ severity: "error", life: 2000, summary: error.message })
                setData(false)
            })
        }
    }, [activeFestId]);

    return (
        <div className='dashboard pu'>
            <div className="dashboard__header">
                <h2>Информационная панель</h2>
                <Dropdown value={activeFestId} onChange={e => setActiveFestId(e.value)} options={fests?.map(f => ({label: `${moment(f.dateStart, "DD.MM.YYYY").format("YYYY")}/${moment(f.dateEnd, "DD.MM.YYYY").format("YYYY")}`, value: f._id}))}/>
            </div>

            {data ? (
                <div className='grid'>
                    <div className='full'>
                        <div className='head'>
                            <div className='title pre-table'>Принятые заявки</div>
                            <div className='head-table'>
                                <div style={{width: '50%'}}>
                                    <div className='cell-label'><span>в вашем регионе</span></div>
                                    <div className='cell-metric'>{data.neighbourValid}</div>
                                </div>

                                <div style={{width: '50%'}}>
                                    <div className='cell-label'><span>в России</span></div>
                                    <div className='cell-metric'>{data.totalValid}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className='head' style={{borderBottom: '1px solid #DFE7EF'}}>
                            <div className='title pre-table'>
                                Участники
                            </div>
                            <div className='head-table'>
                                <div style={{width: '50%'}}>
                                    <div className='cell-label'><span>в вашем регионе</span></div>
                                </div>

                                <div style={{width: '50%'}}>
                                    <div className='cell-label'><span>в России</span></div>
                                </div>
                            </div>
                        </div>
                        <div className='body self-padded tabled'>
                            {data.nominations?.map((n, index) => (
                                <div className='value-row' key={index}>
                                    <div className='region'>{n.name}</div>
                                    <div className='cells'>
                                        <div style={{width: '50%'}} className='value'>{n.neighbourValid}</div>
                                        <div style={{width: '50%'}} className='value'>{n.totalValid}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className='head' style={{borderBottom: '1px solid #DFE7EF'}}>
                            <div className='title pre-table'>
                                Проведено мероприятий
                            </div>
                            <div className='head-table'>
                                <div style={{width: '50%'}}>
                                    <div className='cell-label'><span>в вашем регионе</span></div>
                                </div>

                                <div style={{width: '50%'}}>
                                    <div className='cell-label'><span>в России</span></div>
                                </div>
                            </div>
                        </div>
                        <div className='body self-padded tabled'>
                            {data.nominations?.map((n, index) => (
                                <div className='value-row' key={index}>
                                    <div className='region'>{n.name}</div>
                                    <div className='cells'>
                                        <div style={{width: '50%'}} className='value'>{n.neighbourActivities}</div>
                                        <div style={{width: '50%'}} className='value'>{n.totalActivities}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className='progress-wrap'>
                    <div>Данные загружаются...</div>
                    <ProgressBar mode="indeterminate" style={{height: '6px'}}/>
                </div>
            )}
        </div>
    )
}))

export default PublicUserDashboard
