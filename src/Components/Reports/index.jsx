import {useEffect, useState} from "react";

import {inject, observer} from "mobx-react";
import {computed} from "mobx";

import {getActivities} from "./service.js";
import moment from "moment/moment.js";

import ReportsBlock from "./ReportsBlock/index.jsx";
import SendReport from "./SendReport/index.jsx";
import ReportSent from "./ReportSent/index.jsx";

import "./style.scss"

const Reports = inject('mainStore')(observer(({ mainStore, preloadData, activeNomins}) => {
    const queries = computed(() => mainStore.getMainStore('queries')).get();
    const festival = computed(() => mainStore.getMainStore('festival')).get();
    const { nominations } = festival
    const handledNominations = nominations?.filter(n => queries?.filter(q => q.status === "VALID")?.find(q => q.nominationId === n._id))
    const activeNomination = handledNominations?.[activeNomins]

    const [stage, setStage] = useState(0)
    const [activitiesData, setActivitiesData] = useState([])
    const [isNeedUpdate, setIsNeedUpdate] = useState(false)

    const [isReportSended, setIsReportSended] = useState(false)

    const restrictedReports = moment().startOf('day') > moment(festival?.dateReportEnd, 'DD-MM-YYYY')

    useEffect(() => {
        if (activeNomination) {
            getActivities(activeNomination?._id, localStorage.getItem('_amateum_tkn'))
                .then(resp => {
                    setActivitiesData(resp?.data)
                    setIsNeedUpdate(false)
                    setStage(localStorage.getItem(`${activeNomination?._id}_stage`) || 0)
                    setIsReportSended(localStorage.getItem(`${activeNomination?._id}_isReportSended`) || preloadData?.query?.attachmentReports?.[activeNomination?._id])
                })
        }
    }, [activeNomination?._id, isNeedUpdate])

    const nextStage = () => {
        localStorage.setItem(`${activeNomination?._id}_stage`, '1')
        setStage(1)
    }

    const updateIsReportSended = () => {
        localStorage.setItem(`${activeNomination?._id}_isReportSended`, 'true')
        setIsReportSended(true)
    }

    const prevStage = () => {
        localStorage.removeItem(`${activeNomination?._id}_stage`)
        localStorage.removeItem(`${activeNomination?._id}_isDownload`)
        setStage(0)
    }

    return <div className='reports'>
        {
            isReportSended ? <ReportSent
                activeNomins={activeNomination}
                preloadData={preloadData}
            /> : restrictedReports ? (
                <div className='reports__restricted'>
                    <i className='pi pi-calendar-times'/>
                    <div className='reports__restricted-content'>
                        <div className='reports__restricted-title'>
                            Период подачи отчетов  завершён
                        </div>
                    </div>
                </div>
            ) : stage === 0 ?
                <ReportsBlock
                    nextStage={nextStage}
                    activitiesData={activitiesData}
                    activeNomination={activeNomination}
                    setIsNeedUpdate={setIsNeedUpdate}
                    preloadData={preloadData}
                />
                : <SendReport
                    prevStage={prevStage}
                    activitiesData={activitiesData}
                    setIsReportSended={updateIsReportSended}
                    activeNomins={activeNomination}
                    nominationId={activeNomination?._id}
                />
        }
    </div>
}))

export default Reports