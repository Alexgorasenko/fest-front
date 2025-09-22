import '../../../Apps/style.scss'
import './style.scss'

import {useState, useEffect, useContext} from 'react'
import { TabMenu } from 'primereact/tabmenu'
import {InputText} from "primereact/inputtext";
import {Paginator} from "primereact/paginator";
import moment from "moment/moment.js";

import {
    getUsersCount,
    fetchUsers,
    createUser,
    regionsList,
    getContentManagers,
    createContentManagers
} from "../../../service.js";
import {Button} from "primereact/button";
import SvrContext from "../../../ctx.js";
import {useNavigate} from "react-router-dom";


const categories = [
    {label: 'Публичные пользователи', key: 'public', singleLabel: 'Публичный пользователь'},
    {label: 'Модераторы', key: 'moderators', singleLabel: 'Модератор'},
    {label: 'Региональные кураторы', key: 'regions', singleLabel: 'Региональный куратор'},
    {label: 'Администраторы', key: 'admins', singleLabel: 'Администратор'},
    {label: 'Контент менеджеры', key: 'content', singleLabel: 'Контент менеджер'}
]

const createUserDefault = {
    title: 'Создать пользователя',
    inputs: [
        { title: 'ФИО пользователя*', type: 'input', val: '', id: 'name', isRequired: true, fill: false, placeholder: 'Укажите ФИО пользователя' },
        { title: 'Адрес эл. почты*', type: 'input', val: '', id: 'email', isRequired: true, fill: false, placeholder: 'Укажите почту' },
        { title: 'Роль* ', type: 'dropdown', val: '', id: 'type', isRequired: true, fill: true, keys: [{label: 'Модератор', value: 'moderator'}, {label: 'Региональный куратор', value: 'region_admin'}, {label: 'Администратор', value: 'rfu_admin'}, {label: 'Контент менеджер', value: 'content'}], placeholder: 'Выберите роль' },
        { title: 'Может просматривать заявки/отчеты* ', type: 'autoComplete', val: [], id: 'canView', isRequired: false, fill: false },
        { title: 'Может редактировать заявки/отчеты* ', type: 'autoComplete', val: [], id: 'canEdit', isRequired: false, fill: false }
    ]
}

const attachLabels = (admin, ref) => {
    let output = {}
    for(let key in admin) {
        output[key] = []
        for(let kladr_id of admin[key]) {
            const match = ref.find(r => r.value === kladr_id)
            if(match) {
                output[key].push(match)
            }
        }
    }

    return output
}

const List = () => {
    const { setSpace, token } = useContext(SvrContext)

    const navigator = useNavigate()

    const [regions, setRegions] = useState([])

    const [usersCount, serUsersCount] = useState([])
    const [activeIndex, setActiveIndex] = useState(0)

    const [sortedName, setSortedName] = useState('')
    const [searchString, setSearchString] = useState('')

    const [serverData, setServerData] = useState([])
    const [data, setData] = useState([])
    const [rows, setRows] = useState([])
    const [first, setFirst] = useState(0)

    useEffect(() => {
        if(token) {
            getUsersCount(token)
                .then(resp => serUsersCount(resp))

            regionsList()
                .then(list => {
                    setRegions(list)
                })
        }
    }, [token])

    useEffect(() => {
        let tabMenu = parseInt(localStorage.getItem('tabMenu'))

        if(activeIndex !== null) {
            if (activeIndex === 4 || tabMenu === 4) {
                getContentManagers(token)
                    .then(resp => {
                        const data = resp && resp.data || []
                        setServerData([...data])
                        setData([...data])
                        setRows([...data].slice(first, first + 10))
                        setSortedName('')
                        setSearchString('')
                    })
            } else {
                fetchUsers(token, categories[tabMenu ? tabMenu : activeIndex].key)
                    .then(resp => {
                        setServerData([...resp])
                        setData([...resp])
                        setRows([...resp].slice(first, first + 10))
                        setSortedName('')
                        setSearchString('')
                    })
            }
        }
    }, [activeIndex])

    useEffect(() => {
        if (searchString?.length > 0){
            const newData = [
                ...serverData.filter(s =>
                    s.email.includes(searchString)
                    ||
                    s.name?.toUpperCase().includes(searchString?.toUpperCase())
                    ||
                    attachLabels(s?.roles?.region_admin, regions)?.canEdit?.filter(e => e.label.toUpperCase().includes(searchString?.toUpperCase())).length
                    ||
                    attachLabels(s?.roles?.region_admin, regions)?.canView?.filter(e => e.label.toUpperCase().includes(searchString?.toUpperCase())).length
                )
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
            ...serverData.filter(s =>
                s.email.includes(searchString)
                ||
                s.name?.toUpperCase().includes(searchString?.toUpperCase())
                ||
                attachLabels(s?.roles?.region_admin, regions)?.canEdit?.filter(e => e.label.toUpperCase().includes(searchString?.toUpperCase())).length
                ||
                attachLabels(s?.roles?.region_admin, regions)?.canView?.filter(e => e.label.toUpperCase().includes(searchString?.toUpperCase())).length
            )
        ] : [...serverData]
        if (sortedName) {
            const newData = searchData.sort((a,b) => {
                return sortedName === 'createdAt' ? a[sortedName] < b[sortedName] ? 1 : -1 : a[sortedName]?.replaceAll(' ','')?.toUpperCase() < b[sortedName]?.replaceAll(' ','')?.toUpperCase() ? -1 : 1
            })
            setData(newData)
            setRows(newData.slice(first, first + 10))
        } else {
            setData(searchData)
            setRows(searchData.slice(first, first + 10))
        }
    }, [sortedName]);

    useEffect(() => {
        let pagination = parseInt(localStorage.getItem('pagination'))
        let tabMenu = parseInt(localStorage.getItem('tabMenu'))
        if (pagination) {
            setFirst(pagination)
            fetchUsers(token, categories[tabMenu ? tabMenu : activeIndex].key)
                .then(resp => {
                    setServerData([...resp])
                    setData([...resp])
                    setRows([...resp].slice(pagination, pagination + 10))
                    setSortedName('')
                    setSearchString('')
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
                { key: 'users-and-roles', label: 'Пользователи и роли', url: '/users-and-roles' },
                { key: categories[activeIndex].key, item: item, label: categories[activeIndex].singleLabel, url: 'user' }
            ]
        }))
        localStorage.setItem("pagination", first);
        navigator(`/users-and-roles/user/${item._id}`)
    }

    const createUserClick = () => {
        let obj = {
            ...createUserDefault,
            func: (state) => {
                const {email, name, password, type} = state
                let newState = {email, name, password, type}
                if (state.canEdit || state.canView){
                    newState = {
                        ...newState,
                        roles: {
                            region_admin: {
                                canView: state.canView.filter(r => !state.canEdit.find(_r => _r.value === r.value))?.map(i => i.value),
                                canEdit: state.canEdit?.map(i => i.value)
                            }
                        }
                    }
                }
                if (type === 'content') {
                    newState = {
                        email: newState.email,
                        name: newState.name
                    }
                    createContentManagers(newState, token)
                        .then(resp => {
                            if (resp?.success) {
                                setSpace(prev => ({...prev, toast: {severity: 'success', summary: '', detail: 'Пользователь успешно создан'}}))

                                if (activeIndex === 4) {
                                    getContentManagers(token)
                                        .then(resp => {
                                            const data = resp && resp.data || []
                                            setServerData([...data])
                                            setData([...data])
                                            setRows([...data].slice(first, first + 10))
                                        })
                                } else {
                                    fetchUsers(token, categories[activeIndex].key)
                                        .then(resp => {
                                            setServerData([...resp])
                                            setData([...resp])
                                            setRows([...resp].slice(first, first + 10))
                                        })
                                }

                                getUsersCount(token)
                                    .then(resp => serUsersCount(resp))
                            } else {
                                setSpace(prev => ({...prev, toast: {severity: 'error', summary: '', detail: 'Ошибка создания пользователя'}}))
                            }
                        })
                } else {
                    createUser(newState, token)
                        .then(resp => {
                            if (resp?.success) {
                                setSpace(prev => ({...prev, toast: {severity: 'success', summary: '', detail: 'Пользователь успешно создан'}}))
                                fetchUsers(token, categories[activeIndex].key)
                                    .then(resp => {
                                        setServerData([...resp])
                                        setData([...resp])
                                        setRows([...resp].slice(first, first + 10))
                                    })
                                getUsersCount(token)
                                    .then(resp => serUsersCount(resp))
                            } else {
                                setSpace(prev => ({...prev, toast: {severity: 'error', summary: '', detail: 'Ошибка создания пользователя'}}))
                            }
                        })
                }
            }
        }

        setSpace(prev => ({ ...prev, modal: obj }))
    }

    return  <div className='apps roles'>
                <div className='panel top'>
                    <div className='title'>
                        Пользователи и роли
                        <Button
                            className={'btn-add-role'}
                            icon={'pi pi-plus-circle'}
                            onClick={createUserClick}
                        >
                            Создать пользователя
                        </Button>
                    </div>
                    <TabMenu
                        model={categories.map((i, idx) => ({
                            label: <span key={idx}>{i.label} <i>({typeof(usersCount?.[idx]) !== 'undefined' ? usersCount[idx] : 'N/A'})</i></span>
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
                        <div className="cell secondary">
                            <span onClick={() => setSortedName(sortedName === 'createdAt' ? '' : 'createdAt')}>
                                Дата регистрации {sortedName === 'createdAt' ? <i className="pi pi-sort-down"/> : null}
                            </span>
                        </div>
                        <div className="cell mean">
                            <span onClick={() => setSortedName(sortedName === 'email' ? '' : 'email')}>
                                Почта {sortedName === 'email' ? <i className="pi pi-sort-down"/> : null}
                            </span>
                        </div>
                        <div className="cell mean">
                            <span onClick={() => setSortedName(sortedName === 'name' ? '' : 'name')}>
                                Имя пользователя {sortedName === 'name' ? <i className="pi pi-sort-down"/> : null}
                            </span>
                        </div>
                        {categories[activeIndex].key === 'regions' ?
                            <div className="cell mean">
                                <span>
                                    Субъекты
                                </span>
                            </div> : null
                        }
                    </div>
                    <div className='list-row search'>
                        <div className="cell full">
                            <span className='p-input-icon-right'>
                                <i className='pi pi-search' />
                                <InputText
                                    placeholder='Имя пользователя, Почта или Субъект'
                                    value={searchString}
                                    onChange={(e) => setSearchString(e.target.value)}
                                />
                            </span>
                        </div>
                    </div>
                    {rows?.map((user, index) => (
                        <div
                            className='list-row item'
                            key={index}
                            onClick={() => handleClick(user)}
                        >
                            <div className='cell secondary'>
                                <span>{moment(user.createdAt).format('DD.MM.YYYY')} <i className='time'>{moment(user.createdAt).format('HH:mm')}</i></span>
                            </div>
                            <div className='cell mean'>
                                <span>{user.email}</span>
                            </div>
                            <div className='cell mean'>
                                <span>{user.name}</span>
                            </div>
                            {categories[activeIndex].key === 'regions' ?
                                <div className="cell mean">
                                    {attachLabels(user?.roles?.region_admin, regions)?.canEdit
                                        ?.map((e, index) =>
                                            <span key={e.value}>
                                                {index !== 0 ? ', ' : ''}
                                                {e.label}
                                            </span>
                                        )
                                    }
                                    {attachLabels(user?.roles?.region_admin, regions)?.canView
                                        ?.map((e, index) =>
                                            <span key={e.value} className={'muted'}>
                                                {attachLabels(user?.roles?.region_admin, regions)?.canEdit?.length && index === 0 ? ', ' : index !== 0 ? ', ' : ''}
                                                {e.label}
                                            </span>
                                        )
                                    }
                                </div> : null
                            }
                        </div>
                    ))}
                </div>
                {data?.length > 10 ?
                    <Paginator first={first} rows={10} totalRecords={data.length} onPageChange={onPageChange}/> : null
                }
            </div>
}

export default List
