import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Menu } from 'primereact/menu';
import {Toast} from "primereact/toast";

import SvrContext from '../../../../../ctx'
import { createBreads, editData } from '../../../utils'
import { getNominations, saveNominations, getFestivals } from '../../../../../service'

import './style.scss'

const Nominations = () => {
    const params = useParams()
    const navigator = useNavigate()
    const { space, setSpace, token } = useContext(SvrContext)
    const path = space && space.path ? space.path : null
    const currentFestival = space && space.selectedFestivalIdx || 0
    const breads = path && createBreads(params, path)
    const data = space && space.festivals && space.festivals[currentFestival] ? space.festivals[currentFestival] : false
    const [items, setItems] = useState([])

    const [showInvalid, setShowInvalid] = useState(false)

    const toast = useRef()

    useEffect(() => {
        if (!items.length && data && data._id) {
            getNominations(data._id, token).then(resp => {
                if (resp && resp.success) {
                    const arr = resp.data.map(i => {
                        const obj = Object.assign(JSON.parse(model), i)
                        obj.title = i.name
                        obj.preschool = i.levels.reduce((acc, row) => {
                            if (row.name === "Дошкольники") acc.push(row)
                            return acc
                        }, [])
                        obj.general = i.levels.reduce((acc, row) => {
                            if (row.name !== "Дошкольники" && row.name !== "Детские лагеря") {
                                const o = Object.assign({}, row)
                                const split = row.name.split('-')
                                o.from = split[0]
                                o.to = split[1].replace(/\D/gmi, '')
                                acc.push(o)
                            }
                            return acc
                        }, [])
                        obj.camps = i.levels.reduce((acc, row) => {
                            if (row.name === "Детские лагеря") acc.push(row)
                            return acc
                        }, [])

                        return obj
                    });
                    setItems(arr)
                } else {
                    setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка получения данных' } }))
                }
            })
        }
    }, [data])

    const handleAdd = () => {
        const addData = Object.assign({}, JSON.parse(model))
        const sort = items.reduce((acc, row) => row.sort > acc ? row.sort : acc, 0)
        addData.sort = sort + 1
        setItems(prev => ([...prev, addData]))
    }

    const handleDel = (idx) => {
        let arr = Object.assign([], items)
        arr.splice(idx, 1)
        setItems(arr)
    }

    const handleChangeInput = (path, val) => {
        const edit = editData(path, items, val)
        setItems(edit)
    }

    const generalFix = (path, idx, gIdx, val) => {
        let isValid = true
        const intVal = parseInt(val || '0')
        let secVal = 0
        const itemIdx = items.slice(0, idx).reduce((acc, i) => acc + i.general.length, gIdx);
        const generals = items.map(item => item.general).flat()
        generals.map((i, index) => {
            const fromValue = parseInt(i.from || '0')
            const toValue = parseInt(i.to || '0')
            if (index === itemIdx) {
                secVal = path === 'to' ? fromValue : toValue
                if (
                    (path === 'to' && intVal < fromValue && fromValue !== 0)
                    || (path === 'from' && intVal > toValue && toValue !== 0)
                ) isValid = false
            } else if (
                (intVal <= toValue && intVal >= fromValue)
                || (itemIdx < index && intVal > toValue && toValue !== 0)
                || (itemIdx > index && intVal < fromValue && fromValue !== 0)
            ) isValid = false
        })
        if (val && !isValid){
            toast.current.show({severity:'error', detail: 'Уровень образования уже используется', life: 3000})
            const edit = editData(`${idx}.general.${gIdx}.${path}`, items, secVal)
            setItems(edit)
        }
    }

    const hadleAddSub = (idx, key, val) => {
        const arr = Object.assign([], items)
        arr[idx][key].push(val)
        setItems(arr)
    }
    const hadleDelSub = (idx, key, sIdx) => {
        const arr = Object.assign([], items)
        arr[idx][key].splice(sIdx, 1)
        setItems(arr)
    }

    const handleSave = () => {
        let invalid = false
        const body = items && items.length ? items.map(i => {
            const str = JSON.stringify(i)
            const obj = JSON.parse(str)
            obj.general.forEach((g, gIdx) => {
                invalid = !i.general[gIdx].from || !i.general[gIdx].to
                g.name = `${i.general[gIdx].from}-${i.general[gIdx].to} класс`
                g.description = `школьники ${i.general[gIdx].from}-${i.general[gIdx].to} класс`
                delete g.from
                delete g.to
            })
            obj.levels = i.preschool.concat(obj.general).concat(i.camps)
            obj.festivalId = data._id
            obj.name = i.title
            delete obj.general
            delete obj.preschool
            delete obj.title
            delete obj.camps

            return obj
        }) : [{festivalId: data._id, deleteAll: true}]

        if (invalid) {
            setShowInvalid(true)
        } else {
            setShowInvalid(false)
            saveNominations(body, token).then(resp => {
                if (resp && resp.success) {
                    getFestivals(token).then(resp => {
                        if (resp && resp.success) {
                            setSpace(prev => ({...prev, festivals: resp.data}))
                        } else {
                            setSpace(prev => ({
                                ...prev,
                                toast: {severity: 'error', summary: '', detail: 'Ошибка получения данных'}
                            }))
                        }
                    })
                    navigator(-1)
                    setSpace(prev => ({
                        ...prev,
                        toast: {severity: 'success', summary: '', detail: 'Номинации успешно сохранены'}
                    }))
                } else {
                    setSpace(prev => ({
                        ...prev,
                        toast: {severity: 'error', summary: '', detail: 'Ошибка добавления номинаций'}
                    }))
                }
            })
        }
    }

    const formatInput = (curVal, val) => {
        const intVal = parseInt(val.replace(/^0+/, ''))
        return intVal < 10000 ? intVal.toString()
            : !intVal ? '0'
                : curVal
    }

    const disabledBtn = items.find(i => !i.title)

    return (
        <div className='festivals-detail-nominations'>
            <Toast ref={toast}/>
            <Card className='festivals-detail-nominations__section festivals-detail-nominations__section_title'>
                <div className='festivals-detail-nominations__title-container'>
                    {breads && <BreadCrumb className='festivals-detail-nominations__breadcrumb' model={breads.items} home={breads.home} />}
                    <span className='festivals-detail-nominations__title'>Номинации</span>
                </div>
                <Button className='festivals-detail-nominations__add-btn' label='Добавить номинацию' icon='pi pi-plus' outlined onClick={handleAdd} />
            </Card>

            {items.map((i, idx) => {
                const isDisabledAddBtn = i.countStudents.length < i.preschool.concat(i.general).concat(i.camps).length ? false : true

                return (
                    <Card key={idx} className='festivals-detail-nominations__section nomination-item'>
                        <div className='nomination-item__head'>
                            <InputText className='nomination-item__title' value={i.title} placeholder='Укажите название номинации*' onChange={(e) => handleChangeInput(`${idx}.title`, e.target.value)} />
                            <Button className='nomination-item__del-btn' icon='pi pi-trash' outlined severity="danger" onClick={() => handleDel(idx)} />
                        </div>
                        <InputText className='nomination-item__desc' value={i.description} placeholder='Укажите описание номинации' onChange={(e) => handleChangeInput(`${idx}.description`, e.target.value)} />

                        {/* <div className='nomination-item__min-evt'>
                                <label htmlFor="min-evt">Минимальное кол-во проведенных мероприятий*</label>
                                <InputText id='min-evt' value={i.minEvt} onChange={(e) => handleChangeInput(`${idx}.minEvt`, e.target.value)} placeholder='Укажите кол-во' keyfilter="int" />
                            </div> */}

                        <Divider />
                        {i.preschool.map((p, pIdx) => (
                            <div key={pIdx} className='nomination-item__preschool-item'>
                                <span><b>Дошкольное образование</b> · {pIdx + 1} уровня</span>
                                <InputText value={p.option_description} onChange={(e) => handleChangeInput(`${idx}.preschool.${pIdx}.option_description`, e.target.value)} placeholder='Доп. информация' />
                                <Button icon='pi pi-minus-circle' text severity="danger" onClick={() => hadleDelSub(idx, 'preschool', pIdx)} />
                            </div>
                        ))}
                        {i.general.map((g, gIdx) => (
                            <div key={gIdx} className='nomination-item__general-item'>
                                <span><b>Общее образование</b> · {gIdx + 1} уровня</span>
                                <div className='nomination-item__general-inputs'>
                                    <div className='nomination-item__general-classes'>
                                        <span>с</span>
                                        <InputText
                                            value={g.from}
                                            onChange={(e) => handleChangeInput(`${idx}.general.${gIdx}.from`, parseInt(e.target.value) || '0')}
                                            onBlur={(e) => generalFix('from', idx, gIdx, e.target.value)}
                                            keyfilter="int"
                                            className={showInvalid && !g.from ? ' invalid' : ''}
                                        />
                                        <span>по</span>
                                        <InputText
                                            value={g.to}
                                            onChange={(e) => handleChangeInput(`${idx}.general.${gIdx}.to`, parseInt(e.target.value) || '0')}
                                            onBlur={(e) => generalFix('to', idx, gIdx, e.target.value)}
                                            keyfilter="int"
                                            className={showInvalid && !g.to ? ' invalid' : ''}
                                        />
                                        <span>класс</span>
                                    </div>
                                    <InputText value={g.option_description} onChange={(e) => handleChangeInput(`${idx}.general.${gIdx}.option_description`, e.target.value)} placeholder='Доп. информация' />
                                    <Button icon='pi pi-minus-circle' text severity="danger" onClick={() => hadleDelSub(idx, 'general', gIdx)} />
                                </div>
                            </div>
                        ))}
                        {i.camps.map((p, pIdx) => (
                            <div key={pIdx} className='nomination-item__preschool-item'>
                                <span><b>Детские лагеря</b> · {pIdx + 1} уровня</span>
                                <InputText value={p.option_description} onChange={(e) => handleChangeInput(`${idx}.camps.${pIdx}.option_description`, e.target.value)} placeholder='Доп. информация' />
                                <Button icon='pi pi-minus-circle' text severity="danger" onClick={() => hadleDelSub(idx, 'camps', pIdx)} />
                            </div>
                        ))}

                        <MenuItem idx={idx} hadleAddSub={hadleAddSub} items={i} />

                        <Divider />
                        {i.countStudents.map((l, lIdx) => (
                            <div key={lIdx} className='nomination-item__limit-item'>
                                <span><b>Ограничение</b> · {lIdx + 1} уровня</span>
                                <div className='nomination-item__limit-input'>
                                    <span>менее</span>
                                    <InputText
                                        value={l || '0'}
                                        onChange={(e) =>
                                            handleChangeInput(`${idx}.countStudents.${lIdx}`, formatInput(l, e.target.value))
                                    }
                                        keyfilter={'pint'}
                                    />
                                    <span>учеников</span>
                                    <Button
                                        icon='pi pi-minus-circle'
                                        text
                                        severity="danger"
                                        onClick={() => hadleDelSub(idx, 'countStudents', lIdx)}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            className='nomination-item__add-btn'
                            label='Ограничение по кол-ву обучающихся'
                            icon='pi pi-plus-circle'
                            text
                            onClick={() => hadleAddSub(idx, 'countStudents', 0)}
                            disabled={isDisabledAddBtn}
                        />
                    </Card>
                )
            })}

            <Button className='festivals-detail-nominations__save-btn' label='Сохранить' onClick={handleSave} disabled={disabledBtn}/>
        </div>
    )
}

const MenuItem = ({ idx, hadleAddSub, items }) => {
    const menuRef = useRef(null);
    const arr = items.preschool.concat(items.general).concat(items.camps)
    const sort = arr.reduce((acc, row) => row.sort > acc ? row.sort : acc, 0)

    return (
        <>
            <Button className='nomination-item__add-btn' label='Уровень образования*' icon='pi pi-plus-circle' text onClick={(e) => menuRef.current.toggle(e)} />
            <Menu
                model={[
                    { label: 'Дошкольное образование', command: () => hadleAddSub(idx, 'preschool', { active: true, description: 'Дошкольники', name: 'Дошкольники', nominationId: '', option_description: '', sort: sort + 1 }) },
                    { label: 'Общее образование', command: () => hadleAddSub(idx, 'general', { active: true, description: '', name: '', nominationId: '', option_description: '', from: 0, to: 0, sort: sort + 1 }) },
                    { label: 'Детские лагеря', command: () => hadleAddSub(idx, 'camps', { active: true, description: 'Детские лагеря', name: 'Детские лагеря', nominationId: '', option_description: '', sort: sort + 1 }) }
                ]}
                popup
                ref={menuRef}
                id={`popup_menu${idx}`}
            />
        </>
    )
}

const model = JSON.stringify({
    title: '',
    // minEvt: 0,
    preschool: [],
    general: [],
    camps: [],
    countStudents: []
})

export default Nominations