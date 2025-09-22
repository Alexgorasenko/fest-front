import React, { useContext, useState, useRef, useEffect } from 'react'

import {regionsList} from "../../../service.js";

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { addLocale, locale } from 'primereact/api';
import {Dropdown} from "primereact/dropdown";
import {Password} from "primereact/password";
import {AutoComplete} from "primereact/autocomplete";

import SvrContext from '../../../ctx'
import moment from 'moment'

import './style.scss'

const Modal = () => {
    const fileUploadRef = useRef(null);
    const { space, setSpace, token } = useContext(SvrContext)
    const modal = space && space.modal ? space.modal : false
    const title = modal ? modal.title : ''
    const inputs = modal ? modal.inputs : []
// console.log('MODAL space', space);
    const [state, setState] = useState({})
    const [invalid, setInvalid] = useState({})

    const [regions, setRegions] = useState([])
    const [filtered, setFiltered] = useState([])

    useEffect(() => {
        if(token && window.location.pathname === '/users-and-roles') {
            regionsList()
                .then(list => {
                    setRegions(list)
                })
        }
    }, [token])

    const searchRegions = evt => {
        setFiltered(regions.filter(r => r.label.toLowerCase().includes(evt.query.toLowerCase())))
    }

    useEffect(() => {
        if (!modal) {
            setState({})
            setInvalid({})
        }
    }, [modal])

    useEffect(() => {
        if (!Object.keys(state).length && inputs && inputs.length) {
            const obj = {}
            inputs.forEach(i => { obj[i.id] = modal.copied && modal.copied[i.id] ? modal.copied[i.id] : i.val})
            setState(obj)
        }
    }, [inputs])

    const handleCreate = () => {
        let inv = {}
        inputs.forEach(i => {
            if ((i.isRequired && (!state[i.id] || state[i.id] === 'Invalid date')) || (i.id === 'canView' && state['type'] === 'region_admin' && !state[i.id])) inv[i.id] = true
        })
        if (Object.keys(inv).length) {
            setInvalid(inv)
        } else {
            space.modal.func(state)
            setSpace(prev => ({ ...prev, modal: false }))
        }
    }

    const handleChangeInput = (id, val) => {
        const updateValue = () => {
            setInvalid(prev => ({ ...prev, [id]: false }))
            setState(prev => ({ ...prev, [id]: val }))
        }

        const needRangeValidation = ['dateStart', 'dateEnd']
        if(needRangeValidation.includes(id)) {
            const valid = rangeValidation(id, val, space.festivals, space.selectedFestivalIdx)
            if(valid.error) {
                setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: valid.summary, detail: valid.detail } }))
                return
            } else {
                updateValue()
            }
        } else {
            updateValue()
        }
    }

    const onSelect = async (id, e) => {
        if (e && e.files && e.files[0]) {
            handleChangeInput(id, e.files[0])
        } else {
            setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Максимальный размер файла 5 МБ' } }))
        }

        fileUploadRef.current.clear()
    }

    const handleDownloadFile = async (file) => {
        try {
            const response = await fetch(file.fullpath || file.objectURL, { mode: "cors" });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = file.filename || file.name;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Ошибка скачивания:", err);
        }
    };

    const createNode = (item, idx) => {
        let elem = null

        switch (item.type) {
            case 'input':
                elem = (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <label htmlFor={item.id}>{item.title}</label>
                        <InputText value={state[item.id]} onChange={(e) => handleChangeInput(item.id, e.target.value)} className={invalid[item.id] ? 'p-invalid' : ''} placeholder={item.placeholder} keyfilter={item.keyfilter} />
                    </div>

                )
                break;
            case 'calendar':
                elem = (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <label htmlFor={item.id}>{item.title}</label>
                        <Calendar key={item.id} value={state[item.id] ? moment(state[item.id], 'DD.MM.YYYY').toDate() : ''} onChange={(e) => handleChangeInput(item.id, moment(e.value).format('DD.MM.YYYY'))} placeholder={item.placeholder} className={invalid[item.id] ? 'p-invalid' : ''} dateFormat="dd.mm.yy" />
                    </div>

                )
                break;
            case 'textarea':
                elem = (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <label htmlFor={item.id}>{item.title}</label>
                        <InputTextarea key={item.id} value={state[item.id]} onChange={e => setState(prev => ({ ...prev, [item.id]: e.target.value }))} maxLength={item.maxLength} autoResize placeholder={item.placeholder} className={invalid[item.id] ? 'p-invalid' : ''} />
                    </div>
                )
                break;
            case 'dropdown':
                elem = (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <label htmlFor={item.id}>{item.title}</label>
                        <Dropdown
                            key={item.id}
                            value={state[item.id]}
                            options={item.keys}
                            onChange={e => setState(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder={item.placeholder}
                            className={invalid[item.id] ? 'p-invalid' : ''}
                        />
                    </div>
                )
                break;
            case 'password':
                elem = (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <label htmlFor={item.id}>{item.title}</label>
                        <Password
                            key={item.id}
                            value={state[item.id]}
                            onChange={e => setState(prev => ({ ...prev, [item.id]: e.target.value }))}
                            toggleMask
                            feedback={false}
                            keyfilter={'email'}
                            placeholder={item.placeholder}
                            className={invalid[item.id] ? 'p-invalid' : ''}
                        />
                    </div>
                )
                break;
            case 'autoComplete':
                elem = state['type'] === 'region_admin' ? (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <label htmlFor={item.id}>{item.title}</label>
                        <AutoComplete
                            suggestions={filtered}
                            completeMethod={searchRegions}
                            field='label'
                            multiple
                            value={state[item.id]}
                            onChange={e => setState(prev => ({ ...prev, [item.id]: e.value }))}
                            className={invalid[item.id] ? 'p-invalid' : ''}
                        />
                    </div>
                ) : null
                break;
            case 'logo':
                const imageVal = state[item.id] ? state[item.id].objectURL ? state[item.id].objectURL : state[item.id] : ''
                elem = (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <label htmlFor={item.id}>{item.title}</label>
                        <div className={`festivals-modal__file-container ${invalid[item.id] ? 'festivals-modal__file-container_invalid-file' : ''}`}>
                            {imageVal ? (
                                <div className='festivals-modal__file-preview'>
                                    <img src={imageVal} />
                                    <Button icon="pi pi-trash" severity="danger" onClick={() => {setState(prev => ({ ...prev, [item.id]: false }))}} />
                                </div>
                            ) : (
                                <FileUpload
                                    ref={fileUploadRef}
                                    mode='basic'
                                    accept='.jpeg, .jpg, .png'
                                    maxFileSize={5000000}
                                    onSelect={(e) => onSelect(item.id, e)}
                                    uploadHandler={e => e.options.clear()}
                                    chooseOptions={{ label: ' ', icon: 'pi pi-fw pi-plus' }}
                                    invalidFileSizeMessageSummary={''}
                                    invalidFileSizeMessageDetail='Максимальный размер файла 5 МБ'
                                    className='festivals-modal__file-upload'
                                />
                            )}

                            <div className='festivals-modal__file-info'>
                                <ul>
                                    <li>Белый</li>
                                    <li>Формат: jpeg, .jpg, .png</li>
                                    <li>Не более 5 Мб</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                )
                break;

            case "file":
                elem = (
                    <div key={item.id} className={`festivals-modal__input ${item.fill ? 'festivals-modal__input_fill' : ""}`}>
                        <div className="festivals-detail-events-detail__doc">
                            <div className="festivals-detail-events-detail__doc-title">
                                <span>{item.title}</span>
                                <span>В формате DOC, DOCX, PDF</span>
                            </div>
                            <div className="festivals-detail-events-detail__doc-file">
                                {state[item.id] && <span className="festivals-detail-events-detail__doc-file-title">{state[item.id].filename || state[item.id].name}</span>}

                                <div className="festivals-detail-events-detail__doc-btns">
                                    {state[item.id] && <Button icon="pi pi-download" onClick={() => handleDownloadFile(state[item.id])} className="festivals-detail-events-detail__doc-download"/>}
                                    <FileUpload
                                        ref={fileUploadRef}
                                        mode="basic"
                                        customUpload
                                        onSelect={(e) => onSelect(item.id, e)}
                                        accept=".doc, .docx, .pdf"
                                        chooseOptions={{ label: ' ', icon: 'pi pi-upload' }}
                                        className='festivals-detail-events-detail__doc-upload'
                                        chooseLabel='Загрузить файл'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
                break;

            default:
                break;
        }

        return elem
    }

    return (
        <Dialog className='festivals-modal' header={title} visible={modal} onHide={() => setSpace(prev => ({ ...prev, modal: false }))}>
            <div className='festivals-modal__list'>{inputs.map(createNode)}</div>
            <Button className='festivals-modal__cta-btn' label='Сохранить' onClick={handleCreate} disabled={false} icon='pi pi-check' />
        </Dialog>
    )
}

const rangeValidation = (id, val, fests=[], festIdx) => {
    const value = moment(val, 'DD.MM.YYYY').unix()
    const restFests = fests.filter((f, i) => i !== festIdx).map(({ dateStart, dateEnd }) => ({ dateStart, dateEnd })).filter(f => f.dateStart && f.dateEnd && ![f.dateStart, f.dateEnd].includes('Invalid date'))
    const crossing = restFests.find(f => moment(f.dateStart, 'DD.MM.YYYY').unix() <= value && moment(f.dateEnd, 'DD.MM.YYYY').unix() >= value)
    if(crossing) {
        return {error: true, summary: `Невозможно установить дату ${val}`, detail: `Другой фестиваль уже назначен на период ${crossing.dateStart} - ${crossing.dateEnd}`}
    } else {
        return {valid: true}
    }
}

addLocale('ru', {
    firstDayOfWeek: 1,
    dayNames: [
        'Воскресенье',
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Субота',
    ],
    dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    monthNames: [
        'январь',
        'февраль',
        'март',
        'апрель',
        'май',
        'июнь',
        'июль',
        'август',
        'сентябрь',
        'октябрь',
        ' ноябрь',
        'декабрь',
    ],
    monthNamesShort: [
        'Янв',
        'Фев',
        'Мар',
        'Апр',
        'Май',
        'Июн',
        'Июл',
        'Авг',
        'Сен',
        'Окт',
        'Ноя',
        'Дек',
    ],
    today: 'Сегодня',
    clear: 'Очистить',
});

locale('ru');

export default Modal
