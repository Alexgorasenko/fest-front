import {useEffect, useState, useContext, useRef} from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import moment from 'moment'

import SvrContext from '../ctx'
import { countQueries, getQueries } from '../service'

import Item from './Item'
import AppWrapper from './AppWrapper'
import UploadedFile from "../../../Components/Applications/UploadedFile/index.jsx";

import { TabMenu } from 'primereact/tabmenu'
import { InputText } from 'primereact/inputtext'
import {Toast} from "primereact/toast";
import {Paginator} from "primereact/paginator";

import './style.scss'

const Apps = ({ roles }) => {
    const toast = useRef(null);
    const [toastMessage, setToastMessage] = useState('')

    const [category, setCatgory] = useState(0)
    const [serverData, setServerData] = useState([])
    const [data, setData] = useState([])
    const [qtys, setQtys] = useState([])
    const [first, setFirst] = useState(0)
    const [rows, setRows] = useState([])

    const [sortedName, setSortedName] = useState('')
    const [searchString, setSearchString] = useState('')

    const { token } = useContext(SvrContext)

    const navigator = useNavigate()
    const { secondParam } = useParams()

    const isRegionAdmin = (roles && !roles.superadmin && !roles.rfu_admin && !roles.moderator)

    useEffect(() => {
        if (searchString?.length > 0){
            const newData = [
                ...serverData.filter(
                    s => s.inn.includes(searchString) ||
                        s.applicantName?.toUpperCase().includes(searchString?.toUpperCase()) ||
                        s.regionName?.toUpperCase().includes(searchString?.toUpperCase())
                ),
            ]
            setData(newData)
            setFirst(0)
            setRows(newData.slice(0, 10))
            setSortedName('')
        } else {
            setFirst(0)
            setData(serverData)
            setRows(serverData.slice(0, 10))
            setSortedName('')
        }
    }, [searchString]);

    useEffect(() => {
        const searchData = searchString?.length > 0 ? [
            ...serverData.filter(
                s => s.inn.includes(searchString) ||
                    s.applicantName?.toUpperCase().includes(searchString?.toUpperCase()) ||
                    s.regionName?.toUpperCase().includes(searchString?.toUpperCase())
            ),
        ] : [...serverData]
        if (sortedName) {
            const newData = searchData.sort((a,b) => {
                return a[sortedName]?.toUpperCase() < b[sortedName]?.toUpperCase() ? sortedName === 'datetime' ? 1 : -1 : sortedName === 'datetime' ? -1 : 1
            })
            setData(newData)
            setRows(newData.slice(first, first + 10))
        } else {
            setData(searchData)
            setRows(searchData.slice(first, first + 10))
        }
    }, [sortedName]);

    useEffect(() => {
        if (toastMessage) {
            toast?.current?.show({severity:'success', detail:toastMessage, life: 3000});
            setToastMessage('')
        }
    }, [toastMessage])

    useEffect(() => {
        if(!secondParam) {
            countQueries(token)
                .then(arr => {
                    setQtys(arr)
                })
        }
    }, [secondParam])

    useEffect(() => {
        if(!secondParam) {
            getQueries(category, token)
                .then(queries => {
                    setServerData([...queries])
                    setData([...queries])
                    setRows([...queries].slice(first, first + 10))
                })
        }
    }, [category, secondParam])

    const onPageChange= (e) => {
        setFirst(e.first)
        setRows(data.slice(e.first, e.first + 10))
    }

    return  !secondParam ? <div className="apps">
                <Toast ref={toast} />
                <div className="panel top">
                    <div className="title">Заявки</div>
                    <TabMenu
                        model={[
                            {label: <span>Необработанные <i>({typeof(qtys[0]) !== 'undefined' ? qtys[0] : 'N/A'})</i></span>},
                            {label: <span>Отклоненные <i>({typeof(qtys[1]) !== 'undefined' ? qtys[1] : 'N/A'})</i></span>},
                            {label: <span>Принятые <i>({typeof(qtys[2]) !== 'undefined' ? qtys[2] : 'N/A'})</i></span>},
                            !isRegionAdmin ? {label: <span className={'archived'}>Пользователи удалили <i>({typeof(qtys[3]) !== 'undefined' ? qtys[3] : 'N/A'})</i></span>} : null
                        ].filter(i => i)}
                        activeIndex={category}
                        onTabChange={e => {if(e.index !== category) {setFirst(0); setCatgory(e.index)}}}
                    />
                </div>

                <div className="panel apps-list">
                    <div className="list-row list-top">
                        <div className="cell secondary">
                            <span onClick={() => setSortedName(sortedName === 'datetime' ? '' : 'datetime')}>
                                Дата подачи {sortedName === 'datetime' ? <i className="pi pi-sort-down"/> : null}
                            </span>
                        </div>

                        {category ? (
                            <div className="cell secondary">
                                <span onClick={() => setSortedName(sortedName === 'handledAt' ? '' : 'handledAt')}>
                                    Дата {category === 1 ? 'отклонения' : 'принятия'} {sortedName === 'handledAt' ? <i className="pi pi-sort-down"/> : null}
                                </span>
                            </div>
                        ) : null}

                        <div className="cell mean">
                            <span onClick={() => setSortedName(sortedName === 'applicantName' ? '' : 'applicantName')}>
                                Полное наименование организации {sortedName === 'applicantName' ? <i className="pi pi-sort-down"/> : null}
                            </span>
                        </div>
                        <div className="cell secondary">
                            <span onClick={() => setSortedName(sortedName === 'inn' ? '' : 'inn')}>
                                ИНН {sortedName === 'inn' ? <i className="pi pi-sort-down"/> : null}
                            </span>
                        </div>
                        <div className="cell secondary">
                            <span onClick={() => setSortedName(sortedName === 'regionName' ? '' : 'regionName')}>
                                Субъект {sortedName === 'regionName' ? <i className="pi pi-sort-down"/> : null}
                            </span>
                        </div>
                        <div className="cell secondary">
                            <span>
                                Печатная форма
                            </span>
                        </div>
                    </div>

                    <div className="list-row search">
                        <div className="cell full">
                            <span className='p-input-icon-right'>
                                <i className='pi pi-search' />
                                <InputText
                                    placeholder='Наименование, субъект или ИНН'
                                    value={searchString}
                                    onChange={(e) => setSearchString(e.target.value)}
                                />
                            </span>
                        </div>
                    </div>

                    {rows.map((a, i) => (
                        <div
                            className={`list-row item${a.urgent && category === 0 ? ' urgent' : ''}`}
                            key={i}
                            onClick={() => navigator(`/apps/${a._id}`)}
                        >
                            <div className='cell secondary'>
                                <span>{moment(a.datetime, 'YYYY-MM-DD HH:mm').format('DD.MM.YYYY')} <i className='time'>{moment(a.datetime, 'YYYY-MM-DD HH:mm').format('HH:mm')}</i></span>
                            </div>

                            {category ? (
                                <div className='cell secondary'>
                                    <span>{moment(a.handledAt, 'YYYY-MM-DD HH:mm').format('DD.MM.YYYY')} <i className='time'>{moment(a.handledAt, 'YYYY-MM-DD HH:mm').format('HH:mm')}</i></span>
                                </div>
                            ) : null}

                            <div className='cell mean'>
                                <span>{a.applicantName || 'Наименование не указано'}</span>
                            </div>

                            <div className='cell secondary'>
                                <span className="muted">{a.inn || 'ИНН не указан'}</span>
                            </div>

                            <div className='cell secondary'>
                                <span className="muted">{a.regionName || 'Субъект не указан'}</span>
                            </div>

                            <div className='cell secondary'
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     e.preventDefault()
                                 }}
                            >
                                <UploadedFile
                                    data={a.attachmentFormId}
                                    svr
                                    toast={toast}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                {data?.length > 10 ?
                    <Paginator first={first} rows={10} totalRecords={data.length} onPageChange={onPageChange}/> : null
                }
            </div> : roles && roles.moderator ? (
                <Item id={secondParam} toast={toast} updateToastMessage={setToastMessage}/>
            ) : (
                <AppWrapper id={secondParam} token={token} />
            )
}

export default Apps
