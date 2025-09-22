import {useEffect, useState} from "react";

import moment from "moment/moment.js";

import {InputText} from "primereact/inputtext";
import {Paginator} from "primereact/paginator";
import {TabMenu} from "primereact/tabmenu";

import './style.scss'

const List = ({ data = [], handleOrg = () => {}, token }) => {
    const [activeIdx, setActiveIdx] = useState(0)
    const [organizations, setOrganizations] = useState(null)
    const [rows, setRows] = useState([])
    const [first, setFirst] = useState(0)
    const [searchString, setSearchString] = useState('')

    const model = data && data.length ? data.map(d => ({
        label: d.label || `${moment(d.dateStart, "DD.MM.YYYY").format("YYYY")}/${moment(d.dateEnd, "DD.MM.YYYY").format("YYYY")}`
    })) : []

    useEffect(() => {
        if (data && data[activeIdx]) {
            setOrganizations(data[activeIdx].organizations)
        }
    }, [activeIdx, data]);

    useEffect(() => {
        if (organizations && organizations.length > 0) {
            setRows(organizations.slice(0, 10))
        }
    }, [organizations]);

    useEffect(() => {
        if (data && data[activeIdx] && data[activeIdx].organizations && data[activeIdx].organizations.length > 0) {
            if (searchString?.length > 0) {
                const newData = [
                    ...data[activeIdx].organizations.filter(o =>
                        o.region?.toUpperCase().includes(searchString.toUpperCase()) ||
                        o.fullName?.toUpperCase().includes(searchString.toUpperCase()) ||
                        o.inn?.includes(searchString)
                    )
                ]
                setOrganizations(newData)
                setFirst(0)
                return
            } 
            
            setFirst(0)
            setOrganizations(data[activeIdx].organizations)
        }
    }, [searchString]);

    const onPageChange= (e) => {
        setFirst(e.first)
        setRows(organizations.slice(e.first, e.first + 10))
    }

    return (
        <div className='archive-list apps'>
            <div className="archive-list__header">
                <div className="archive-list__title">
                    <h1>Архив</h1>
                    <span>Выберите организацию или отсортируйте год за который хотите посмотреть данные</span>
                </div>
                <TabMenu model={model} activeIndex={activeIdx} onTabChange={(e) => setActiveIdx(e.index)} className="archive-list__tabmenu"/>
            </div>
            <div className='panel apps-list'>
                <div className='list-row list-top'>
                    <div className="cell secondary">
                        <span>Регион</span>
                    </div>
                    <div className="cell mean">
                        <span>Полное наименование организации</span>
                    </div>
                    <div className="cell secondary">
                        <span>ИНН</span>
                    </div>
                </div>
                <div className='list-row search'>
                    <div className="cell full">
                    <span className='p-input-icon-right'>
                        <InputText placeholder='Регион, Наименование или ИНН…' value={searchString} onChange={(e) => setSearchString(e.target.value)}/>
                    </span>
                    </div>
                </div>
                {rows?.map((r, k) => (
                    <div className='list-row item' key={k} onClick={() => handleOrg(r)}>
                        <div className='cell secondary'>
                            <span>{r.region}</span>
                        </div>
                        <div className='cell mean'>
                            <span>{r.fullName}</span>
                        </div>
                        <div className='cell secondary'>
                            <span>{r.inn}</span>
                        </div>
                    </div>
                ))}
            </div>
            {organizations?.length > 10 && <Paginator first={first} rows={10} totalRecords={organizations.length} onPageChange={onPageChange}/>}
        </div>
    )
}

export default List