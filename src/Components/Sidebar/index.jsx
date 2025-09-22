import {useRef, useState, useEffect, useMemo} from "react";
import {useNavigate} from 'react-router-dom'

import {inject, observer} from "mobx-react";
import {computed} from "mobx";

import {handleDownloadFile} from "../../utils.js";

import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import {Toast} from "primereact/toast";
import {Button} from "primereact/button";
import {Menu} from "primereact/menu";
import {Sidebar as PrimeSidebar} from "primereact/sidebar";
import {Tooltip} from "primereact/tooltip";

import renderNavModel from './renderNavModel'

import logo from '../../assets/logo-color.svg'
import logoWhite from '../../assets/logo-white.svg'
import line from '../../assets/Vector-3.svg'

import './style.scss'

const Sidebar = inject('mainStore')(observer(({ mainStore, roles, device, status, updateActiveSubLink, nominations, preflow, docs, logout }) => {
    const canCertDownload = computed(() => mainStore.getMainStore('canCertDownload')).get();
    const festival = computed(() => mainStore.getMainStore('festival')).get();
    const minCountReportsForGetCert = festival && festival.minCountReportsForGetCert
    const dateReportStart = festival && festival.dateReportStart

    const toast = useRef(null);
    const menuRef = useRef(null);
    const navigator = useNavigate()

    const [linkIdx, setLinkIdx] = useState(0)
    const [activeNestedId, setActiveNestedId] = useState(null)
    // const [model, setModel] = useState([])
    const [showNested, setShowNested] = useState(true)

    const [menuOpen, setMenuOpen] = useState(false)
    const [docsData, setDocsData] = useState({...defaultDocs})
    
    const model = useMemo(() => (roles || nominations) ? renderNavModel(roles, nominations, status, dateReportStart) : [], [nominations, roles, status, dateReportStart])

    useEffect(() => {
        if (docs) {
            const newDocs = {}
            for (const d of docs) {
                newDocs[d.key] = d.item && d.item.linkActive && d.item[`${d.key}Link`] ? d.item[`${d.key}Link`] : d.file && d.file.fullpath ? d.file.fullpath : defaultDocs[d.key];
            }
            setDocsData(newDocs)
        }
    }, [docs]);

    /*useEffect(() => {
        if((roles || nominations)) {
            const mod = renderNavModel(roles, nominations, status)
            setModel(mod)
        }
    }, [roles, nominations, status])*/

    useEffect(() => {
        if(model && model.length && linkIdx === 0 && !activeNestedId) {
            const active = model.filter(n => n).findIndex(n => (n.path === window.location.pathname) || (n.nested && n.nested.find(ns => ns.path === window.location.pathname)))
            if(active > -1) {
                setLinkIdx(active)
                if(model[active]?.nested && model[active]?.nested[0] && model[active]?.nested[0]?.nestedId) {
                    setActiveNestedId(model[active].nested[0].nestedId)
                }
            }
        }
    }, [model])

    /*useEffect(() => {
        if(model[linkIdx]?.nested && model[linkIdx]?.nested[0] && model[linkIdx]?.nested[0]?.nestedId) {
            setActiveNestedId(model[linkIdx].nested[0].nestedId)
        }
    }, [linkIdx, model]);*/

    const signOut = () => {
        confirmDialog({
            message: 'Вы уверены, что хотите выйти из аккаунта?',
            header: 'Выйти из аккаунта',
            icon: 'pi pi-exclamation-triangle',
            accept: logout,
            acceptLabel: 'Да',
            rejectLabel: 'Нет'
        });
    }

    const downloadAttachment = async file => {
        await handleDownloadFile({ ...file, fullpath: file.fullpath || file.download })
    }

    const menu = () => {
        return !!model && <>
            <div className={'sidebar-top'}>
                <div className={'logo-title'}>
                    {preflow?.titleShort}
                    <img src={preflow?.logo} alt={'Лого ФВШ'}/>
                </div>
                <div className={'links'}>
                    {!canCertDownload && (
                        <Tooltip target=".link_cert" className="sidebar-tooltip">
                            Сертификат будет доступен для скачивания<br/>после загрузки {minCountReportsForGetCert} отчета о проведенном мероприятии
                        </Tooltip>
                    )}

                    {model.filter(n => n).map((item, idx) => {
                        return [
                            <div
                                key={idx}
                                className={`link${linkIdx === idx && !item.nested ? ' active' : ''}${item.fileId === "certificateFile" && !canCertDownload ? " link_cert" : ""}`}
                                onClick={() => {
                                    if(item.download && ((item.fileId === "certificateFile" && canCertDownload) || item.fileId !== "certificateFile")) {
                                        downloadAttachment(preflow[item.fileId] || item)
                                    }

                                    if(item.document) {
                                        window.open(item.document)
                                    }

                                    if(item.path) {
                                        navigator(item.path)
                                        setLinkIdx(idx)
                                        setMenuOpen(false)
                                        updateActiveSubLink(item.path !== '/reports' ? -1 : 0)
                                    }

                                    if(!item.nested) {
                                        setActiveNestedId(null)
                                    } else {
                                        if(linkIdx !== idx) {
                                            updateActiveSubLink(0)
                                            setLinkIdx(idx)
                                            if(item.nested[0] && item.nested[0].path) {
                                                navigator(item.nested[0].path)
                                                if(item.nested[0].nestedId) {
                                                    setActiveNestedId(item.nested[0].nestedId)
                                                }
                                            }
                                        } else {
                                            setShowNested(!showNested)
                                        }
                                    }
                                }}
                            >
                                <i className={`pi pi-${item.icon}`}></i>
                                <span>{item.display}</span>
                                {item.nested ? (
                                    <i
                                        className={`pi pi-chevron-${(linkIdx === idx) && showNested ? 'up' : 'down'}`}
                                        style={{position: 'absolute', right: '2rem'}}
                                    >
                                    </i>
                                ) : null}
                            </div>
                        ].concat(item.nested && showNested ?
                            item.nested.map((n, _idx) => (
                                <div
                                    key={`sub_${_idx}`}
                                    className={`sub_link${window.location.pathname === n.path && (!n.nestedId || (n.nestedId === activeNestedId)) ? ' active' : ''}${idx === linkIdx ? '' : ' collapsed'}`}
                                    onClick={() => {
                                        if(n.path) {
                                            navigator(n.path)
                                            setMenuOpen(false)
                                            if(n.nestedId) {
                                                setActiveNestedId(n.nestedId)
                                                updateActiveSubLink(_idx)
                                            }
                                        }
                                    }}
                                >
                                    <span>{n.display}</span>
                                </div>
                        )) : [])
                    })}
                </div>
            </div>
            <div className={'sidebar-bottom'}>
                <div className={'actions'}>
                    <div className={'action'}>
                        <i className="pi pi-envelope"/>
                        <a href={'mailto:sd-fest@rfs.ru'}>sd-fest@rfs.ru</a>
                    </div>
                    <div className={'action'}
                         onClick={() => {
                             navigator.clipboard.writeText('+7 495 926-13-00')
                             toast.current.show({severity:'success', detail:'Номер телефона скопирован', life: 3000});
                         }}
                    >
                        <i className="pi pi-phone"/>
                        +7 (495) 108-18-04
                    </div>
                    <div
                        className={'action'}
                        // onClick={(event) => menuRef.current.toggle(event)}
                        onClick={() => navigator('/instructions')}
                    >
                        <Menu
                            model={getTutorials(roles)}
                            popup
                            ref={menuRef}
                            id="popup_menu"
                            className={'tutorial-popup'}
                            appendTo='self'
                        />
                        <i className="pi pi-book"/>
                        Инструкции
                    </div>
                </div>
                <img src={line} alt={'.....'}/>
                <div className={'exit'} onClick={() => signOut()}>
                    <i className="pi pi-sign-out"/>
                    Выйти
                </div>
                <img src={line} alt={'.....'}/>
                <div className={'actions'}>
                    <div className={'action bottom'}>
                        <a
                            href={docsData.policy}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Политика обработки ПДн
                        </a>
                    </div>
                    <div className={'action bottom'}>
                        <a
                            href={docsData.userMsg}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Пользовательское соглашение
                        </a>
                    </div>
                </div>
            </div>
        </>
    }

    return <div className={'sidebar'}>
        <ConfirmDialog />
        <Toast ref={toast} />
        {device === 'mobile' ? <div className={'sidebar-mobile'}>
            <PrimeSidebar
                visible={menuOpen}
                position='top'
                onHide={() => setMenuOpen(false)}
                fullScreen={true}
                className='pub-panel'
            >
                {menu()}
            </PrimeSidebar>
            <img src={logoWhite} alt={'Лого ФВШ'}/>
            <Button icon="pi pi-bars" onClick={() => setMenuOpen(true)} />
        </div> : menu()}
    </div>
}))

const getTutorials = (roles) =>
    roles?.region_admin?.canEdit?.length || roles?.region_admin?.canView?.length ? [
        {
            label: 'Региональный куратор',
            command: () => {
                window.open('/docs/tutorial_region.pdf')
            }
        }
    ] : [
        {
            label: 'Заявка на участие',
            command: () => {
                window.open('/docs/tutorial.pdf')
            }
        },
        {
            label: 'Отчет о мероприятиях',
            command: () => {
                window.open('/docs/tutorial2.pdf')
            }
        }
    ]

const defaultDocs = {policy: 'https://www.rfs.ru/static/rfs-privacy-policy.pdf', userMsg: '/docs/terms.pdf'}

export default Sidebar
