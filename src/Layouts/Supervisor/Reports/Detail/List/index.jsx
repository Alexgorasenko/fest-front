import './style.scss'
import '../../../Apps/style.scss'

import {useContext, useEffect, useState} from "react";

import SvrContext from "../../../ctx.js";
import {getReports} from "../../service.js";
import {InputText} from "primereact/inputtext";
import {useNavigate} from "react-router-dom";
import {Paginator} from "primereact/paginator";

const List = () => {
    const { space, setSpace, token } = useContext(SvrContext)

    const reportsCount = space?.path?.[1]?.item?.reportsCount
    const [fullData, setFullData] = useState([])
    const [data, setData] = useState([])
    const [rows, setRows] = useState(space?.path?.[1]?.item?.reports?.slice(0, 10))
    const [first, setFirst] = useState(0)

    const [sortedName, setSortedName] = useState('')
    const [searchString, setSearchString] = useState('')

    const navigator = useNavigate()

    useEffect(() => {
        if(token && !data.length) {
            getReports(token, space?.path[1]?.item?.nomination?._id, space?.path[1]?.item?.activity?._id, first / 10)
                .then(resp => {
                    setRows(resp.data)
                })
        }
    }, [token, first])

    useEffect(() => {
        if(fullData?.length) {
            if (searchString?.length > 0) {
                const newData = [
                    ...fullData.filter(
                        f => f.query?.organizationQueryData?.name?.toUpperCase().includes(searchString?.toUpperCase()) ||
                            f.query?.organizationQueryData?.inn?.includes(searchString) ||
                            f.query?.organizationQueryData?.fullName?.toUpperCase().includes(searchString?.toUpperCase()) ||
                            f.query?.organizationQueryData?.address?.region?.name?.toUpperCase().includes(searchString?.toUpperCase())
                    )
                ]
                setData(newData)
                setFirst(0)
                setRows(newData.slice(0, 10))
            } else {
                setFirst(0)
                setData([...fullData])
                setRows([...fullData.slice(0, 10)])
            }
        } else if (searchString?.length > 0) {
            getReports(token, space?.path[1]?.item?.nomination?._id, space?.path[1]?.item?.activity?._id, first / 10, reportsCount)
                .then(resp => {
                    setFullData(resp.data)
                })
        }
    }, [searchString]);

    useEffect(() => {
        let pagination = localStorage.getItem('paginationSecond');
        if (pagination) {
            setFirst(pagination)
        }
    }, [])

    const onPageChange= (e) => {
        setFirst(e.first)
        if (data.length){
            setRows(data.slice(e.first, e.first + 10))
        }
    }

    const handleClick = (item) => {
        setSpace(prev => ({
            ...prev,
            path: [
                ...prev.path,
                { key: item._id, item: item, label: item.query?.organizationQueryData?.name || 'Название не указано' }
            ]
        }))
        localStorage.setItem("paginationSecond", first);
        navigator(`/reviews/activity/report`)
    }

    return <div className='apps reports-svr'>
        <div className='panel top'>
            <div className='title'>
                <div className='value'>
                    {space?.path?.[1]?.item?.activity?.name}
                </div>
            </div>
        </div>
        <div className='panel apps-list'>
            <div className='list-row list-top'>
                <div className="cell secondary">
                    <span>
                        ИНН {sortedName === 'inn' ? <i className="pi pi-sort-down"/> : null}
                    </span>
                </div>
                <div className="cell secondary">
                    <span>
                        Субъект {sortedName === 'region' ? <i className="pi pi-sort-down"/> : null}
                    </span>
                </div>
                <div className="cell mean">
                    <span>
                        Название образовательного учреждения {sortedName === 'name' ? <i className="pi pi-sort-down"/> : null}
                    </span>
                </div>
            </div>
            <div className='list-row search'>
                <div className="cell full">
                    <span className='p-input-icon-right'>
                        <i className='pi pi-search' />
                        <InputText
                            placeholder='Поиск по названию образовательной организации, ИНН и субъекту'
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                        />
                    </span>
                </div>
            </div>
            {rows?.map((r, index) => (
                <div
                    className='list-row item'
                    key={index}
                    onClick={() => handleClick(r)}
                >
                    <div className='cell secondary'>
                        <span>{r.query?.organizationQueryData?.inn || 'ИНН не указан'}</span>
                    </div>
                    <div className='cell secondary'>
                        <span>{r.query?.organizationQueryData?.address?.region?.name || 'Адрес не указан'}</span>
                    </div>
                    <div className='cell mean'>
                        <span>{r.query?.organizationQueryData?.name || r.query?.organizationQueryData?.fullName || 'Название не указано'}</span>
                    </div>
                </div>
            ))}
        </div>
        {(!data.length || data.length > 10) && reportsCount > 10 ?
            <Paginator first={first} rows={10} totalRecords={data.length || reportsCount} onPageChange={onPageChange}/> : null
        }
    </div>
}

export default List