import React, {useEffect, useState} from 'react'

import axios from "axios";
import {ENDPOINT} from "../../../env.js";
import moment from "moment";

import {Calendar} from "primereact/calendar";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Paginator} from "primereact/paginator";
import {Tooltip} from "primereact/tooltip";

import './style.scss'

const Logging = ({ token }) => {
    const [serverData, setServerData] = useState([])
    const [data, setData] = useState(null)
    const [dateRange, setDateRange] = useState([moment().add(-1, 'month').toDate(), moment().toDate()])
    const [action, setAction] = useState('')
    const [loading, setLoading] = useState(false)
    const [searchString, setSearchString] = useState('')
    const [searchString2, setSearchString2] = useState('')
    const [first, setFirst] = useState(0)
    const [rows, setRows] = useState([])

    useEffect(() => {
        getData()
    }, [action]);

    useEffect(() => {
        if (searchString?.length > 0 || searchString2?.length > 0){
            const newData = [...serverData]
                .filter(s =>
                    (searchString ? s.author?.toUpperCase().includes(searchString?.toUpperCase()) : true)
                    && (searchString2 ? (s.action?.toUpperCase().includes(searchString2?.toUpperCase()) || s.patch.find(p => p.key?.toUpperCase().includes(searchString2?.toUpperCase())) || s.patch.find(p => patchTranslate[p.key]?.toUpperCase().includes(searchString2?.toUpperCase()))) : true))
            setData(newData)
            setFirst(0)
            setRows(newData.slice(0, 10))
        } else {
            setFirst(0)
            setData([...serverData])
            setRows([...serverData].slice(0, 10))
        }
    }, [searchString, searchString2]);

    const getData = () => {
        if (dateRange[0]) {
            const dateStart = moment(dateRange[0]).format('YYYY-MM-DD')
            const dateEnd = dateRange[1] ? moment(dateRange[1]).format('YYYY-MM-DD') : dateStart

            axios.get(`${ENDPOINT}landrefs/logs?dateStart=${dateStart}&dateEnd=${dateEnd}&action=${action}`,{
                headers: {
                    Authorization: token
                }
            }).then(resp => {
                if (resp && resp.data) {
                    const { data, success } = resp.data
                    if (success && data) {
                        setServerData([...data])
                        setData([...data])
                        setFirst(0)
                        setRows([...data].slice(0, 10))
                        setSearchString('')
                    }
                }
            })
        }
    }

    const downloadHandler = () => {
        if (dateRange[0]) {
            setLoading(true)
            const dateStart = moment(dateRange[0]).format('YYYY-MM-DD')
            const dateEnd = dateRange[1] ? moment(dateRange[1]).format('YYYY-MM-DD') : dateStart
            axios.get(`${ENDPOINT}svr/report_logs?dateStart=${dateStart}&dateEnd=${dateEnd}&action=${action}`,{
                responseType: 'arraybuffer',
                headers: {
                    authorization: token,
                    accept: 'application/octet-stream'
                }
            }).then(resp => {
                if (resp && resp.data) {
                    const obj = new Blob([resp.data], {type: 'application/octet-stream'})
                    const link = document.createElement('a')
                    link.href = window.URL.createObjectURL(obj)
                    link.download = `Журнал событий ${dateStart} - ${dateEnd}.xlsx`
                    link.click()
                }
                setLoading(false)
            })
        }
    }

    const onPageChange= (e) => {
        setFirst(e.first)
        setRows(data.slice(e.first, e.first + 10))
    }

    return (
        <div className='logging apps'>
            <div className='logging__header'>
                <div className='logging__title'>Журнал событий</div>
                <div className='logging__actions'>
                    <Calendar value={dateRange} onChange={(e) => setDateRange(e.value)} selectionMode="range" locale='ru' dateFormat='dd.mm.yy' onHide={getData} showIcon className='logging__calendar'/>
                    <Dropdown value={action} options={actionOptions} onChange={e => setAction(e.value)} optionLabel='label' optionValue='value'/>
                    <Button icon='pi pi-download' label='XLSX' className='logging__download-btn' onClick={downloadHandler} loading={loading} iconPos='right'/>
                </div>
            </div>
            <div className="panel apps-list">
                <div className="list-row list-top">
                    <div className="cell date">
                        <span>Дата</span>
                    </div>
                    <div className="cell secondary">
                        <span>Пользователь</span>
                    </div>
                    <div className="cell mean">
                        <span>Событие </span>
                    </div>
                    <div className="cell mean">
                        <span>Данные события</span>
                    </div>
                </div>
                <div className="list-row search">
                    <div className="cell full">
                        <span className='p-input-icon-right'>
                            <InputText
                                placeholder='Почта пользователя...'
                                value={searchString}
                                onChange={(e) => setSearchString(e.target.value)}
                            />
                        </span>
                    </div>
                    <div className="cell full">
                        <span className='p-input-icon-right'>
                            <InputText
                                placeholder='Событие и данные...'
                                value={searchString2}
                                onChange={(e) => setSearchString2(e.target.value)}
                            />
                        </span>
                    </div>
                </div>

                {!!rows && !!rows.length && rows.map((r, k) => (
                    <div className='list-row item' key={k}>
                        <div className='cell date'>
                            <span>{moment(r.createdAt, 'YYYY-MM-DD HH:mm').format('DD.MM.YY')} </span>
                            <i className='time'>{moment(r.createdAt, 'YYYY-MM-DD HH:mm').format('HH:mm')}</i>
                        </div>

                        <div className='cell secondary'>
                            <span>{r.author || 'Нет данных'}</span>
                            <i className='time'>{r.authorCollection || 'Нет данных'}</i>
                        </div>

                        <div className='cell mean'>
                        <span>{r.action || '-'}</span>
                        </div>

                        {!!(r.patch && r.patch.length) && (
                            <Tooltip target={`.tooltip_${k}`} position="top" autoHide={false} event="focus">
                                <div className='patch-table'>
                                    {r.patch.map((p, i) => (
                                        <div key={i} className='patch-table__row'>
                                            <div className='patch-table__key'>{patchTranslate[p.key] || p.key}:</div>
                                            <div className='patch-table__value'>{p.value || '-'}</div>
                                        </div>
                                    ))}
                                </div>
                            </Tooltip>
                        )}
                        <Button className={`cell mean tooltip_${k} logging__events`}>
                            <span>{r.patch && r.patch.length ? mappingPatch(r.patch) : '-'}</span>
                        </Button>
                    </div>
                ))}
            </div>

            {!!data && data.length > 10 && <Paginator first={first} rows={10} totalRecords={data.length} onPageChange={onPageChange}/>}
        </div>
    )
}

const mappingPatch = (patch) => {
    const newPatch = [...patch].slice(0, 3)
    const moreCount = patch.length - newPatch.length
    return `Изменены поля:${newPatch.map(p => ` ${patchTranslate[p.key] || p.key }`)}${moreCount ? ` ... еще ${moreCount}.` : ''}`
}

const actionOptions = [
    {label: 'Все события', value: ''},
    {label: 'Создание', value: 'post'},
    {label: 'Изменение', value: 'put'},
    {label: 'Удаление', value: 'delete'}
]

const patchTranslate = {
    queries: 'заявки',
    status: 'статус',
    organizationQueryData: 'данные организации',
    contactPerson: 'ответсвенное лицо',
    director: 'руководитель',
    publicusers: 'пользователи',
    activities: 'мероприятия',
    supervisors: 'суперпользователи',
    festivals: 'фестивали',
    title: 'название',
    description: 'описание',
    descriptionForQuery: 'заголовок формы заявки',
    dateStart: 'дата начала',
    dateEnd: 'дата окончания',
    dateQueriesStart: 'дата начала приема заявок',
    dateQueriesEnd: 'дата окончания приема заявок',
    dateReportStart: 'дата старта подачи отчета',
    dateReportEnd: 'дата завершения подачи отчета',
    dateSummingStart: 'дата начала подведения итогов',
    dateSummingEnd: 'дата завершения подведения итогов',
    educationlevels: 'уровни образования',
    nominations: 'номинации',

    name: 'сокращенное название',
    fullName: 'полное название',
    inn: 'инн',
    kpp: 'кпп',
    ogrn: 'огрн',
    site: 'официальный сайт',
    phone: 'телефон организации',
    email: 'email организации',
    fullname: 'фио',
    post: 'должность',
    // phone:телефон представителя
    // email:почта представителя
    // phone:телефон руководителя
    // email:почта руководителя
    // name:фио,
    // email:почта,
    verified: 'верифицирован',
    blocked: 'заблокирован',
    // name:название мероприятия
    desc: 'описание мероприятия',
    sort: 'сортировка',
    roles: 'роль',
    moderator: 'модератор',
    region_admin: 'региональный куратор',
    rfu_admin: 'администратор РФС',
    // name:названия уровня образования
    // name:название номинации
    // description:описание номинации
    logo: 'логотип',
    titleGenetive: 'заголовок формы подведения итогов',
    titleShort: 'сокращенное название',
    minCountFinishedReports: 'Минимальное кол-во проведенных мероприятий',
    removeFestival: 'удаление фестиваля',
    active: 'активный',
    commonCountingSettings: 'Количество проведенных мероприятий',
    extraPointsFinishedVideo: 'Баллы за количество проведённых мероприятий',
    publicdocs: 'документы',
    userMsg: 'ссылка на ПДн',
    policy: 'Пользовательское соглашение',

    landingfirstpages: 'лэндинг первый экран',
    image: 'изображение',
    // title: 'заголовок',
    buttonName: 'название кнопки',
    buttonLink: 'ссылка по кнопке',
    subtitle: 'подзаголовок',
    menuTitle: 'название меню',
    landingexternallinks: 'лэндинг внешние ссылки',
    pageTitle: 'название блока',
    btnName: 'название кнопки',
    btnLink: 'ссылка по кнопке',
    vk: 'ссылка вк',
    tg: 'ссылка тг',
    ok: 'ссылка ок',
    landingparticipants: 'лэндинг участники',
    charDesc: 'заголовок над персонажем',
    childrenParticipiedQty: 'количество участников мероприятий',
    queriesCount: 'Количество проведенных мероприятий',
    totalReported: 'Количество образовательных организаций',
    landingstages: 'лэндинг этапы',
    // name: 'название этапа',
    // desc: 'описание',
    landingmedias: 'лэндинг медиа',
    landingnews: 'лэндинг новости',
    landingprizes: 'лэндинг призы',
    landinghistories: 'лэндинг история фестиваля',
    landingwinners: 'лэндинг победители',
    landingdocs: 'лэндинг документы',
    landingfeedbacks: 'лэндинг связаться с нами',
    landingpartners: 'лэндинг партнеры и спонсоры',
}

export default Logging