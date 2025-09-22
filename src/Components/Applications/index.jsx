import {useRef, useState} from "react";

import { inject, observer } from "mobx-react"
import { computed } from "mobx"

import moment from "moment";

import service from "./service.js";
import {formatNumberWithSpaces, pluralForm} from "../../utils.js";

import {Button} from "primereact/button";
import {Toast} from "primereact/toast";
import {Accordion, AccordionTab} from "primereact/accordion";
import {confirmDialog} from "primereact/confirmdialog";
import {FileUpload} from "primereact/fileupload";

import CreateApplication from "./CreateApplication/index.jsx";
import UploadedFile from "./UploadedFile/index.jsx";
import Application from "./Application/index.jsx";

import './style.scss'

const Applications = inject('mainStore')(observer(({ mainStore, archiveData = false }) => {
    const festival = computed(() => mainStore.getMainStore('festival')).get();
    const queries = computed(() => mainStore.getMainStore('queries')).get();
    const earlyRegistrationPoints = computed(() => mainStore.getMainStore('earlyRegistrationPoints')).get();

    const { nominations, commonCountingSettings } = festival
    const isEarlyRegistration = commonCountingSettings && commonCountingSettings.earlyRegistration && moment(commonCountingSettings.earlyRegistration.deadLine, "YYYY-MM-DD") >= moment()

    const queriesReady = commonCountingSettings && commonCountingSettings.earlyRegistration ? commonCountingSettings.earlyRegistration.type === "created" ? queries?.filter(q => q.status !== "DRAFT" && moment(commonCountingSettings.earlyRegistration.deadLine, "YYYY-MM-DD") >= moment(q.createdAt))?.length : commonCountingSettings.earlyRegistration.type === "verified" ? queries?.filter(q => q.status === "VALID" && moment(commonCountingSettings.earlyRegistration.deadLine, "YYYY-MM-DD") >= moment(q.handledAt))?.length : 0 : 0
    const isDateQueriesEnd = festival && festival.dateQueriesEnd && moment(festival.dateQueriesEnd, "DD.MM.YYYY") <= moment()

    const toast = useRef(null)
    const fileUploadRef = useRef(null);

    const [createApp, setCreateApp] = useState(false)
    const [activeQueryId, setActiveQueryId] = useState('')
    const [activeQuery, setActiveQuery] = useState(false)

    const createDraft = (id) => {
        service.createDraft({festivalId: festival?._id, nominationId: id}, toast)
            .then(resp => {
                if (resp?.success) {
                    setActiveQueryId(resp?.data?._id)
                    setCreateApp(true)
                    setActiveQuery(resp?.data)
                    const newqueries = queries
                    newqueries.push(resp?.data)
                    mainStore.setMainStore("queries", newqueries)
                } else toast.current.show({severity:'error', detail:resp?.data?.message || 'Непредвиденная ошибка', life: 3000});
            })
    }

    const deleteApp = (id) => {
        confirmDialog({
            message: 'Заявка будет безвозвратно удалена',
            header: 'Удалить заявку?',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await service.removeQuery({"queryId": id}, toast)
                    .then((resp) => {
                        if (resp.success) {
                            toast.current.show({severity:'success', detail:'Заявка успешно удалена', life: 3000});
                            mainStore.setMainStore("queries", queries.filter(q => q._id !== id))
                        } else toast.current.show({severity:'error', detail:resp?.data?.message, life: 3000});
                    })
            },
            acceptLabel: 'Да',
            rejectLabel: 'Нет'
        });
    }

    const updateDefData = (field, newData) => {
        const oldquery = queries.find(q => q._id === activeQueryId)
        const newquery = {...oldquery, [field]: newData}
        mainStore.setMainStore("queries", queries.map(q => q._id === newquery._id ? newquery : q))
        // updateData({...data, data: {...data?.data, query: {...data?.data?.query, [field]: newData}}})
    }

    const updateAttachAndStatus = (status, file) => {
        const oldquery = queries.find(q => q._id === activeQueryId)
        const newquery = {...oldquery, status: status, attachmentForm: file}
        mainStore.setMainStore("queries", queries.map(q => q._id === newquery._id ? newquery : q))
        // updateData({...data, data: {...data?.data, query: {...data?.data?.query, status: status, attachmentForm: file}}})
    }

    /*const upload = async () => {
        const formData = new FormData()
        formData.append('file', fileUploadRef.current.getFiles()[0])
        formData.append('sampleId', data?.data?.query?._id)
        formData.append('sampleType', 'queries')
        formData.append('filename', fileUploadRef.current.getFiles()[0].name)
        formData.append('queryFields', 'attachmentFormId')
        await service.uploadAttachment(formData).then(
            (resp) => {
                if (resp.success) {
                    service.updateQuery(data?.data?.query?._id, {"status": "NEED_MODERATION"})
                    updateAttachAndStatus("NEED_MODERATION", [formData.get('file')])
                    toast.current.show({severity: 'success', detail: 'Заявка успешно отправлена', life: 3000});
                } else {
                    toast.current.show({severity: 'error', detail: resp?.data?.message, life: 3000});
                }
            }
        )
    }*/

    const handleEdit = async (query) => {
        await service.updateQuery(query?._id, {"status": "DRAFT"})
        setActiveQueryId(query?._id)
        setActiveQuery(query)
        setCreateApp(true)
    }

    return (
        <div className={`apps ${archiveData ? "apps_archive" : ""}`}>
            <Toast ref={toast}/>

            {!createApp && (isEarlyRegistration || earlyRegistrationPoints?.points > 0) && (
                <div className="apps-early-registration">
                    <div className="apps-early-registration__info">
                        <div className="apps-early-registration__title">
                            <h1>{isEarlyRegistration ? earlyRegistrationInfo[commonCountingSettings.earlyRegistration.type]?.title : earlyRegistrationPointsInfo[commonCountingSettings.earlyRegistration.type]}</h1>
                            <span>+ {formatNumberWithSpaces(commonCountingSettings.earlyRegistration.points)} баллов</span>
                        </div>
                        {isEarlyRegistration ? (
                            <div className="apps-early-registration__desc">
                                {earlyRegistrationInfo[commonCountingSettings.earlyRegistration.type]?.desc} {moment(commonCountingSettings.earlyRegistration.deadLine, "YYYY-MM-DD").format("DD.MM.YYYY")}, по каждой из них получите баллы
                            </div>
                        ) : (
                            <div className="apps-early-registration__desc">
                                Остальные баллы можно заработать заполняя отчеты о мероприятиях
                            </div>
                        )}
                    </div>
                    <div className="apps-early-registration__numbers">
                        <div className="apps-early-registration__number">
                            {queriesReady}
                            <span>{pluralForm(queriesReady, ["готова", "готовы", "готовы"])}</span>
                        </div>
                        <div className="apps-early-registration__slash">
                            /
                        </div>
                        <div className="apps-early-registration__number apps-early-registration__number_opacity">
                            {nominations.length}
                            <span>всего заявок</span>
                        </div>
                    </div>

                    <div className="apps-early-registration__progress">
                        <div className="apps-early-registration__progress-line" style={{ width: `${(queriesReady / nominations.length) * 100}%` }}></div>
                        {nominations.map((n,k) => <div key={k} className={`apps-early-registration__point ${k <= queriesReady ? "apps-early-registration__point_active" : ""}`} style={{ left: `calc(${(k / nominations.length) * 100}% - 7px)` }}></div>)}
                        <div className={`apps-early-registration__point ${nominations.length === queriesReady ? "apps-early-registration__point_active" : ""}`} style={{ left: "calc(100% - 8px)" }}></div>
                    </div>
                </div>
            )}
            {
                createApp ? (
                    <CreateApplication
                        toast={toast}
                        queryId={activeQueryId}
                        data={activeQuery}
                        closeApp={setCreateApp}
                        updateData={updateDefData}
                        updateAttachAndStatus={updateAttachAndStatus}
                    />
                ) : (archiveData ? archiveData.nominations : nominations)?.map((n, k) => {
                    const query = (archiveData ? archiveData.queries : queries)?.find(q => q.nominationId === n._id)

                    if (!query && isDateQueriesEnd) return false

                    return (
                        <div key={k} className='app'>
                            <div className={`title ${query ? "" : "title_noquery"}`}>
                                {n.name}
                                {query ? (
                                    <div className={`title-group ${query ? `title-group__${query?.status}` : ""}`}>
                                        <div className='title-status'>
                                            {archiveData && appStatus[query?.status]?.archiveTitle || appStatus[query?.status]?.title}
                                            {/*<i className={`pi ${appStatus[query?.status]?.icon}`}/>*/}
                                        </div>
                                        {/*{query?.status === 'VALID' && <Button label="Скачать сертификат" onClick={downloadCertificate} className='sertificate' icon="pi pi-download"/>}*/}

                                        {query?.status !== 'VALID' && (
                                            <span>
                                                {query ? appStatus[query?.status]?.helpInfo ? query?.status === 'NOT_VALID' ? query?.moderatorData.comment : appStatus[query?.status].helpInfo.description : appStatus[query?.status]?.description : n.description}
                                            </span>
                                        )}


                                        {/*{!!query && !!appStatus[query?.status]?.helpInfo && (
                                            <div className={'help-info'}>
                                                <div className={'help-info-title'}>
                                                    {appStatus[query?.status].helpInfo.title}
                                                </div>
                                                <div className={'help-info-description'}>
                                                    {query?.status === 'NOT_VALID' ? query?.moderatorData.comment : appStatus[query?.status].helpInfo.description}
                                                </div>
                                            </div>
                                        )}*/}
                                    </div>
                                ) : (
                                    <span>{archiveData ? "Заявка не подавалась" : n.description}</span>
                                )}
                            </div>

                            {!!query && (
                                <Accordion multiple className={'appdata'}>
                                    <AccordionTab header="Указанные данные">
                                        <Application appdata={query}/>
                                    </AccordionTab>
                                    {!!query?.attachmentForm && (
                                        <AccordionTab header="Загруженный файл">
                                            <UploadedFile data={query?.attachmentForm}/>
                                        </AccordionTab>
                                    )}
                                </Accordion>
                            )}

                            {!archiveData && (
                                <div className={'actions'}>
                                    {!!query && !!appStatus[query?.status]?.buttons?.remove && <Button label="Удалить заявку" icon='pi pi-trash' className='button-remove' onClick={() => deleteApp(query?._id)}/>}

                                    {!!query && !!appStatus[query?.status]?.buttons?.edit && !isDateQueriesEnd && <Button onClick={() => handleEdit(query)} icon='pi pi-pencil' className='edit-button' label={query?.status === 'DRAFT' ? "Продолжить заполнение" : "Изменить заявку"}/>}

                                    {!query && <Button label="Подать заявку" icon='pi pi-plus' className='edit-button' onClick={() => createDraft(n._id)}/>}

                                    {/*{data?.data?.query?.isPrintFormGetted && data?.data?.query?.status === 'DRAFT' ?
                                    <FileUpload
                                        ref={fileUploadRef}
                                        mode={"basic"}
                                        accept=".pdf"
                                        maxFileSize={5000000}
                                        auto
                                        chooseOptions={chooseOptions}
                                        onProgress={upload}
                                        onValidationFail={() => {
                                            toast.current.show({
                                                severity: 'error',
                                                detail: 'Максимальный размер файла 5 МБ',
                                                life: 3000
                                            });
                                        }}
                                    /> : null
                                }*/}
                                </div>
                            )}
                        </div>
                    )
                    //     : (
                    //     <div className={'no-app'}>
                    //         <i className="pi pi-file-excel"/>
                    //         <div className={'no-app-text'}>
                    //             <div className={'no-app-text-title'}>
                    //                 Заявка еще не подавалась
                    //             </div>
                    //             Заявка общеобразовательной организации<br/>на участие в Всероссийском
                    //             фестивале<br/>«Футбол
                    //             в школе» среди обучающихся образовательных организаций РФ
                    //         </div>
                    //         <Button id='createApplication' onClick={() => createDraft()}>Подать заявку</Button>
                    //     </div>
                    // )
                })
            }
        </div>
    )
}))

const earlyRegistrationInfo = {
    created: {
        title: "За поданную заявку",
        desc: "Успейте подать все заявки до"
    },
    verified : {
        title: "За верифицированную заявку",
        desc: "Успейте верифицировать все заявки до"
    }
}

const earlyRegistrationPointsInfo = {
    created: "По каждой поданной заявке",
    verified : "По каждой верифицированной заявке"
}

const chooseOptions = {label: 'Загрузить заявку', icon: 'pi pi-fw pi-upload'};

const downloadCertificate = () => {
    location.href = '/docs/certificate.docx'
}

const appStatus = {
    'NEED_MODERATION': {
        title: 'Заявка обрабатывается',
        description: 'Мы сообщим вам когда заявка пройдет проверку',
        buttons: {
            remove: true,
            edit: false
        }
    },
    'DRAFT': {
        title: 'Черновик',
        description: 'Важно помнить, что черновик не обрабатывается до момента его отправки на модерацию. Только после заполнения и отправки заявки она начнет свою обработку',
        buttons: {
            remove: true,
            edit: true
        }
    },
    'NOT_VALID': {
        title: 'Заявка требует доработки',
        icon: 'pi-exclamation-triangle',
        helpInfo: {
            title: 'Исправьте ошибки и попробуйте еще раз подать заявление',
            description: ''
        },
        buttons: {
            remove: true,
            edit: true
        }
    },
    'VALID': {
        title: 'Поздравляем, ваша заявка принята! Ожидайте, скоро тут появится функционал загрузки отчёта',
        archiveTitle: "Заявка принята!",
        icon: 'pi-check-circle',
        description: '',
        buttons: {
            remove: false,
            edit: false
        }
    }
}

export default Applications
