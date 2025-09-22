import React, { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import moment from "moment";

import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {Calendar} from "primereact/calendar";
import {SelectButton} from "primereact/selectbutton";

import SvrContext from '../../../../../ctx'
import { createBreads, editData } from '../../../utils'
import { getFestivals, editFestivals } from '../../../../../service'

import './style.scss'

const Points = () => {
    const navigator = useNavigate()
    const params = useParams()
    const { space, setSpace, token } = useContext(SvrContext)
    const path = space && space.path ? space.path : null
    const currentFestival = space && space.selectedFestivalIdx || 0
    const breads = path && createBreads(params, path)
    const data = space && space.festivals && space.festivals[currentFestival] ? space.festivals[currentFestival] : false
    const intervals = data && data.commonCountingSettings && data.commonCountingSettings.totalCountFinished && data.commonCountingSettings.totalCountFinished.intervals ? data.commonCountingSettings.totalCountFinished.intervals : []
    const extraPointsFinishedVideo = data && data.extraPointsFinishedVideo ? data.extraPointsFinishedVideo : ''
    const earlyRegistration = data && data.commonCountingSettings && data.commonCountingSettings.earlyRegistration
    const totalCountFinished = data && data.commonCountingSettings && data.commonCountingSettings.totalCountFinished

    const [allPoints, setAllpoints] = useState('')
    const [pointItems, setPointItems] = useState([])
    const [errors, setErrors] = useState([]);
    const [earlyRegItem, setEarlyRegItem] = useState({...earlyRegModel})
    const [deadlineDate, setDeadlineDate] = useState(null)
    const [isBtnVisible, setIsBtnVisible] = useState(false)

    useEffect(() => {
        if (earlyRegistration) {
            setEarlyRegItem(earlyRegistration)
        }
    }, [earlyRegistration]);

    useEffect(() => {
        if (totalCountFinished && totalCountFinished.deadLine) {
            setDeadlineDate(totalCountFinished.deadLine)
        }
    }, [totalCountFinished]);

    useEffect(() => {
        if (!pointItems.length && intervals.length) {
            setPointItems(intervals)
        }
        if (!allPoints && extraPointsFinishedVideo) {
            setAllpoints(extraPointsFinishedVideo)
        }
    }, [intervals, extraPointsFinishedVideo])

    const handleAddLevel = () => {
        let addData = { ...model }
        if (pointItems.length) {
            const lastPoint = pointItems[pointItems.length - 1]
            addData.min = lastPoint.max + 1
            addData.max = lastPoint.max + 2
        }
        setPointItems(prev => ([...prev, addData]))
        setIsBtnVisible(true)
    }

    const handleDel = (idx) => {
        let arr = Object.assign([], pointItems)
        arr.splice(idx, 1)
        setPointItems(arr)
        setIsBtnVisible(true)
    }

    const validate = (items) => {
        const newErrors = items.map(() => ({ min: false, max: false }));

        items.forEach((item, idx) => {
            if (item.min > item.max) {
                newErrors[idx].min = true;
                newErrors[idx].max = true;
            }

            if (idx > 0) {
                const prev = items[idx - 1];
                if (item.min <= prev.max) {
                    newErrors[idx].min = true;
                }
                if (item.max <= prev.max) {
                    newErrors[idx].max = true;
                }
            }
        });

        return newErrors;
    };

    const handleChangeInput = (path, val) => {
        const [idx, field] = path.split(".");
        const index = Number(idx);

        const newItems = [...pointItems];
        newItems[index] = { ...newItems[index], [field]: Number(val) };

        setPointItems(newItems);
        setErrors(validate(newItems));
        setIsBtnVisible(true);
    };

    const updateEarlyReg = (val, key) => {
        setIsBtnVisible(true)
        if (key) {
            setEarlyRegItem(prev => ({...prev, [key]: val}))
            return
        }
        setEarlyRegItem(val)
    }

    const handleSave = () => {
        let obj = {
            commonCountingSettings: {
                totalCountFinished: {
                    title: "Количество проведенных мероприятий",
                    deadLine: deadlineDate,
                    intervals: pointItems
                },
                earlyRegistration: {
                    title: "Баллы за раннюю регистрацию",
                    ...earlyRegItem
                }
            },
            extraPointsFinishedVideo: allPoints || data.extraPointsFinishedVideo
        }

        editFestivals(obj, data._id, token, true).then(resp => {
            if (resp && resp.success) {
                setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: 'Изменения успешно сохранены' } }))
                navigator(-1)
                
                getFestivals(token).then(resp => {
                    if (resp && resp.success) {
                        setSpace(prev => ({ ...prev, festivals: resp.data }))
                    } else {
                        setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка получения данных' } }))
                    }
                })
            } else {
                setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка добавления мероприятий' } }))
            }
        })
    }

    return (
        <div className='festivals-detail-points'>
            <Card className='festivals-detail-points__section'>
                {breads && <BreadCrumb className='festivals-detail-points__breadcrumb' model={breads.items} home={breads.home} />}
                <span className='festivals-detail-points__title'>Фестивальные баллы</span>
            </Card>

            <Card className='festivals-detail-points__section'>
                <div className='festivals-detail-points__title-container'>
                    <span className='festivals-detail-points__subtitle'>Баллы за мероприятия</span>
                    <Button className='festivals-detail-points__add-level-btn' label='Уровень баллов' onClick={handleAddLevel} icon='pi pi-plus-circle' text/>
                </div>

                {pointItems.map((i, idx) => (
                    <div key={idx} className='points-item'>
                        <span className='points-item__title'>Уровень баллов {idx + 1}</span>
                        <span className='points-item__info'>Количество проведённых мероприятий</span>
                        <div className='points-item__inputs'>
                            <span className='points-item__text'>от</span>
                            <InputText keyfilter="int" value={i.min} onChange={(e) => handleChangeInput(`${idx}.min`, e.target.value)} className={errors[idx]?.min ? "points-item__input_error" : ""}/>
                            <span className='points-item__text'>до</span>
                            <InputText keyfilter="int" value={i.max} onChange={(e) => handleChangeInput(`${idx}.max`, e.target.value)} className={errors[idx]?.max ? "points-item__input_error" : ""}/>
                            <span className='points-item__equals'>=</span>
                            <InputText keyfilter="int" value={i.points} onChange={(e) => handleChangeInput(`${idx}.points`, e.target.value)}/>
                            <span className='points-item__text'>баллов</span>
                        </div>
                        <Button icon='pi pi-minus-circle' text severity="danger" onClick={() => handleDel(idx)}/>
                    </div>
                ))}

                <div className='festivals-detail-points__all-points'>
                    <label htmlFor="deadLineDate">До какой даты засчитываются мероприятия</label>
                    <Calendar id='deadLineDate' value={deadlineDate && deadlineDate !== "Invalid date" ? moment(earlyRegItem.deadLine, "YYYY-MM-DD").toDate() : ""} onChange={(e) => setDeadlineDate(moment(e.value).format("YYYY-MM-DD"))} dateFormat="dd.mm.yy" placeholder='Выберите дату' showIcon className="festivals-detail-points__calendar"/>
                </div>
            </Card>

            <Card className='festivals-detail-points__section'>
                <span className='festivals-detail-points__subtitle'>Баллы за финальный ролик</span>
                <div className='festivals-detail-points__input-container'>
                    <label htmlFor="all-points">Сколько баллов получат за ролик</label>
                    <InputText id='all-points' value={allPoints} onChange={(e) => setAllpoints(Number(e.target.value))} placeholder='Укажите количество баллов' keyfilter="int" />
                </div>
            </Card>

            <Card className='festivals-detail-points__section festivals-detail-points__section_last'>
                <div className='festivals-detail-points__title-container'>
                    <span className='festivals-detail-points__subtitle'>Баллы за раннюю регистрацию</span>
                    <SelectButton value={earlyRegItem.type} options={earlyRegTypes} onChange={(e) => updateEarlyReg(e.value, "type")} className="festivals-detail-points__select"/>
                </div>
                <div className='festivals-detail-points__inputs'>
                    <div className='festivals-detail-points__input-container'>
                        <label htmlFor="deadLine">До какой даты окончания заявочной кампании перестают начисляться баллы</label>
                        <Calendar id='deadLine' value={earlyRegItem.deadLine && earlyRegItem.deadLine !== "Invalid date" ? moment(earlyRegItem.deadLine, "YYYY-MM-DD").toDate() : ""} onChange={(e) => updateEarlyReg(moment(e.value).format("YYYY-MM-DD"), "deadLine")} dateFormat="dd.mm.yy" placeholder='Выберите дату' showIcon className="festivals-detail-points__calendar"/>
                    </div>
                    <div className='festivals-detail-points__input-container'>
                        <label htmlFor="points">Сколько получит баллов</label>
                        <InputText id='points' value={earlyRegItem.points} onChange={(e) => updateEarlyReg(Number(e.target.value), "points")} placeholder='Укажите количество баллов' keyfilter="int"/>
                    </div>
                </div>
            </Card>

            <Button className='festivals-detail-points__save-btn' label='Сохранить' onClick={handleSave} visible={isBtnVisible && !errors.find(e => e.min || e.max)}/>
        </div>
    )
}

const earlyRegTypes = [{label: "За поданную заявку", value: "created"}, {label: "За верифицированную заявку", value: "verified"}]

const earlyRegModel = {
    type: "created",
    deadLine: "",
    points: 0
}

const model = {
    min: 1,
    max: 2,
    points: 0
}

export default Points