import React, {useContext, useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom';

import {inject, observer} from "mobx-react";
import axios from "axios";
import {ENDPOINT} from "../../../../../../../../env.js";
import moment from "moment";

import {Card} from 'primereact/card';
import {Button} from 'primereact/button';
import {Tree} from 'primereact/tree';
import {BreadCrumb} from 'primereact/breadcrumb';
import {confirmDialog} from 'primereact/confirmdialog';
import {Dropdown} from 'primereact/dropdown';
import {Divider} from 'primereact/divider';
import {Checkbox} from 'primereact/checkbox';
import {InputText} from 'primereact/inputtext';
import {InputTextarea} from 'primereact/inputtextarea';
import {FileUpload} from "primereact/fileupload";

import SvrContext from '../../../../../../ctx'
import {createBreads, editData} from '../../../../utils'
import {editActivities, getActivities, getNominations} from '../../../../../../service'

import './style.scss'

const Detail = inject('mainStore')(observer(({ mainStore }) => {
    const fileUploadRef = useRef(null);
    const navigator = useNavigate()
    const params = useParams()
    const { space, setSpace, token } = useContext(SvrContext)

    const [selectedKeysSex, setSelectedKeysSex] = useState(null);
    const [selectedKeysEducationLevels, setSelectedKeysEducationLevels] = useState(null);
    const [list, setList] = useState([]);
    const [treeDataSex, setTreeDataSex] = useState([]);
    const [treeDataEducationLevels, setTreeDataEducationLevels] = useState([]);
    const [dragData, setDragData] = useState(null)
    const [showInvalid, setShowInvalid] = useState(false)
    const [docs, setDocs] = useState(false)

    const path = space && space.path ? space.path : null
    const data = space && space.event ? space.event : null
    const currentFestival = space && space.selectedFestivalIdx || 0
    const festival = space && space.festivals && space.festivals[currentFestival] ? space.festivals[currentFestival] : false
    const breads = path && createBreads(params, path)

    useEffect(() => {
        if (token && data) getDocs()
    }, [token, data]);

    useEffect(() => {
        if (!list.length && data && data.countingCriterias) {
            const arr = data.countingCriterias.map(i => {
                const model = JSON.parse(dropdown)
                const card = model.find(f => f.state.type == i.type)
                if (card) card.state = i

                return card
            });

            setList(arr)
        }
        if (!selectedKeysSex && !selectedKeysEducationLevels) {
            getNominations(festival._id, token).then(resp => {
                if (resp && resp.data) {
                    const sex = [
                        {
                            key: 'all',
                            label: 'Пол',
                            // expanded: true,
                            children: [{ val: 'men', label: 'Мальчики' }, { val: 'women', label: 'Девочки' }].map((i, idx) => {
                                return {
                                    key: i.val,
                                    label: i.label,
                                }
                            })
                        },
                    ]
                    const educationLevels = resp.data.length ? [
                        {
                            key: 'educationLevels',
                            label: 'Участие принимают номинации',
                            // expanded: true,
                            children: resp.data.map((i, idx) => {
                                return {
                                    key: i._id,
                                    label: i.name,
                                }
                            })
                        }
                    ] : []

                    if (data && data.participants && data.participants.sex && !selectedKeysSex) {
                        const sex = data.participants.sex
                        const obj = {}
                        if (sex == 'all') {
                            obj.all = { checked: true, partialChecked: false }
                            obj.men = { checked: true, partialChecked: false }
                            obj.women = { checked: true, partialChecked: false }
                        } else if (sex == 'men') {
                            obj.all = { checked: false, partialChecked: true }
                            obj.men = { checked: true, partialChecked: false }
                        } else {
                            obj.all = { checked: false, partialChecked: true }
                            obj.women = { checked: true, partialChecked: false }
                        }
                        setSelectedKeysSex(obj)
                    }
                    if (data && data.participants && data.participants.educationLevels && !selectedKeysEducationLevels) {
                        const educationLevels = data.participants.educationLevels
                        const obj = {}
                        const allLevels = resp.data.map(i => i._id)

                        educationLevels.forEach(i => {
                            obj[i] = { checked: true, partialChecked: false }
                        });

                        if (educationLevels.length && (allLevels.length != educationLevels.length)) {
                            obj.educationLevels = { checked: false, partialChecked: true }
                        } else if (allLevels.length && educationLevels.length && (allLevels.length == educationLevels.length)) {
                            obj.educationLevels = { checked: true, partialChecked: false }
                        }

                        setSelectedKeysEducationLevels(obj)
                    }

                    setTreeDataSex(sex)
                    setTreeDataEducationLevels(educationLevels)
                }
            })
        }
    }, [data])

    const getDocs = () => {
        mainStore.getByUrl(token, `refs/activities/${data._id}`, false, false, false, false)
            .then(resp => {
                if (resp && resp.success) {
                    setDocs(resp.data[0])
                }
            })
    }

    const handleDel = () => {
        confirmDialog({
            message: 'После удаления безвозвратно исчезнет вся информация о участниках и критериях оценки',
            header: 'Удалить мероприятие?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Удалить',
            rejectLabel: 'Отмена',
            acceptClassName: 'p-button-danger festivals-detail-main__dialog-del',
            rejectClassName: 'festivals-detail-main__dialog-reject',
            accept: deleteFunction,
            reject: () => { }
        });
    }

    const deleteFunction = () => {
        editActivities(data._id, { removeActivity: true }, token).then(resp => {
            if (resp && resp.success) {
                setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: 'Мероприятие успешно удалено' } }))
                navigator(-1)
            } else {
                setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка удаления фестиваля' } }))
            }
        })
    }

    const handleEdit = () => {
        editEvent.inputs = editEvent.inputs.reduce((acc, row) => {
            if (data[row.id]) acc.push({ ...row, val: data[row.id] })
            else acc.push(row)
            return acc
        }, [])

        let obj = {
            ...editEvent,
            func: (state) => {
                editActivities(data._id, state, token).then(resp => {
                    if (resp && resp.success) {
                        setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: 'Мероприятие успешно изменено' }, event: resp.data }))
                    } else {
                        setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка изменения мероприятия' } }))
                    }
                })
            }
        }

        setSpace(prev => ({ ...prev, modal: obj }))
    }

    const handleChangeInput = (path, val) => {
        const edit = editData(path, list, val)
        setList(edit)
    }

    const handleDelSubItem = (idx, itemIdx) => {
        let arr = Object.assign([], list[idx].state.intervals)
        arr.splice(itemIdx, 1)
        handleChangeInput(`${idx}.state.intervals`, arr)
    }

    const handleAddSubItem = (idx) => {
        let arr = Object.assign([], list[idx].state.intervals)
        arr.push({ min: '', max: '', points: '' })
        handleChangeInput(`${idx}.state.intervals`, arr)
    }

    const handleSave = () => {
        let invalid = false
        let criterias = list.reduce((acc, row) => {
            const str = JSON.stringify(row.state)
            const item = JSON.parse(str)
            if (item.type === 'video' && item.intervals && !item.intervals.length) delete item.intervals //удаляем интервалы в видео если пусто
            if(!item.label) {
                invalid = true
            }
            acc.push(item)
            return acc
        }, [])

        if (invalid){
            setShowInvalid(true)
            setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Заполните описание для всех критериев' } }))
        } else {
            setShowInvalid(false)
            const body = { countingCriterias: criterias }
            const educationLevels = data && data.participants && data.participants.educationLevels ? data.participants.educationLevels : []
            const sex = data && data.participants && data.participants.sex ? data.participants.sex : ''
            const participants = { educationLevels, sex }

            participants.sex = selectedKeysSex ? Object.entries(selectedKeysSex).reduce((acc, row) => {
                const [key, val] = row
                if (key === 'all' && val.checked) acc = 'all'
                if (acc !== 'all') {
                    acc = val.checked ? key : acc
                }

                return acc
            }, '') : sex

            participants.educationLevels = selectedKeysEducationLevels ? Object.entries(selectedKeysEducationLevels).reduce((acc, row) => {
                const [key, val] = row
                if (key !== 'educationLevels' && val.checked) {
                    acc.push(key)
                }

                return acc
            }, []) : educationLevels


            body.participants = participants

            body.activityMaxPoints = criterias.reduce((sum, item) => {
                let candidates = [];

                if (item.maxPoints) {
                    candidates.push(Number(item.maxPoints));
                }

                if (item.intervals?.length) {
                    const lastInterval = item.intervals[item.intervals.length - 1];
                    candidates.push(Number(lastInterval.points));
                }

                if (item.pointsForСompletion) { // ⚠️ здесь "С" кириллическая
                    candidates.push(Number(item.pointsForСompletion));
                }

                if (item.pointsForEvery && item.maxItems) {
                    candidates.push(Number(item.pointsForEvery) * Number(item.maxItems));
                }

                const max = candidates.length ? Math.max(...candidates) : 0;
                return sum + max;
            }, 0);

            editActivities(data._id, body, token).then(resp => {
                if (resp && resp.success) {
                    getActivities(data._id, token)
                    const dateQueriesStart = space?.festivals?.[space?.selectedFestivalIdx]?.dateQueriesStart
                    const isSelectedFestExpired = dateQueriesStart ? moment(dateQueriesStart, "DD.MM.YYYY") <= moment() : false
                    setSpace(prev => ({ ...prev, toast: isSelectedFestExpired ? { severity: 'warn', summary: '', detail: 'Нельзя изменять критерии после начала фестиваля' } : { severity: 'success', summary: '', detail: 'Мероприятие успешно изменено' } }))
                    // navigator(-1)
                } else {
                    setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка изменения мероприятия' } }))
                }
            })
        }
    }

    const handleDelListItem = (idx) => {
        let arr = Object.assign([], list)
        arr.splice(idx, 1)
        setList(arr)
    }

    const handleDrag = (e, data = null, idx = null) => {
        switch (e.type) {
            case 'dragstart':
                let obj = { data, currentIdx: idx }
                setDragData(obj)
                break;
            case 'dragover':
                e.preventDefault()
                e.currentTarget.classList.add('criteria__list-item_drag-over')
                break;
            case 'dragend':
                e.currentTarget.classList.remove('criteria__list-item_drag-over')
                break;
            case 'dragleave':
                e.currentTarget.classList.remove('criteria__list-item_drag-over')
                break;
            case 'drop':
                let arr = Object.assign([], list)
                arr.splice(dragData.currentIdx, 1)
                arr.splice(idx, 0, dragData.data)
                setList(arr)

                e.currentTarget.classList.remove('criteria__list-item_drag-over')
                setDragData(null)
                break;

            default:
                break;
        }
    }

    const createItem = (item, idx) => {
        let node = null

        switch (item.node) {
            case 'simpleInputs':
                node = (
                    <div
                        key={idx}
                        className={`criteria__list-item${showInvalid && !item.state.label ? ' invalid' : ''}`}
                        draggable
                        onDragStart={e => handleDrag(e, item, idx)}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDragEnd={handleDrag}
                        onDrop={(e) => handleDrag(e, null, idx)}
                    >
                        <div className='criteria__drag-ico' />
                        <div className='criteria__container' onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}>
                            <span className='criteria__item-title'>{item.name}</span>
                            <Button className='criteria__del-list-btn' icon='pi pi-trash' outlined severity='danger' onClick={() => handleDelListItem(idx)} />

                            <div className='checkbox-item'>
                                <Checkbox inputId={`checkbox-item${idx}`} onChange={(e) => handleChangeInput(`${idx}.state.mandatory`, !item.state.required)} checked={item.state.mandatory} />
                                <label htmlFor={`checkbox-item${idx}`}>{item.labels.checkbox}</label>
                            </div>

                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.label}</label>
                                <InputText id='input-item' placeholder={item.labels.labelPlaceholder} value={item.state.label} onChange={(e) => handleChangeInput(`${idx}.state.label`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>

                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.mutedLabel}</label>
                                <InputText id='input-item' placeholder={item.labels.mutedLabelPlaceholder} value={item.state.mutedLabel} onChange={(e) => handleChangeInput(`${idx}.state.mutedLabel`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>
                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.reportDescription}</label>
                                <InputText id='input-item' placeholder={item.labels.reportDescriptionPlaceholder} value={item.state.reportDescription} onChange={(e) => handleChangeInput(`${idx}.state.reportDescription`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>

                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.inputLabel}</label>
                                <InputText id='input-item' placeholder={item.labels.inputPlaceholder} value={item.state.maxPoints} keyfilter='int' onChange={(e) => handleChangeInput(`${idx}.state.maxPoints`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>

                            <Divider />
                        </div>
                    </div>
                )
                break;
            case 'points':
                node = (
                    <div
                        key={idx}
                        className={`criteria__list-item${showInvalid && !item.state.label ? ' invalid' : ''}`}
                        draggable
                        onDragStart={e => handleDrag(e, item, idx)}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDragEnd={handleDrag}
                        onDrop={(e) => handleDrag(e, null, idx)}
                    >
                        <div className='criteria__drag-ico' />
                        <div className='criteria__container' onMouseDown={e => { e.stopPropagation(); e.preventDefault() }}>
                            <span className='criteria__item-title'>{item.name}</span>
                            <Button className='criteria__del-list-btn' icon='pi pi-trash' outlined severity='danger' onClick={() => handleDelListItem(idx)} />

                            <div className='checkbox-item'>
                                <Checkbox inputId={`checkbox-item${idx}`} onChange={(e) => handleChangeInput(`${idx}.state.mandatory`, !item.state.mandatory)} checked={item.state.mandatory} />
                                <label htmlFor={`checkbox-item${idx}`}>{item.labels.checkbox}</label>
                            </div>

                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.label}</label>
                                <InputText id='input-item' placeholder={item.labels.labelPlaceholder} value={item.state.label} onChange={(e) => handleChangeInput(`${idx}.state.label`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>

                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.mutedLabel}</label>
                                <InputText id='input-item' placeholder={item.labels.mutedLabelPlaceholder} value={item.state.mutedLabel} onChange={(e) => handleChangeInput(`${idx}.state.mutedLabel`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>
                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.reportDescription}</label>
                                <InputText id='input-item' placeholder={item.labels.reportDescriptionPlaceholder} value={item.state.reportDescription} onChange={(e) => handleChangeInput(`${idx}.state.reportDescription`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>

                            {item.state.intervals.map((lst, lIdx) => (
                                <div key={lIdx} className='points-item'>
                                    {/* <span className='points-item__title'>{idx + 1} уровень кол-во команд</span> */}
                                    <span className='points-item__info'>{lIdx + 1} уровень кол-во команд</span>
                                    <div className='points-item__inputs'>
                                        <span className='points-item__text'>от</span>
                                        <InputText keyfilter='int' value={lst.min} onChange={(e) => handleChangeInput(`${idx}.state.intervals.${lIdx}.min`, e.target.value)} onClick={(e) => e.target.focus()} />
                                        <span className='points-item__text'>до</span>
                                        <InputText keyfilter='int' value={lst.max} onChange={(e) => handleChangeInput(`${idx}.state.intervals.${lIdx}.max`, e.target.value)} onClick={(e) => e.target.focus()} />
                                        <span className='points-item__text'>участников</span>
                                        <span className='points-item__equals'>=</span>
                                        <InputText keyfilter='int' value={lst.points} onChange={(e) => handleChangeInput(`${idx}.state.intervals.${lIdx}.points`, e.target.value)} onClick={(e) => e.target.focus()} />
                                        <span className='points-item__text'>баллов</span>
                                    </div>
                                    <Button icon='pi pi-minus-circle' text severity='danger' onClick={() => handleDelSubItem(idx, lIdx)} />
                                </div>
                            ))}

                            <Button className='criteria__add-level-btn' label='Добавить уровень' onClick={() => handleAddSubItem(idx)} icon='pi pi-plus-circle' iconPos='right' text />
                            <Divider />
                        </div>
                    </div>
                )
                break;
            case 'inputs':
                node = (
                    <div
                        key={idx}
                        className={`criteria__list-item${showInvalid && !item.state.label ? ' invalid' : ''}`}
                        draggable onDragStart={e => handleDrag(e, item, idx)}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDragEnd={handleDrag}
                        onDrop={(e) => handleDrag(e, null, idx)}
                    >
                        <div className='criteria__drag-ico' />
                        <div className='criteria__container' onMouseDown={e => { e.stopPropagation(); e.preventDefault() }}>
                            <span className='criteria__item-title'>{item.name}</span>
                            <Button className='criteria__del-list-btn' icon='pi pi-trash' outlined severity='danger' onClick={() => handleDelListItem(idx)} />

                            <div className='checkbox-item'>
                                <Checkbox inputId={`checkbox-item${idx}`} onChange={(e) => handleChangeInput(`${idx}.state.mandatory`, !item.state.mandatory)} checked={item.state.mandatory} />
                                <label htmlFor={`checkbox-item${idx}`}>{item.labels.checkbox}</label>
                            </div>

                            {item.state.type === 'video' ? (
                                <div className='checkbox-item'>
                                    <Checkbox inputId={`checkbox-item${idx}`} onChange={(e) => handleChangeInput(`${idx}.state.needCheckItemsForVideo`, !item.state.needCheckItemsForVideo)} checked={item.state.needCheckItemsForVideo} />
                                    <label htmlFor={`checkbox-item${idx}`}>{item.labels.needCheckItemsForVideo}</label>
                                </div>
                            ) : null}


                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.label}</label>
                                <InputText id='input-item' placeholder={item.labels.labelPlaceholder} value={item.state.label} onChange={(e) => handleChangeInput(`${idx}.state.label`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>

                            <div className='input-item'>
                                <label htmlFor='input-item'>{item.labels.mutedLabel}</label>
                                <InputText id='input-item' placeholder={item.labels.mutedLabelPlaceholder} value={item.state.mutedLabel} onChange={(e) => handleChangeInput(`${idx}.state.mutedLabel`, e.target.value)} onClick={(e) => e.target.focus()} />
                            </div>
                            <div className='textarea-input'>
                                <label htmlFor='participant-count__textarea'>{item.labels.reportDescription}</label>
                                <InputTextarea id='participant-count__textarea' autoResize value={item.state.reportDescription} onChange={(e) => handleChangeInput(`${idx}.state.reportDescription`, e.target.value)} rows={5} cols={30} placeholder={item.labels.reportDescriptionPlaceholder} onClick={(e) => e.target.focus()} />
                            </div>

                            <div className='criteria__grid'>
                                {(item.state.type === 'site' ? ['pointsForСompletion'] : ['minItems', 'maxItems', 'pointsForEvery', 'pointsForСompletion']).map((grid, gIdx) => (
                                    item.state.type === 'site' || grid !== 'pointsForСompletion' || list && list[idx] && list[idx].state && list[idx].state.maxItems ? (
                                        <div key={gIdx} className='input-item'>
                                            <label htmlFor='input-item'>{item.labels[`${grid}Label`]}</label>
                                            <InputText id='input-item' placeholder={item.labels[`${grid}Placeholder`]} value={item.state[grid]} keyfilter='int' onChange={(e) => handleChangeInput(`${idx}.state.${grid}`, e.target.value)} onClick={(e) => e.target.focus()} />
                                        </div>
                                    ) : null
                                ))}
                            </div>

                            {item.state.type === 'video' && item.state.intervals ? (
                                <>
                                    {item.state.intervals.map((lst, lIdx) => (
                                        <div key={lIdx} className='points-item'>
                                            {/* <span className='points-item__title'>{idx + 1} уровень кол-во команд</span> */}
                                            <span className='points-item__info'>{lIdx + 1} уровень кол-во команд</span>
                                            <div className='points-item__inputs'>
                                                <span className='points-item__text'>от</span>
                                                <InputText keyfilter='int' value={lst.min} onChange={(e) => handleChangeInput(`${idx}.state.intervals.${lIdx}.min`, e.target.value)} onClick={(e) => e.target.focus()} />
                                                <span className='points-item__text'>до</span>
                                                <InputText keyfilter='int' value={lst.max} onChange={(e) => handleChangeInput(`${idx}.state.intervals.${lIdx}.max`, e.target.value)} onClick={(e) => e.target.focus()} />
                                                <span className='points-item__text'>участников</span>
                                                <span className='points-item__equals'>=</span>
                                                <InputText keyfilter='int' value={lst.points} onChange={(e) => handleChangeInput(`${idx}.state.intervals.${lIdx}.points`, e.target.value)} onClick={(e) => e.target.focus()} />
                                                <span className='points-item__text'>баллов</span>
                                            </div>
                                            <Button icon='pi pi-minus-circle' text severity='danger' onClick={() => handleDelSubItem(idx, lIdx)} />
                                        </div>
                                    ))}
                                    <Button className='criteria__add-level-btn' label='Добавить уровень' onClick={() => handleAddSubItem(idx)} icon='pi pi-plus-circle' iconPos='right' text />
                                </>
                            ) : null}
                            <Divider />
                        </div>
                    </div>
                )
                break;
            default:
                break;
        }

        return node
    }

    const uploadHandler = async (event, key) => {
        if (event.files[0]) {
            const formData = new FormData();
            const originalFile = event.files[0];
            const originalFileName = originalFile.name;

            formData.append('file', originalFile)
            formData.append('patchField', `${key}Id`)
            formData.append('sampleType', "activities")
            formData.append('sampleId', data._id)
            formData.append('filename', originalFileName)

            const resp = await axios.post(`${ENDPOINT}svr/upload_doc`, formData, {
                headers: {
                    Authorization: localStorage.getItem('_amateum_svr')
                }
            })

            if (resp && resp.data && resp.data.success) getDocs()
        }

        fileUploadRef.current.clear()
        event.options.clear()
    }

    return data && (
        <div className='festivals-detail-events-detail'>
            <Card className='festivals-detail-events-detail__head'>
                <div className='page-head'>
                    <div className='page-head__info'>
                        {breads && <BreadCrumb className='page-head__breadcrumb' model={breads.items} home={breads.home} />}
                        <div className='page-head__title-container'>
                            <span className='page-head__title'>{`${data.name}`}</span>
                        </div>
                        {/*<span className='page-head__description'>{data.desc}</span>*/}
                    </div>
                    <div className='page-head__head-actions'>
                        <Button icon='pi pi-pencil' outlined severity='info' onClick={handleEdit} />
                        {data.deletionIsAllowed ? <Button icon='pi pi-trash' outlined severity='danger' onClick={handleDel} /> : null}
                    </div>
                </div>
            </Card>

            <Card title='Параметры мероприятия' className='festivals-detail-events-detail__params params'>
                <Tree value={treeDataSex} selectionMode='checkbox' selectionKeys={selectedKeysSex} onSelectionChange={(e) => setSelectedKeysSex(e.value)} />
                {treeDataEducationLevels.length ? <Tree value={treeDataEducationLevels} selectionMode='checkbox' selectionKeys={selectedKeysEducationLevels} onSelectionChange={(e) => setSelectedKeysEducationLevels(e.value)} /> : null}
            </Card>

            <Card title='Документы' className='festivals-detail-events-detail__params params'>
                <div className="festivals-detail-events-detail__docs">
                    {docsItems.map((d, k) => (
                        <div key={k} className="festivals-detail-events-detail__doc">
                            <div className="festivals-detail-events-detail__doc-title">
                                <span>{d.label}</span>
                                <span>В формате DOC, DOCX, PDF</span>
                            </div>
                            <div className="festivals-detail-events-detail__doc-file">
                                {docs[d.key] && <span className="festivals-detail-events-detail__doc-file-title">{docs[d.key].filename}</span>}

                                <div className="festivals-detail-events-detail__doc-btns">
                                    {docs[d.key] && <Button icon="pi pi-download" onClick={() => handleDownloadFile(docs[d.key])} className="festivals-detail-events-detail__doc-download"/>}
                                    <FileUpload
                                        ref={fileUploadRef}
                                        mode="basic"
                                        customUpload
                                        onSelect={e => uploadHandler(e, d.key)}
                                        uploadHandler={removeHandler}
                                        accept=".doc, .docx, .pdf"
                                        chooseOptions={chooseOptions}
                                        className='festivals-detail-events-detail__doc-upload'
                                        chooseLabel='Загрузить файл'
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className='festivals-detail-events-detail__criteria criteria'>
                <div className='criteria__head'>
                    <span className='criteria__title'>Критерии оценки</span>
                    <Dropdown value={null} onChange={(e) => setList(prev => ([...prev, e.value]))} options={JSON.parse(dropdown)} optionLabel='name' placeholder='Добавить критерий'/>
                </div>

                {list.length ? (
                    <div className='criteria__list'>
                        <Divider/>
                        {list.map(createItem)}
                    </div>
                ) : null}
            </Card>

            <Button className='festivals-detail-events-detail__save-btn' label='Сохранить' onClick={handleSave}/>
        </div>
    )
}))

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

const removeHandler = (event) => {
    event.options.clear()
}

const chooseOptions = {label: '', icon: 'pi pi-upload'};

const docsItems = [
    {label: "Инструкция по проведению мероприятия", key: "instructionFile"},
    {label: "Диплом", key: "diplomFile"}
]

const dropdown = JSON.stringify([
    {
        name: 'Количество участников',
        node: 'simpleInputs',
        labels: {
            checkbox: 'Обязательно для заполнения',
            inputLabel: 'Максимальный бал за заполнение',
            inputPlaceholder: 'Укажите балл',

            label: 'Описание критерия подсчета',
            labelPlaceholder: 'Описание',

            mutedLabel: 'Дополнительное описание',
            mutedLabelPlaceholder: 'Описание',

            reportDescription: 'Наименование в отчетной документации',
            reportDescriptionPlaceholder: 'Если требуется указать дополнительную информацию',
        },
        state: { mandatory: true, maxPoints: '', label: '', mutedLabel: '', reportDescription: '', type: 'countStudents', }
    },
    {
        name: 'Количество посещённых игр',
        node: 'points',
        labels: {
            checkbox: 'Обязательно для заполнения',
            inputLabel: 'Максимальный бал за заполнение',
            inputPlaceholder: 'Укажите балл',

            label: 'Описание критерия подсчета',
            labelPlaceholder: 'Описание',

            mutedLabel: 'Дополнительное описание',
            mutedLabelPlaceholder: 'Описание',

            reportDescription: 'Наименование в отчетной документации',
            reportDescriptionPlaceholder: 'Если требуется указать дополнительную информацию',
        },
        state: { mandatory: true, label: '', mutedLabel: '', reportDescription: '', type: 'pointsExtra', intervals: [{ min: '', max: '', points: '' }] }
    },
    {
        name: 'Количество команд',
        node: 'points',
        labels: {
            checkbox: 'Обязательно для заполнения',

            label: 'Описание критерия подсчета',
            labelPlaceholder: 'Описание',

            mutedLabel: 'Дополнительное описание',
            mutedLabelPlaceholder: 'Описание',

            reportDescription: 'Наименование в отчетной документации',
            reportDescriptionPlaceholder: 'Если требуется указать дополнительную информацию',
        },
        state: { mandatory: true, maxPoints: '', label: '', mutedLabel: '', reportDescription: '', type: 'countTeams', intervals: [{ min: '', max: '', points: '' }] }
    },
    {
        name: 'Фото',
        node: 'inputs',
        labels: {
            checkbox: 'Обязательно для заполнения',

            label: 'Описание критерия подсчета',
            labelPlaceholder: 'Описание',

            mutedLabel: 'Дополнительное описание',
            mutedLabelPlaceholder: 'Описание',

            reportDescription: 'Наименование в отчетной документации',
            reportDescriptionPlaceholder: 'Если требуется указать дополнительную информацию',

            minItemsLabel: 'Минимум фото',
            minItemsPlaceholder: '',
            maxItemsLabel: 'Максимум фото',
            maxItemsPlaceholder: 'Нет ограничений',
            pointsForEveryLabel: 'Баллы за каждое фото',
            pointsForEveryPlaceholder: 'Укажите балл',
            pointsForСompletionLabel: 'Балл за максимальное кол-во фото',
            pointsForСompletionPlaceholder: 'Укажите балл'
        },
        state: { mandatory: true, label: '', mutedLabel: '', reportDescription: '', minItems: '', maxItems: '', pointsForEvery: '', pointsForСompletion: '', type: 'photo' }
    },
    {
        name: 'Ссылка на видео',
        node: 'inputs',
        labels: {
            checkbox: 'Обязательно для заполнения',
            needCheckItemsForVideo: 'Включить зависимость ввода видео от количества участников',
            label: 'Описание критерия подсчета',
            labelPlaceholder: 'Описание',

            mutedLabel: 'Дополнительное описание',
            mutedLabelPlaceholder: 'Описание',

            reportDescription: 'Наименование в отчетной документации',
            reportDescriptionPlaceholder: 'Если требуется указать дополнительную информацию',

            minItemsLabel: 'Минимум видео',
            minItemsPlaceholder: '',
            maxItemsLabel: 'Максимум видео',
            maxItemsPlaceholder: 'Нет ограничений',
            pointsForEveryLabel: 'Баллы за каждое видео',
            pointsForEveryPlaceholder: 'Укажите балл',
            pointsForСompletionLabel: 'Балл за максимальное кол-во видео',
            pointsForСompletionPlaceholder: 'Укажите балл'
        },
        state: { mandatory: true, label: '', mutedLabel: '', reportDescription: '', minItems: '', maxItems: '', pointsForEvery: '', pointsForСompletion: '', type: 'video', needCheckItemsForVideo: false, intervals: [] }
    },
    {
        name: 'Ссылка на публикацию о мероприятии',
        node: 'inputs',
        labels: {
            checkbox: 'Обязательно для заполнения',

            label: 'Описание критерия подсчета',
            labelPlaceholder: 'Описание',

            mutedLabel: 'Дополнительное описание',
            mutedLabelPlaceholder: 'Описание',

            reportDescription: 'Наименование в отчетной документации',
            reportDescriptionPlaceholder: 'Если требуется указать дополнительную информацию',

            minItemsLabel: 'Минимум публикаций',
            minItemsPlaceholder: '',
            maxItemsLabel: 'Максимум публикаций',
            maxItemsPlaceholder: 'Нет ограничений',
            pointsForEveryLabel: 'Баллы за каждое публикацию',
            pointsForEveryPlaceholder: 'Укажите балл',
            pointsForСompletionLabel: 'Балл за максимальное кол-во публикаций',
            pointsForСompletionPlaceholder: 'Укажите балл'
        },
        state: { mandatory: true, label: '', mutedLabel: '', reportDescription: '', minItems: '', maxItems: '', pointsForEvery: '', pointsForСompletion: '', type: 'publication' }
    },
    {
        name: 'Ссылка на сайт организатора',
        node: 'inputs',
        labels: {
            checkbox: 'Обязательно для заполнения',
            label: 'Описание критерия подсчета',
            labelPlaceholder: 'Описание',

            mutedLabel: 'Дополнительное описание',
            mutedLabelPlaceholder: 'Описание',

            reportDescription: 'Наименование в отчетной документации',
            reportDescriptionPlaceholder: 'Если требуется указать дополнительную информацию',

            pointsForСompletionLabel: 'Балл за ссылку',
            pointsForСompletionPlaceholder: 'Укажите балл'
        },
        state: { mandatory: true, label: '', mutedLabel: '', reportDescription: '', pointsForСompletion: '', type: 'site' }
    }
]);

const editEvent = {
    title: 'Изменить мероприятие',
    inputs: [
        { title: 'Название*', type: 'input', val: '', id: 'name', isRequired: true, fill: true },
        // { title: 'Описание мероприятия (не более 350 символов)', type: 'textarea', val: '', id: 'desc', isRequired: false, fill: true, placeholder: 'Опишите подробнее' },
    ]
}

// const treeData = [
//     {
//         key: '0',
//         label: selectedKeys && selectedKeys[0] && selectedKeys[0].partialChecked ? <span>Участие принимают только: {selectedKeys['0-0'] && selectedKeys['0-0'].checked ? 'Девочки' : selectedKeys['0-1'] && selectedKeys['0-1'].checked ? 'Мальчики' : ''}</span> : <span>Участие принимают оба пола</span>,
//         children: [
//             { key: '0-0', label: 'Девочки' },
//             { key: '0-1', label: 'Мальчики' }
//         ]
//     },
//     {
//         key: '1',
//         label: selectedKeys && selectedKeys[1] && selectedKeys[1].partialChecked ? <span>Участие принимают только: {selectedKeys['1-0'] && selectedKeys['1-0'].checked ? 'Дошкольное образование' : selectedKeys['1-1'] && selectedKeys['1-1'].checked ? 'Общее образование' : ''}</span> : <span>Мероприятия проводятся в рамках всех номинаций</span>,
//         children: [
//             { key: '1-0', label: 'Дошкольное образование' },
//             { key: '1-1', label: 'Общее образование' }
//         ]
//     },
// ]

export default Detail