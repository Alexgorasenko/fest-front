import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom";

import {inject, observer} from "mobx-react";
import { computed } from "mobx"

import axios from "axios";
import {ENDPOINT} from "../../../env.js";

import {Tooltip} from "primereact/tooltip";

import plus from './img/plus.svg'
import minus from './img/minus.svg'
import valid from './img/vaild.png'
import invalid from './img/invalid.svg'

import './style.scss'

const DashboardTable = inject('mainStore')(observer(({ mainStore, token }) => {
    const [opened, setOpened] = useState({key: null, participants: []})
    const [data, setData] = useState(null)

    useEffect(() => {
        if (!data || data.length === 0) {
            axios.get(`${ENDPOINT}svr/fest_board`, {
                headers: {
                    authorization: token
                }
            }).then(r => {
                const {data} = r
                if (data && data.success) {
                    const newData = data.data
                    newData.byRegs = newData.byRegs.map(d => {
                        d.orgs = d.orgs.sort((a, b) => (a.name?.toUpperCase() || 0) < (b.name?.toUpperCase() || 0) ? -1 : 1)
                        return d
                    }).sort((a, b) => (a.regName?.toUpperCase() || 0) < (b.regName?.toUpperCase() || 0) ? -1 : 1)
                    setData(newData)
                }
            }).catch(e => {
                const error = e.response.data
                mainStore.showToast({ severity: "error", life: 2000, summary: error.message })
            })
        }
    }, []);

    const handleOpen = (key, part) => {
        setOpened(prev => prev.key === key ? {key: null, participants: []} : {key: key, participants: part})
    }

    return !!data && (
        <div className='db-table'>
            <div className='db-table__header'>
                {category.map((c, k) => (
                    <div key={k} className='db-table__col db-table__col_secondary'>
                        <div className={`db-table__text${k === 0 ? ' db-table__text_bold' : ''}`}>{c.label.split(' ').map((l, k) => <div key={k}>{l}<br/></div>)}</div>
                        <div className='db-table__text db-table__text_secondary'>{data[c.key]}</div>
                    </div>
                ))}
            </div>
            <div className='db-table__body'>
                {data.byRegs.map((d, k) => [
                    <div key={k} className='db-table__row'>
                        <img src={opened.key === k ? minus : plus} className='db-table__plus' onClick={() => handleOpen(k, d.orgs)}/>
                        <div className='db-table__col db-table__col_main'>
                            <div key={k} className='db-table__text db-table__text_start'>{d.regName}</div>
                            <div className='db-table__text db-table__text_secondary'>{d[category[0].key]}</div>
                        </div>
                        {category.map((c, i) => i !== 0 && (
                            <div key={i} className='db-table__col db-table__col_cell'>
                                <div className='db-table__text db-table__text_secondary'>{d[c.key]}</div>
                            </div>
                        ))}
                    </div>,

                    opened.key === k && opened.participants.map((p, i) => (
                        <div key={i} className={`db-table__row db-table__row_secondary db-table__row_opened${i === opened.participants.length - 1 ? ' db-table__row_last' : ''}${(i === 0) ? ' db-table__row_first' : ''}`}>
                            <div className='db-table__col db-table__col_main-padding'>
                                <Tooltip target={`.tooltip_${i}`} position="top"/>
                                <div className={`db-table__text db-table__text_start tooltip_${i}`} data-pr-tooltip={p.name}>{p.name}</div>
                                <div className='db-table__text db-table__text_secondary'>ИНН: {p.inn}</div>
                            </div>
                            {category.map((c, index) => index !== 0 && (
                                <div key={index} className='db-table__col db-table__col_cell'>
                                    <div className='db-table__text db-table__text_secondary'>
                                        {!!p[c.fkey] && <img src={valid}/>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ])}
            </div>
        </div>
    )
}))

const category = [
    {label: 'Участники проекта «Футбол в школе»', key: 'countProject', fkey: 'foundInProject'},
    {label: 'Участники Фестиваля «Футбол в школе»', key: 'countActFest', fkey: 'foundInActFest'},
    {label: 'Участники прошлого конкурса «Магнит футбола»', key: 'countPrevMagnit', fkey: 'foundPrevMagnit'},
    {label: 'Участники текущего конкурса «Магнит футбола»', key: 'countActMagnit', fkey: 'foundActMagnit'},
]

export default DashboardTable