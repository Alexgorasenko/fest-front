import { useEffect, useState, useContext } from 'react'

import {inject, observer} from "mobx-react";
import { computed } from "mobx"

import { ENDPOINT } from '../../env'
import moment from "moment";
import axios from 'axios'

import { ProgressBar } from 'primereact/progressbar'
import {InputText} from "primereact/inputtext";
import {Dropdown} from "primereact/dropdown";

import DashboardTable from "./Table/index.jsx";

import './style.scss'

const Dasboard = inject('mainStore')(observer(({ mainStore, token }) => {
    const [data, setData] = useState(null)
    const [fests, setFests] = useState([])
    const [activeFestId, setActiveFestId] = useState(false)
    const [filteredData, setFilteredData] = useState(null)
    const [qIndexes, setQIndexes] = useState(null)
    const [acceptedQueries, setAcceptedQueries] = useState(null)
    const [sortedName, setSortedName] = useState('')
    const [searchString, setSearchString] = useState('')
    const [emptyData, setEmptyData] = useState(false)

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
        setEmptyData(false)

        if (activeFestId) {
            axios.get(`${ENDPOINT}dashboards/main/${activeFestId}`, {
                headers: {
                    authorization: token
                }
            }).then(resp => {
                if (resp.data.queries?.totalAccepted || resp.data.queries?.activities) {
                    setQIndexes(Object.keys(resp.data.queries?.byNomination).reduce((acc, k, i) => {
                        acc[k] = i
                        return acc
                    }, {}))
                    setAcceptedQueries(resp.data?.queries?.regions?.filter(r => r.acceptedQueries))
                    setData(resp.data)
                    setFilteredData(resp.data)
                    return
                }

                setEmptyData(true)
                setData(false)
            }).catch(e => {
                const error = e.response.data
                mainStore.showToast({ severity: "error", life: 2000, summary: error.message })
                setEmptyData(true)
                setData(false)
            })
        }
    }, [activeFestId]);

    useEffect(() => {
        if (sortedName) {
            const newData = [
                ...acceptedQueries.sort(
                    (a,b) => (a.byNomination?.[sortedName] || 0) < (b.byNomination?.[sortedName] || 0) ? 1 : -1
                )
            ]
            setAcceptedQueries(newData)
        } else {
            if (acceptedQueries) {
                const newData = [
                    ...acceptedQueries.sort(
                        (a,b) => (a.acceptedQueries || 0) < (b.acceptedQueries || 0) ? 1 : -1
                    )
                ]
                setAcceptedQueries(newData)
            } else {
                setAcceptedQueries(data?.queries?.regions?.filter(r => r.acceptedQueries))
            }
        }
    }, [sortedName]);

    useEffect(() => {
        if (searchString?.length > 0 && data){
            const newData = [
                ...data.activities.regions.filter(
                    s => s.region?.toUpperCase().includes(searchString?.toUpperCase())
                )
            ]
            const newQueries = [
                ...data.queries.regions.filter(
                    s => s.region?.toUpperCase().includes(searchString?.toUpperCase()) && s.acceptedQueries
                )
            ]
            setAcceptedQueries(newQueries)
            setFilteredData(prev => ({...prev, activities: {...prev.activities, regions: newData}}))
            setSortedName('')
        } else {
            setAcceptedQueries(data?.queries?.regions?.filter(r => r.acceptedQueries))
            setFilteredData(data)
            setSortedName('')
        }
    }, [searchString])

    const generalTableColWidth = qIndexes ? 100/(Object.keys(qIndexes).length+1)+'%' : null

    const isRegion = data && data.activities && data.activities.regions && data.activities.regions.length < 10

    return (
        <div className='dashboard'>
            <div className="dashboard__header">
                <h2>Информационная панель</h2>
                <Dropdown value={activeFestId} onChange={e => setActiveFestId(e.value)} options={fests?.map(f => ({label: `${moment(f.dateStart, "DD.MM.YYYY").format("YYYY")}/${moment(f.dateEnd, "DD.MM.YYYY").format("YYYY")}`, value: f._id}))}/>
            </div>

            {emptyData ? (
                <div className="dashboard__empty">Данные отсутствуют</div>
            ) : data ? (
                <div className='grid'>
                    {!isRegion ? (
                        <div className="dashboard__search">
                            <InputText
                                placeholder='Субъект...'
                                value={searchString}
                                onChange={(e) => setSearchString(e.target.value)}
                            />
                        </div>
                    ) : null}

                    <div className='full'>
                        <div className='head'>
                            <div className='title pre-table'>Принятые заявки</div>
                            <div className='head-table'>
                                {Object.entries(filteredData.queries?.byNomination).map((g, i) => (
                                    <div key={i} style={{width: generalTableColWidth, cursor: 'pointer'}} onClick={() => setSortedName(sortedName === g[0] ? '' : g[0])}>
                                        <div className='cell-label'>
                                            <span>{g[0].replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className='cell-metric'>
                                            {getNumber(g[1])} {sortedName === g[0] ?
                                            <i className="pi pi-sort-amount-down --sorted"/> :
                                            <i className="pi pi-sort"/>}
                                        </div>
                                    </div>
                                ))}

                                <div style={{width: generalTableColWidth, cursor: 'pointer'}} onClick={() => setSortedName('')}>
                                    <div className='cell-label'>Всего</div>
                                    <div className='cell-metric'>
                                        {getNumber(filteredData.queries.totalAccepted)} {sortedName === '' ?
                                        <i className="pi pi-sort-amount-down --sorted"/> :
                                        <i className="pi pi-sort"/>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='body tabled'>
                            {acceptedQueries?.map((r, i) => {
                                const cells = new Array(Object.keys(qIndexes).length).fill(null)
                                for (let key in r?.byNomination) {
                                    cells[qIndexes[key]] = r?.byNomination[key]
                                }

                                return <div className='value-row' key={i}>
                                    <div className='region'>{r.region}</div>
                                    <div className='cells'>
                                        {cells.map((c, i) => (
                                            <div style={{width: generalTableColWidth}} className='value'
                                                 key={i}>{c || 0}</div>
                                        ))}
                                        <div style={{width: generalTableColWidth}}
                                             className='value'>{getNumber(r.acceptedQueries)}</div>
                                    </div>
                                </div>
                            })}
                        </div>
                    </div>

                    <div>
                        <div className='head'>
                            <div className='title pre-metric'>Проведено мероприятий</div>
                            <div className='head-metric'>всего {getNumber(filteredData.activities.totalReported)}</div>
                        </div>

                        <div className='body'>
                            {filteredData.activities.regions.filter(r => r.totalActivities).map((r, i) => [
                                <div className='value-row' key={i}>
                                    <div className='label'>{r.region}</div>
                                    <div className='value'>{getNumber(r.totalActivities)}</div>
                                </div>,
                                isRegion && r.byNomination ? Object.entries(r.byNomination).map((nom, i) => (
                                    <div className='value-row _nested' key={i}>
                                        <div className='label'>{nom[0]}</div>
                                        <div className='value'>{getNumber(nom[1])}</div>
                                    </div>
                                )) : null
                            ])}
                        </div>
                    </div>

                    {!isRegion ? <div>
                        <div className='head'>
                            <div className='title pre-common'>Среднее кол-во мероприятий на участника</div>
                            <div className='head-common'>
                                <div className='common-label'>в России</div>
                                <div className='common-value'>{filteredData.activities.averageActivities?.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className='body'>
                            {filteredData.activities.regions.filter(r => r.totalActivities).sort((a, b) => b.averageActivities - a.averageActivities).map((r, i) => (
                                <div className='value-row' key={i}>
                                    <div className='label'>{r.region}</div>
                                    <div className='value'>{r.averageActivities.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div> : null}

                    <div>
                        <div className='head'>
                            <div className='title pre-metric'>Завершило участие</div>
                            <div className='head-metric'>всего {getNumber(filteredData.activities.totalFinishedParticipants)}</div>
                        </div>

                        <div className='body'>
                            {filteredData.activities.regions.sort((a, b) => a.finishedParticipants > b.finishedParticipants ? -1 : 1).map((r, i) => [
                                <div className='value-row' key={i}>
                                    <div className='label'>{r.region}</div>
                                    <div className='value'>{getNumber(r.finishedParticipants)}</div>
                                </div>,
                                isRegion && r.finishedParticipantsByNomination ? Object.entries(r.finishedParticipantsByNomination).map((nom, i) => (
                                    <div className='value-row _nested' key={i}>
                                        <div className='label'>{nom[0]}</div>
                                        <div className='value'>{getNumber(nom[1])}</div>
                                    </div>
                                )) : null
                            ])}
                        </div>
                    </div>

                    {!isRegion ? <div>
                        <div className='head'>
                            <div className='title'>Сколько мероприятий проводили участники в каждой номинации</div>
                        </div>

                        <div className='body self-padded'>
                            {Object.entries(filteredData.activities.reportedRanges).sort((a, b) => Number(a[0].split('_')[0]) - Number(b[0].split('_')[0])).map((r, i) => {
                                const range = r[0].split('_')
                                return <div className='value-row' key={i}>
                                    <div className='label'>от {range[0]} до {range[1]} мероприятий</div>
                                    <div className='value'>{getNumber(r[1])}</div>
                                </div>
                            })}
                        </div>
                    </div> : null}

                    <div>
                        <div className='head'>
                            <div className='title pre-metric'>Участники, которые провели {decodeURIComponent('%3E')}2
                                мероприятий
                            </div>
                            <div
                                className='head-metric'>всего {getNumber(filteredData.activities.confirmedMinActivitiesQty)}</div>
                        </div>

                        <div className='body self-padded'>
                            {Object.entries(filteredData.activities.confirmedMinActivities).map((r, i) => {
                                const nom = r[0].replace(/_/g, ' ')
                                return [
                                    <div className='value-row' key={i}>
                                        <div className='label'>{nom}</div>
                                        <div className='value'>{getNumber(r[1].qty)}</div>
                                    </div>,
                                    isRegion && r[1].byRegion ? Object.entries(r[1].byRegion).map((reg, i) => (
                                        <div className='value-row _nested' key={i}>
                                            <div className='label'>{reg[0]}</div>
                                            <div className='value'>{getNumber(reg[1])}</div>
                                        </div>
                                    )) : null
                                ]
                            })}
                        </div>
                    </div>

                    {!isRegion ? <div>
                        <div className='head'>
                            <div className='title pre-metric'>Сколько детей участвовало</div>
                            <div
                                className='head-metric'>всего {getNumber(filteredData.activities.childrenParticipiedQty)}</div>
                        </div>

                        <div className='body self-padded'>
                            {Object.entries(filteredData.activities.childrenParticipied).map((r, i) => {
                                const nom = r[0].replace(/_/g, ' ')
                                return <div className='value-row' key={i}>
                                    <div className='label'>{nom}</div>
                                    <div className='value'>{getNumber(r[1])}</div>
                                </div>
                            })}
                        </div>
                    </div> : null}

                    <div className='full'>
                        <DashboardTable token={token}/>
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

const getNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : value
}

export default Dasboard
