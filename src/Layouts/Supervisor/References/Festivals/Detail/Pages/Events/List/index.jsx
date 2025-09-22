import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';

import { createBreads } from '../../../../utils'
import SvrContext from '../../../../../../ctx'

import { getFestivals, getActivities, addActivities } from '../../../../../../service'

import './style.scss'

const List = () => {
    const params = useParams()
    const navigator = useNavigate()
    const { space, setSpace, token } = useContext(SvrContext)
    const path = space && space.path ? space.path : null
    const breads = path && createBreads(params, path)
    const currentFestival = space && space.selectedFestivalIdx || 0
    const data = space && space.festivals && space.festivals[currentFestival] ? space.festivals[currentFestival] : false

    const [list, setList] = useState([])

    useEffect(() => {
        if (!list.length && data && data._id) {
            getActivities(data._id, token).then(resp => {
                if (resp && resp.success) {
                    setList(resp.data)
                }
            })
        }
    }, [data])

    const handleClick = (path, item) => {
        setSpace(prev => ({ ...prev, path: [...prev.path, path], event: item }))
        navigator(`/festivals/main/events/${path.key}`)
    }

    const handleCreate = () => {
        let obj = {
            ...createEvent,
            func: (state) => {
                state.festivalId = data._id,
                state.sort = list.reduce((acc, row) => row.sort > acc ? row.sort : acc, 0)+1,

                addActivities(state, token).then(resp => {
                    if (resp && resp.success) {
                        handleClick({ key: 'event-detail', label: resp.data.name }, resp.data)
                        setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: 'Мероприятие успешно создано' } }))
                    } else {
                        setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: 'Ошибка добавления мероприятия' } }))
                    }
                })
            }
        }

        setSpace(prev => ({ ...prev, modal: obj }))
    }

    return (
        <div className='festivals-detail-events-list'>

            <Card className='festivals-detail-events-list__head'>
                {breads && <BreadCrumb className='festivals-detail-events-list__breadcrumb' model={breads.items} home={breads.home} />}

                <div className='festivals-detail-events-list__title-container'>
                    <span className='festivals-detail-events-list__title'>Мероприятия</span>
                    <Button className='festivals-detail-events-list__btn-add' icon='pi pi-plus-circle' onClick={handleCreate}>Добавить мероприятие</Button>
                </div>
            </Card>

            <Card className='festivals-detail-events-list__items'>
                {list.map((i, idx) => (
                    <div key={i._id} className='list-item' onClick={() => handleClick({ key: 'event-detail', label: i.name, idx }, i)}>
                        <span className='list-item__title'>{i.name}</span>
                        <i className="pi pi-angle-right" />
                    </div>
                ))}
            </Card>
        </div>
    )
}

const createEvent = {
    title: 'Добавить мероприятие',
    inputs: [
        { title: 'Название*', type: 'input', val: '', id: 'name', isRequired: true, fill: true },
        // { title: 'Описание мероприятия (не более 350 символов)', type: 'textarea', val: '', id: 'desc', isRequired: false, fill: true, placeholder: 'Опишите подробнее' },
    ],
}

export default List