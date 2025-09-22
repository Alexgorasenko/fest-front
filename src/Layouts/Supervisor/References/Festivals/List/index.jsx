import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from "axios";
import {ENDPOINT} from "../../../../../env.js";

import { Tooltip } from "primereact/tooltip";
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

import SvrContext from '../../../ctx'
import { getFestivals, addFestivals, getNominations, getActivities, saveNominations, editFestivals, addActivities } from '../../../service'
import moment from 'moment'
moment.locale('ru')

import './style.scss'

const Festivals = () => {
    const navigator = useNavigate()
    const { space, setSpace, token } = useContext(SvrContext)
    const list = space && space.festivals && space.festivals.length ? space.festivals : null

    useEffect(() => {
        getFestivals(token).then(resp => {
            if (resp && resp.success) {
                setSpace(prev => ({ ...prev, festivals: resp.data }))
            } else {
                setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка получения данных' } }))
            }
        })
    }, [token])

    const handleClick = (item, idx) => {
        setSpace(prev => ({ ...prev, path: [{ key: 'festivals', label: 'Фестивали', url: '/festivals' }, { key: 'main', label: item, idx }], selectedFestivalIdx: idx }))
        navigator('/festivals/main')
    }

    const handleCreate = (copied) => {
        console.log('copied', copied);
        const copiedFields = ['logo', 'title', 'titleGenetive', 'titleShort', 'descriptionForQuery', 'minCountFinishedReports']
        let objCopied = {}
        copiedFields.forEach(c => objCopied[c] = copied[c])
        let obj = {
            ...createFestival,
            copied: {...objCopied},
            func: (state) => {
                addFestivals({ ...state, active: false }, token).then(async resp => {
                    if (resp && resp.success) {

                        if (copied && copied._id) {
                            const addedFest = resp.data
                            const editObj = { commonCountingSettings: copied.commonCountingSettings, extraPointsFinishedVideo: copied.extraPointsFinishedVideo }

                            await editFestivals(editObj, addedFest._id, token, true)

                            await getActivities(copied._id, token).then(resp => {
                                if (resp && resp.success) {
                                    Promise.all(resp.data.map(async (event) => {
                                        const eventObj = event
                                        eventObj.festivalId = addedFest._id,
                                        await addActivities(eventObj, token)
                                    }))
                                }
                            })

                            await getNominations(copied._id, token).then(async (resp) => {
                                if (resp && resp.success) {
                                    const arr = resp.data.map(i => {
                                        const obj = Object.assign(JSON.parse(model), i)
                                        obj.title = i.name
                                        obj.preschool = i.levels.reduce((acc, row) => {
                                            if (row.name === "Дошкольники") acc.push(row)
                                            return acc
                                        }, [])
                                        obj.general = i.levels.reduce((acc, row) => {
                                            if (row.name !== "Дошкольники") {
                                                const o = Object.assign({}, row)
                                                const split = row.name.split('-')
                                                o.from = split[0]
                                                o.to = split[1].replace(/\D/gmi, '')
                                                acc.push(o)
                                            }
                                            return acc
                                        }, [])

                                        return obj
                                    });
                                    await saveNominationsHandler(addedFest, arr)
                                } else {
                                    setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка получения данных' } }))
                                }
                            })
                        }

                        if (state.certificateFile && state.certificateFile.objectURL) {
                            const formData = new FormData();
                            const originalFile = state.certificateFile;
                            const originalFileName = originalFile.name;

                            formData.append('file', originalFile)
                            formData.append('patchField', "certificateFileId")
                            formData.append('sampleType', "festivals")
                            formData.append('sampleId', resp.data._id)
                            formData.append('filename', originalFileName)

                            await axios.post(`${ENDPOINT}svr/upload_doc`, formData, {
                                headers: {
                                    Authorization: localStorage.getItem('_amateum_svr')
                                }
                            })
                        }

                        await getFestivals(token).then(resp => {
                            if (resp && resp.success) {
                                setSpace(prev => ({ ...prev, festivals: resp.data }))
                            } else {
                                setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка получения данных' } }))
                            }
                        })

                        setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: 'Фестиваль успешно создан' } }))
                    } else {
                        setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка добавления фестиваля' } }))
                    }
                })
            }
        } // пока активность жестко выключена

        setSpace(prev => ({ ...prev, modal: obj }))
    }

    const copyHandler = async (e, fest) => {
        e.stopPropagation()
        handleCreate(fest)
        // setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: 'Фестиваль скопирован' } }))
    }

    const saveNominationsHandler = async (fest, items) => {
        const body = items && items.length ? items.map(i => {
            const str = JSON.stringify(i)
            const obj = JSON.parse(str)
            obj.general.forEach((g, gIdx) => {
                g.name = `${i.general[gIdx].from}-${i.general[gIdx].to} класс`
                g.description = `школьники ${i.general[gIdx].from}-${i.general[gIdx].to} класс`
                delete g.from
                delete g.to
            })
            obj.levels = i.preschool.concat(obj.general)
            obj.levels.forEach(lv => {
                delete lv.__v
                delete lv._id
            })
            obj.festivalId = fest._id
            obj.name = i.title
            delete obj.general
            delete obj.preschool
            delete obj.title
            delete obj.__v
            delete obj._id

            return obj
        }) : [{ festivalId: fest._id, deleteAll: true }]

        await saveNominations(body, token).then(async resp => {
            // if (resp && resp.success) {
            //     await getFestivals(token).then(resp => {
            //         if (resp && resp.success) {
            //             setSpace(prev => ({ ...prev, festivals: resp.data }))
            //         } else {
            //             setSpace(prev => ({
            //                 ...prev,
            //                 toast: { severity: 'error', summary: '', detail: 'Ошибка получения данных' }
            //             }))
            //         }
            //     })
            // } 
        })
    }

    return (
        <div className='festivals-list'>
            <div className='festivals-list__head'>
                <span className='festivals-list__title'>Фестивали</span>
                <Button className='festivals-list__btn-add' icon='pi pi-plus-circle' onClick={handleCreate}>Добавить фестиваль</Button>
            </div>

            <Card className='festivals-list__list'>
                {list && list.map((i, idx) => {
                    const dateStart = moment(i.dateStart, 'DD.MM.YYYY').format('MMM YYYY') || ''
                    const dateEnd = moment(i.dateEnd, 'DD.MM.YYYY').format('MMM YYYY') || ''
                    const desc = i.title || ''

                    return (
                        <div key={i._id} className='list-item' onClick={() => handleClick([dateStart, dateEnd].includes('Invalid date') ? 'Даты не определены' : `${dateStart}/${dateEnd}`, idx)}>
                            <div className='list-item__info'>
                                <span className='list-item__dates'>{[dateStart, dateEnd].includes('Invalid date') ? 'Даты не определены' : `${dateStart} / ${dateEnd}`}</span>
                                <span className='list-item__description' title={desc}>{desc}</span>
                            </div>
                            <div className='list-item__status'>
                                <Tooltip target={`.pi-copy.tip-${idx}`} position={"top"}>Будут копированы данные данного фестиваля</Tooltip>
                                <i onClick={(e) => copyHandler(e, i)} className={`pi pi-copy tip-${idx}`} />
                                <Tag {...statuses[defineStatus(i)]} />
                                <i className='pi pi-angle-right' />
                            </div>
                        </div>
                    )
                })}
            </Card>
        </div>
    )
}

const defineStatus = fest => {
    const { dateStart, dateEnd, dateQueriesStart } = fest
    switch (true) {
        case !dateStart || !dateEnd:
            return 'prepare'
        case moment().format('YYYYMMDD') > moment(dateEnd, 'DD.MM.YYYY').format('YYYYMMDD'):
            return 'ended'
        case moment() >= moment(dateStart, 'DD.MM.YYYY'):
            return !dateQueriesStart || moment() < moment(dateQueriesStart, 'DD.MM.YYYY') ? 'prepare' : 'active'
        default:
            return 'prepare'
    }
}

const statuses = {
    prepare: { severity: 'info', value: 'В подготовке' },
    active: { severity: 'success', value: 'Действующий' },
    ended: { severity: 'danger', value: 'Завершенный' },
}

const createFestival = {
    title: 'Добавить фестиваль',
    inputs: [
        { title: 'Логотип фестиваля*', type: 'logo', val: '', id: 'logo', isRequired: true, fill: true },
        { title: 'Полное название фестиваля*', type: 'input', val: '', id: 'title', isRequired: true, fill: false },
        { title: 'Заголовок формы подведения итогов*', type: 'input', val: '', id: 'titleGenetive', isRequired: true, fill: false },
        { title: 'Сокращенное название фестиваля* ', type: 'input', val: '', id: 'titleShort', isRequired: true, fill: false },
        { title: 'Заголовок заявки на участие* ', type: 'input', val: '', id: 'descriptionForQuery', isRequired: true, fill: false },
        { title: 'Минимальное кол-во проведенных мероприятий* ', type: 'input', val: '', id: 'minCountFinishedReports', isRequired: true, fill: false, keyfilter: 'int' },
        { title: 'Начало фестиваля*', type: 'calendar', val: '', id: 'dateStart', isRequired: true, fill: false },
        { title: 'Окончание фестиваля*', type: 'calendar', val: '', id: 'dateEnd', isRequired: true, fill: false },
        { title: 'Начало заявочной кампании*', type: 'calendar', val: '', id: 'dateQueriesStart', isRequired: true, fill: false },
        { title: 'Окончание заявочной кампании*', type: 'calendar', val: '', id: 'dateQueriesEnd', isRequired: true, fill: false },
        { title: 'Начало внесения отчётов*', type: 'calendar', val: '', id: 'dateReportStart', isRequired: true, fill: false },
        { title: 'Окончание внесения отчётов*', type: 'calendar', val: '', id: 'dateReportEnd', isRequired: true, fill: false },
        { title: 'Начало подведение итогов*', type: 'calendar', val: '', id: 'dateSummingStart', isRequired: true, fill: false },
        { title: 'Окончание подведение итогов*', type: 'calendar', val: '', id: 'dateSummingEnd', isRequired: true, fill: false },
        { title: 'Минимальное кол-во мероприятий для получения сертификата участника*', type: 'input', val: '', id: 'minCountReportsForGetCert', isRequired: true, keyfilter: 'int', fill: true },
        { title: 'Описание мероприятия (не более 350 символов)', type: 'textarea', val: '', id: 'description', isRequired: false, fill: true, placeholder: 'Опишите подробнее', maxLength: 350 },
        { title: 'Сертификат участника', type: 'file', val: '', id: 'certificateFile', isRequired: false, fill: true }
    ],
    // func: (state) => addFestivals({...state, active: false}, token) // пока активность жестко выключена
}

const model = JSON.stringify({
    title: '',
    // minEvt: 0,
    preschool: [],
    general: [],
    countStudents: []
})

export default Festivals
