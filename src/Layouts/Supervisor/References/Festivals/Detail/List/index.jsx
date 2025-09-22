import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from "axios";
import {ENDPOINT} from "../../../../../../env.js";

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { BreadCrumb } from 'primereact/breadcrumb';
import { confirmDialog } from 'primereact/confirmdialog';

import SvrContext from '../../../../ctx'
import { createBreads } from '../../utils'
import { getFestivals, editFestivals } from '../../../../service'

import moment from 'moment'

import './style.scss'

const List = () => {
    const navigator = useNavigate()
    const params = useParams()
    const { space, setSpace, token } = useContext(SvrContext)
    const path = space && space.path ? space.path : null
    const currentPath = path && path[path.length - 1] ? path[path.length - 1] : false
    const currentFestival = space && space.selectedFestivalIdx || 0
    const data = space && space.festivals && currentPath ? space.festivals[currentFestival] : null
    const breads = path && createBreads(params, path)

    const handleClick = item => {
        setSpace(prev => ({ ...prev, path: [...prev.path, item] }))
        navigator(`/festivals/main/${item.key}`)
    }

    const handleDel = () => {
        confirmDialog({
            message: 'Внимание! После удаления фестиваля будут удалены все мероприятия и номинации, созданные в рамках фестиваля. Вы действительно хотите удалить Фестиваль?',
            header: 'Удалить фестиваль?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Удалить',
            rejectLabel: 'Отмена',
            acceptClassName: 'p-button-danger festivals-detail-main__dialog-del',
            rejectClassName: 'festivals-detail-main__dialog-reject',
            accept: deleteFunction,
            reject: () => {}
        });
    }

    const deleteFunction = () => {
        editFestivals({removeFestival: true}, data._id, token).then(resp => {
            if (resp && resp.success) {
                setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: 'Фестиваль успешно удален' }}))
                navigator('/festivals')
            }else {
                setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка удаления фестиваля' } }))
            }
        })
    }

    const handleEdit = () => {
        editFestival.inputs = editFestival.inputs.reduce((acc, row) => {
            if (data[row.id]) acc.push({...row, val: data[row.id]})
            else acc.push(row)
            return acc
        }, [])

        let obj = {...editFestival, func: (state) => {
            editFestivals({...state, active: false}, data._id, token).then(async resp => {// пока активность жестко выключена
                if (resp && resp.success) {
                    setSpace(prev => ({
                        ...prev,
                        toast: {severity: 'success', summary: '', detail: 'Фестиваль успешно изменен'}
                    }))

                    if (state.certificateFile && state.certificateFile.objectURL) {
                        const formData = new FormData();
                        const originalFile = state.certificateFile;
                        const originalFileName = originalFile.name;

                        formData.append('file', originalFile)
                        formData.append('patchField', "certificateFileId")
                        formData.append('sampleType', "festivals")
                        formData.append('sampleId', data._id)
                        formData.append('filename', originalFileName)

                        await axios.post(`${ENDPOINT}svr/upload_doc`, formData, {
                            headers: {
                                Authorization: localStorage.getItem('_amateum_svr')
                            }
                        })
                    }

                    getFestivals(token).then(resp => {
                        if (resp && resp.success) {
                            setSpace(prev => ({ ...prev, festivals: resp.data }))
                        } else {
                            setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка получения данных' } }))
                        }
                    })
                }else {
                    setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка добавления фестиваля' } }))
                }
            })
        } } // пока активность жестко выключена
        setSpace(prev => ({ ...prev, modal: obj }))

        // setSpace(prev => ({ ...prev, modal: editFestival }))
    }

    return data && (
        <div className='festivals-detail-main'>
            <Card className='festivals-detail-main__head'>

                <div className='page-head'>
                    <div className='page-head__info'>
                        {breads && <BreadCrumb className='page-head__breadcrumb' model={breads.items} home={breads.home} />}

                        <div className='page-head__title-container'>
                            <span className='page-head__title'>{`${data.title} ${currentPath.label}`}</span>
                            <Tag {...statuses[defineStatus(data)]} />
                        </div>

                        <span className='page-head__description'>{data.description}</span>
                    </div>

                    <div className='page-head__head-actions'>
                        <Button icon="pi pi-pencil" outlined severity="info" onClick={handleEdit} />
                        {data.deletionIsAllowed ? <Button icon="pi pi-trash" outlined severity="danger" onClick={handleDel} /> : null}
                    </div>
                </div>

                <div className='festivals-detail-main__head-list'>
                    {dates.map((i, idx) => (
                        <Card key={idx} className='head-list-item'>
                            <span className='head-list-item__title'>{i.title}</span>
                            <span className='head-list-item__subtitle'>{`${data[i.start] || 'Н/А'}-${data[i.end] || 'Н/А'}`}</span>
                        </Card>
                    ))}
                </div>
            </Card>

            <Card className='festivals-detail-main__list'>
                {list.map(i => (
                    <div key={i.key} className='list-item' onClick={() => handleClick(i)}>
                        <span className='list-item__title'>{i.label}</span>
                        <i className="pi pi-angle-right" />
                    </div>
                ))}
            </Card>

        </div>
    )
}

let editFestival = {
    title: 'Добавить фестиваль',
    inputs: [
        { title: 'Логотип фестиваля*', type: 'logo', val: '', id: 'logo', isRequired: true, fill: true },
        { title: 'Полное название фестиваля*', type: 'input', val: '', id: 'title', isRequired: true, fill: false },
        { title: 'Заголовок формы подведения итогов*', type: 'input', val: '', id: 'titleGenetive', isRequired: true, fill: false },
        { title: 'Сокращенное название фестиваля* ', type: 'input', val: '', id: 'titleShort', isRequired: true, fill: false },
        { title: 'Заголовок заявки на участие* ', type: 'input', val: '', id: 'descriptionForQuery', isRequired: true, fill: false },
        { title: 'Минимальное кол-во проведенных мероприятий* ', type: 'input', val: '', id: 'minCountFinishedReports', isRequired: true, keyfilter: 'int', fill: true },
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
    // func: getFestivals
}

const dates = [
    { title: 'Сроки проведения фестиваля', start: 'dateStart', end: 'dateEnd' },
    { title: 'Заявочная кампания', start: 'dateQueriesStart', end: 'dateQueriesEnd' },
    { title: 'Внесение отчётов', start: 'dateReportStart', end: 'dateReportEnd' },
    { title: 'Подведение итогов', start: 'dateSummingStart', end: 'dateSummingEnd' },
]

const list = [
    { label: 'Номинации', key: 'nominations' },
    { label: 'Мероприятия', key: 'events' },
    { label: 'Фестивальные баллы', key: 'points' },
]

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


export default List
