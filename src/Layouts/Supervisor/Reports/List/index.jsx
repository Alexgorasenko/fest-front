import '../../Apps/style.scss'
import './style.scss'

import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {TabMenu} from "primereact/tabmenu";
import {InputText} from "primereact/inputtext";

import SvrContext from "../../ctx.js";
import {getReports} from "../service.js";
import {Paginator} from "primereact/paginator";

const List = () => {
    const { setSpace, token } = useContext(SvrContext)

    const navigator = useNavigate()

    const [activeIndex, setActiveIndex] = useState(0)

    const [nominations, setNominations] = useState([])
    const [serverData, setServerData] = useState([])
    const [data, setData] = useState([])
    const [rows, setRows] = useState([])
    const [first, setFirst] = useState(0)
    const [searchString, setSearchString] = useState('')

    useEffect(() => {
        if(token) {
            getReports(token)
                .then(resp => {
                    setServerData(resp.data)
                    setNominations(resp?.data?.list?.map(l => ({...l?.nomData, reportsCount: l?.reportsCount})))
                })
        }
    }, [token])

    useEffect(() => {
        
        if(activeIndex !== null && serverData?.list?.[activeIndex]?.activities) {
            setData(serverData.list[activeIndex].activities)
            setRows(serverData.list[activeIndex].activities.slice(0, 10))
            // setFirst(0)
            setSearchString('')
        }
    }, [activeIndex, serverData])

    useEffect(() => {
        if(serverData?.list?.[activeIndex]?.activities) {
            if (searchString?.length > 0) {
                const newData = [...serverData.list[activeIndex].activities.filter(s => s.activity.name?.toUpperCase().includes(searchString?.toUpperCase()))]
                setData(newData)
                setFirst(0)
                setRows(newData.slice(0, 10))
            } else {
                setFirst(0)
                setData(serverData.list[activeIndex].activities)
                setRows(serverData.list[activeIndex].activities.slice(0, 10))
            }
        }
    }, [searchString]);

    useEffect(() => {
        let pagination = parseInt(localStorage.getItem('pagination'))
        let tabMenu = parseInt(localStorage.getItem('tabMenu'))
        if (pagination) {
            setFirst(pagination)

            getReports(token)
            .then(resp => {
                console.log(resp.data)
                setRows(resp.data.list[tabMenu ? tabMenu : activeIndex].activities.slice(pagination, pagination + 10))
            })


        }
        if (tabMenu) {
            setActiveIndex(tabMenu)
        }
    }, [])

    const onPageChange= (e) => {
        setFirst(e.first)
        setRows(data.slice(e.first, e.first + 10))
    }

    const handleClick = (item) => {
        setSpace(prev => ({
            ...prev,
            path: [
                { key: 'reports', label: 'Отчеты о мероприятиях', url: '/reports' },
                { key: item.activity._id, item: {...item, nomination: nominations[activeIndex]}, label: item.activity.name, url: 'activity' }
            ]
        }))
        localStorage.setItem("pagination", first);
        localStorage.removeItem('paginationSecond');
        navigator(`/reviews/activity`)
    }

    return <div className='apps'>
        <div className='panel top'>
            <div className='title'>
                Отчеты о мероприятиях
            </div>
            <TabMenu
                model={nominations?.map((i, idx) => ({
                    label: <span key={idx}>{i.name} <i>({i.reportsCount !== 'undefined' ? i.reportsCount : 'N/A'})</i></span>
                }))}
                activeIndex={activeIndex}
                onTabChange={(e) => {
                    if (e.index !== activeIndex) {
                        localStorage.setItem("tabMenu", e.index);
                        setFirst(0);
                        setActiveIndex(e.index)
                    }
                    
                }}
            />
        </div>

        <div className='panel apps-list'>
            <div className='list-row list-top'>
                <div className="cell mean">
                    <span>
                        Название мероприятия
                    </span>
                </div>
                <div className="cell secondary">
                    <span>
                        Кол-во отчетов
                    </span>
                </div>
            </div>
            <div className='list-row search'>
                <div className="cell full">
                    <span className='p-input-icon-right'>
                        <i className='pi pi-search' />
                        <InputText
                            placeholder='Название мероприятия'
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                        />
                    </span>
                </div>
            </div>
            {rows?.map((act, index) => (
                <div
                    className='list-row item'
                    key={index}
                    onClick={() => handleClick(act)}
                >
                    <div className='cell mean'>
                        <span>{act.activity.name}</span>
                    </div>
                    <div className='cell secondary'>
                        <span>{act.reportsCount}</span>
                    </div>
                </div>
            ))}
        </div>
        {data?.length > 10 ?
            <Paginator first={first} rows={10} totalRecords={data.length} onPageChange={onPageChange}/> : null
        }
    </div>
}

export default List