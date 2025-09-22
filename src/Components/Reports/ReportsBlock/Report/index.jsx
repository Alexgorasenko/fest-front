import './style.scss'
import './medias.scss'

import {applyActivityReport, getActivityForm, updateActivityReport, uploadAttachment} from './../../service.js';

import {Button} from "primereact/button";
import {useEffect, useState} from "react";
import {confirmDialog} from "primereact/confirmdialog";
import moment from "moment/moment.js";

import DateField from "./DateField/index.jsx";
import CountStudentsField from "./CountStudentsField/index.jsx";
import PhotoField from "./PhotoField/index.jsx";
import PublicationField from "./PublicationField/index.jsx";
import VideoField from "./VideoField/index.jsx";
import CountTeamsField from "./CountTeamsField/index.jsx";
import PointsExtraField from "./PointsExtraField/index.jsx";
import axios from "axios";
import {ENDPOINT} from "../../../../env.js";
import {inject, observer} from "mobx-react";

const fields = {
    'date': DateField,
    'countStudents': CountStudentsField,
    'countTeams': CountTeamsField,
    'photo': PhotoField,
    'publication': PublicationField,
    'video': VideoField,
    'pointsExtra': PointsExtraField,
    'site': VideoField
}

const Report = inject('mainStore')(observer(({ mainStore, nominationId, festivalId, activityId, queryId, closeReport, preloadData, token, reportDataSvr, access}) => {
    const [reportData, setReportData] = useState(null)
    const [reportForm, setReportForm] = useState(null)

    useEffect(() => {
        const fillForm = (resp) => {
            setReportData(resp)
            const newReportForm = {}
            resp?.controls?.map(c => {
                let obj = newReportForm[c.type]?.value || {}
                let isValid = newReportForm[c.type]?.isValid !== false
                if (c?.columns) {
                    c?.columns?.map(col => {
                        col.controls.map(con => {
                            if (c.type !== 'countStudents' && (!con.value || c.value?.[0] === '' || c.value?.[0] === 0) && !con.disabled && con.mandatory) {
                                isValid = false
                            }
                            obj = {...obj, [con.reportDataKey]: con.value}
                        })
                    })
                } else {
                    if ((!c?.value || !c.value.length || c.value?.[0] === '') && !c.disabled){
                        if (c.type === 'date'){
                            isValid = false
                        } else if (c.type === 'countTeams' && c.value === null) {
                            isValid = false
                        } else if (c.mandatory) {
                            isValid = false
                        }
                    }
                    obj = {
                        ...obj,
                        [c?.reportDataKey]: c.type === 'date' ? c?.value ? new Date(moment(c.value, 'DD.MM.YYYY').format()) : null : c?.value
                    }
                }
                newReportForm[c.type] = {value: obj, isChanged: false, isValid: isValid, showValid: false}
            })
            setReportForm(newReportForm)
        }

        if (reportDataSvr){
            fillForm(reportDataSvr)
        } else if (nominationId) getActivityForm(nominationId, festivalId, activityId, queryId, localStorage.getItem('_amateum_tkn') || localStorage.getItem('_amateum_svr'))
            .then(resp => {
                fillForm(resp)
            })
    }, [nominationId, festivalId, activityId, queryId])

    const checkIsValid = (action, type) => {
        let _isValid = true
        reportData?.controls?.filter(c => c.type === type)?.map(c => {
            const arrayLength = action ? reportForm?.[type]?.value?.[c.reportDataKey]?.filter(v => v !== '')?.length : reportForm?.[type]?.value?.[c.reportDataKey]?.length - 1
            if ((arrayLength > c.maxItems || arrayLength < c.minItems || arrayLength === 0) && c.mandatory) {
                _isValid = false
            }
        })

        return _isValid
    }

    const updateForm = (type, key, value, _isChanged, _isValid, _showValid) => {
        const isChanged = _isChanged !== undefined ? _isChanged : reportForm[type].isChanged
        const isValid = _isValid !== undefined ? _isValid : reportForm[type].isValid
        const showValid = _showValid !== undefined ? _showValid : reportForm[type].showValid

        setReportForm({...reportForm, [type]: {value: {...reportForm[type].value, [key]: value}, isChanged, isValid, showValid}})
    }

    const uploadFile = async (isUpload, file, key) => {
        if (isUpload){
            const formData = new FormData()
            formData.append('file', file)
            formData.append('sampleId', reportData._id ? reportData._id : queryId)
            formData.append('sampleType', 'activityreports')
            const extension = file?.name?.substring(file?.name?.lastIndexOf('.'));
            formData.append('filename', `${queryId}_${activityId}_${nominationId}_${key}${extension}`)

            const resp = await uploadAttachment(formData, token ? token : localStorage.getItem('_amateum_tkn'))
            if (resp && resp.data) {
                return 'https://s3.megafon.cloud/fstbe2-fs/' + resp.data.path
            }
            closeReport(false, 'Ошибка загрузки фотографии')
        } else {
            setReportForm({
                ...reportForm,
                photo: reportForm.photo ? {
                    ...reportForm.photo,
                    isValid: false,
                    showValid: true
                } : undefined
            })
            closeReport(false, 'Вы уже загружали эту фотографию в отчёт по Фестивалю')
        }
    }

    const isValidForm = () => {
        return !!(((!reportForm?.date || reportForm?.date?.isValid)
            && (!reportForm?.countStudents || reportForm?.countStudents?.isValid && !!Object.values(reportForm?.countStudents?.value)?.flat()?.filter(v => v).length)
            && (!reportForm?.countTeams || reportForm?.countTeams?.isValid)
            && (!reportForm?.photo || reportForm?.photo?.isValid)
            && (!reportForm?.publication || reportForm?.publication?.isValid && checkIsValid(true, 'publication'))
            && (!reportForm?.video || reportForm?.video?.isValid && checkIsValid(true, 'video'))
        ) || ((!reportForm?.date || !Object.values(reportForm?.date?.value)?.flat()?.filter(v => v).length)
            && (!reportForm?.countStudents || !Object.values(reportForm?.countStudents?.value)?.flat()?.filter(v => v).length)
            && (!reportForm?.countTeams || !Object.values(reportForm?.countTeams?.value)?.flat()?.filter(v => v).length)
            && (!reportForm?.photo || !Object.values(reportForm?.photo?.value)?.flat()?.filter(v => v).length)
            && (!reportForm?.publication || !Object.values(reportForm?.publication?.value)?.flat()?.filter(v => v).length)
            && (!reportForm?.video || !Object.values(reportForm?.video?.value)?.flat()?.filter(v => v).length)
            && reportData._id
        ));

    }

    const save = () => {
        function hasDuplicates(arr) {
            return new Set(arr).size !== arr.length;
        }

        if (
            (reportForm?.video?.value && hasDuplicates(Object.values(reportForm?.video?.value)?.flat()?.filter(v => v !== '')))
            || (reportForm?.publication?.value && hasDuplicates(Object.values(reportForm?.publication?.value)?.flat()?.filter(v => v !== '')))
        ){
            setReportForm({
                ...reportForm,
                publication: reportForm.publication ? {
                    ...reportForm.publication,
                    isValid: hasDuplicates(Object.values(reportForm?.publication?.value)?.flat()?.filter(v => v !== '')) ? false : reportForm.publication.isValid,
                    showValid: hasDuplicates(Object.values(reportForm?.publication?.value)?.flat()?.filter(v => v !== ''))
                } : undefined,
                video: reportForm.video ? {
                    ...reportForm.video,
                    isValid: hasDuplicates(Object.values(reportForm?.video?.value)?.flat()?.filter(v => v !== '')) ? false : reportForm.video.isValid,
                    showValid: hasDuplicates(Object.values(reportForm?.video?.value)?.flat()?.filter(v => v !== ''))
                } : undefined
            })
            closeReport(false, 'Проверьте поля на наличие дубликатов')
        } else if (isValidForm()){
            confirmDialog({
                message: `Вы хотите сохранить изменения в отчёте мероприятия «${reportData?.info?.title}»?`,
                header: `Сохранить изменения перед закрытием отчёта?`,
                icon: 'pi pi-exclamation-triangle',
                accept: async () => {
                    if (reportData._id){
                        await updateActivityReport({
                            'date': reportForm?.date?.value['date'] ? new Date(reportForm?.date?.value['date']).toLocaleDateString() : '',
                            'reportData': {
                                ...reportForm?.countStudents?.value,
                                ...reportForm?.countTeams?.value,
                                ...reportForm?.photo?.value,
                                ...reportForm?.publication?.value,
                                ...reportForm?.video?.value,
                                ...reportForm?.pointsExtra?.value,
                                ...reportForm?.site?.value
                            }
                        }, reportData._id, token ? token : localStorage.getItem('_amateum_tkn'))
                    } else {
                        await applyActivityReport({
                            "festivalId": festivalId,
                            "activityId": activityId,
                            "queryId": queryId,
                            "nominationId": nominationId,
                            'date': new Date(reportForm?.date?.value['date']).toLocaleDateString(),
                            'reportData': {
                                ...reportForm?.countStudents?.value,
                                ...reportForm?.countTeams?.value,
                                ...reportForm?.photo?.value,
                                ...reportForm?.publication?.value,
                                ...reportForm?.video?.value,
                                ...reportForm?.pointsExtra?.value,
                                ...reportForm?.site?.value
                            }
                        }, localStorage.getItem('_amateum_tkn'))
                    }
                    mainStore.getByUrl(localStorage.getItem('_amateum_tkn'), "userflow/preload_data", false, false, false, false)
                        .then(resp => {
                            if(resp && resp.success) {
                                mainStore.setMainStore("canCertDownload", resp.data.canCertDownload)
                            }
                        })
                    closeReport(true, 'Отчёт успешно сохранён')
                },
                acceptLabel: 'Сохранить',
                rejectLabel: 'Не сохранять'
            });
        } else {
            setReportForm({...reportForm,
                date: {...reportForm.date, showValid: true},
                countStudents: reportForm.countStudents ? {...reportForm.countStudents, isValid: !!Object.values(reportForm?.countStudents?.value)?.flat()?.filter(v => v).length, showValid: true} : undefined,
                countTeams: reportForm.countTeams ? {...reportForm.countTeams, showValid: true} : undefined,
                photo: reportForm.photo ? {...reportForm.photo, showValid: true} : undefined,
                publication: reportForm.publication ? {...reportForm.publication, isValid: checkIsValid(true, 'publication'), showValid: true} : undefined,
                video: reportForm.video ? {...reportForm.video, isValid: checkIsValid(true, 'video'), showValid: true} : undefined,
            })
            closeReport(false, 'Необходимо заполнить все обязательные поля')
        }
    }

    return <div className={`report${reportDataSvr ? ' svr' : ''}`}>
        {/*<div className={'report-title'}>
            <div className={'title-text'}>
                Информация по проведению мероприятия
                <i className="pi pi-info-circle"/>
            </div>
            <div className={'info-text'}>
                {reportData?.info?.description}
            </div>
        </div>*/}
        <div className="report__docs">
            {docsItems.map((d, k) => (reportData?.[d.key] && (d.key === "diplomFile" ? isValidForm() : true)) && (
                <div key={k} className="report__doc">
                    <div className="report__doc-text">
                        <span>{d.label}</span>
                        <span>{reportData?.[d.key]?.filename}</span>
                    </div>
                    <Button icon="pi pi-download" onClick={() => handleDownloadFile(reportData?.[d.key])} className="report__doc-download"/>
                </div>
            ))}
        </div>
        <div className={'report-form'}>
            {reportData?.controls?.map((c, index) => {
                const Specified = fields[c.type]
                return Specified ? <Specified
                    key={index}
                    fieldData={c}
                    form={reportForm[c.type]}
                    updateForm={updateForm}
                    uploadFile={uploadFile}
                    preloadData={preloadData}
                    nominationId={nominationId}
                    closeReport={closeReport}
                    checkIsValid={checkIsValid}
                    sex={reportData?.info?.participants?.sex}
                    access={access}
                /> : null
            })}
            <Button
                className={'report-form-btn'}
                icon={'pi pi-check'}
                onClick={() => save()}
                visible={reportForm?.date?.isChanged || reportForm?.countTeams?.isChanged || reportForm?.countStudents?.isChanged || reportForm?.photo?.isChanged || reportForm?.publication?.isChanged || reportForm?.video?.isChanged || reportForm?.pointsExtra?.isChanged || false}
                disabled={access && access !== 'full'}
            >
                Сохранить
            </Button>
        </div>
    </div>
}))

const handleDownloadFile = async (file) => {
    try {
        const response = await fetch(file.fullpath || file.objectURL, { mode: "cors" });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = file.filename || file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Ошибка скачивания:", err);
    }
};

const docsItems = [
    {label: "Инструкция по проведению мероприятия", key: "instructionFile"},
    {label: "Диплом", key: "diplomFile"}
]

export default Report
