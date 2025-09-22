import './style.scss'

import Report from "./Report/index.jsx";

import {Accordion, AccordionTab} from "primereact/accordion";
import {Fragment, useEffect, useRef, useState} from "react";
import {Tag} from "primereact/tag";
import {Button} from "primereact/button";
import {confirmDialog} from "primereact/confirmdialog";
import {Toast} from "primereact/toast";
import {Tooltip} from "primereact/tooltip";
import moment from "moment";
import {formatToOneDecimal, pluralForm} from "../../../utils.js";

const formatText = (count) => {
    if (count % 10 === 1 && (Math.round(count / 10) !== 1)) {
        return ``
    } else if ([2, 3, 4].includes(count % 10) && (Math.round(count / 10) !== 1)){
        return `а`
    } else {
        return 'ов'
    }
}

const ReportsBlock = ({ nextStage, activitiesData, activeNomination, setIsNeedUpdate, preloadData, isArchive = false }) => {
    const [accordionIndex, setAccordionIndex] = useState(null)
    const [isVisible, setIsVisible] = useState(true)
    const [countOfNomins, setCountOfNomins] = useState(0)

    const toast = useRef()

    useEffect(() => {
        setCountOfNomins(preloadData?.query?.nominations?.filter(n => n.handle).length)
    }, [preloadData]);

    const hasExtraPointsFinishedVideo = (preloadData?.festival?.extraPointsFinishedVideo && preloadData?.festival?.finishedVideoActivityId && activitiesData?.activities?.find(a => a._id === preloadData?.festival?.finishedVideoActivityId)?.activityScore) || 0

    const complete = () => {
        confirmDialog({
            message: 'После отправки отчетов участие в фестивале будет завершено',
            header: 'Перейти к отправке отчетов?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                nextStage()
            },
            acceptLabel: 'Продолжить',
            rejectLabel: 'Отмена'
        });
    }

    const onCloseReport = (status, message) => {
        if (status) {
            setAccordionIndex(null)
            setIsVisible(true)
            setIsNeedUpdate(true)
            toast.current.show({severity: 'success', detail: message, life: 3000});
        } else {
            toast.current.show({severity: 'error', detail: message, life: 3000});
        }
    }

    const getAllCount = (type) => {
        switch (type) {
            case "hasExtraPointsFinishedVideo": return preloadData?.festival?.extraPointsFinishedVideo
            case "earlyRegistrationPoints": return preloadData?.festival?.commonCountingSettings?.earlyRegistration?.points
            case "activitiesScores": {
                return activitiesData?.activities?.reduce((sum, item) => {
                    return sum + (item.activityMaxPoints || 0);
                }, 0)
            }
            case "totalCountFinishedPoints": return preloadData?.festival?.commonCountingSettings?.totalCountFinished?.intervals?.[preloadData?.festival?.commonCountingSettings?.totalCountFinished?.intervals?.length - 1]?.points
        }
    }

    const isShowCount = (type) => {
        switch (type) {
            case "hasExtraPointsFinishedVideo": return !hasExtraPointsFinishedVideo
            default: return activitiesData?.summary?.[type] < getAllCount(type)
        }
    }

    const getStyle = (type, classname) => {
        switch (type) {
            case "hasExtraPointsFinishedVideo": return hasExtraPointsFinishedVideo ? `${classname}_finished` : ""
            default: return activitiesData?.summary?.[type] >= getAllCount(type) ? `${classname}_finished` : activitiesData?.summary?.[type] > 0 ? `${classname}_started` : ""
        }
    }

    const getDescription = (type) => {
        switch (type) {
            case "hasExtraPointsFinishedVideo": return !hasExtraPointsFinishedVideo && "Вы еще не загрузили"
            case "activitiesScores": return `Проведено ${activitiesData?.summary?.activitiesReported} из ${activitiesData?.activities?.length}`
            case "totalCountFinishedPoints": {
                if (!(preloadData?.festival?.commonCountingSettings?.totalCountFinished && activitiesData?.summary)) return;
                const { intervals, deadLine } = preloadData?.festival?.commonCountingSettings?.totalCountFinished;
                const { activitiesReported } = activitiesData?.summary;

                const deadlineDate = moment(deadLine, "YYYY-MM-DD").format("DD.MM");

                const sorted = [...intervals].sort((a, b) => Number(a.min) - Number(b.min));

                let currentPoints = 0;
                for (let i = 0; i < sorted.length; i++) {
                    if (activitiesReported >= Number(sorted[i].min)) {
                        currentPoints = Number(sorted[i].points) || 0;
                    } else {
                        break;
                    }
                }

                const next = sorted.find(it => activitiesReported < Number(it.min));
                if (!next) return "";

                const reportsLeft = Number(next.min) - activitiesReported;
                const pointsDiff = Math.max(0, Number(next.points) - currentPoints);

                return pointsDiff > 0 && `Еще ${reportsLeft} отчёта до ${deadlineDate} и +${pointsDiff} ${pluralForm(pointsDiff, ["балл", "балла", "баллов"])}`;
            }
        }
    }

    const getCount = (type) => {
        switch (type) {
            case "hasExtraPointsFinishedVideo": return hasExtraPointsFinishedVideo
            case "activitiesScores": {
                const score = activitiesData?.activities?.reduce((sum, item) => {
                    if (item._id === preloadData?.festival?.finishedVideoActivityId) return sum
                    return sum + item.activityScore
                }, 0)

                return formatToOneDecimal(score || 0)
            }
            default: return activitiesData?.summary?.[type]
        }
    }

    return (
        <div className={`reports-block ${isArchive ? "reports-block_archive" : ""}`}>
            <Toast ref={toast}/>

            <div className="reports-block__container">
                <div className="reports-block__title">
                    <div className="reports-block__name">{activeNomination?.name}</div>
                    <span>{activitiesData?.summary?.totalScores || 0} баллов</span>
                </div>

                {!isArchive && (
                    <div className="reports-block__points">
                        {pointItems.map((p,k) => (
                            <div key={k} className={`reports-block__point ${getStyle(p.key, "reports-block__point")}`}>
                                <div className="reports-block__numbers">
                                    <div className={`reports-block__number ${getStyle(p.key, "reports-block__number")}`}>
                                        {getCount(p.key)}
                                    </div>

                                    {isShowCount(p.key) && (
                                        <div className={`reports-block__number ${getStyle(p.key, "reports-block__number")}`}>/</div>
                                    )}

                                    {isShowCount(p.key) && (
                                        <div className={`reports-block__number ${getStyle(p.key, "reports-block__number")}`}>
                                            {getAllCount(p.key)}
                                        </div>
                                    )}
                                </div>
                                <span>{p.label}<br/>{getDescription(p.key)}</span>
                            </div>
                        ))}
                    </div>
                )}

                <Accordion
                    className={'accordion'}
                    activeIndex={accordionIndex}
                    onTabOpen={() => setIsVisible(false)}
                    onTabClose={() => setIsVisible(true)}
                    onTabChange={(e) => setAccordionIndex(e.index)}
                >
                    {activitiesData?.activities?.map(act => {
                        return <AccordionTab
                            key={act._id}
                            header={
                                <Fragment>
                                    <div className={'accordion-text'}>
                                        {act?.name}
                                    </div>
                                    {act?.activityScore ?
                                        <div className={'accordion-points'}>
                                            <div className={'report-points'}>
                                                {act?.activityScore + ' балл' + formatText(act?.activityScore)}
                                            </div>
                                            <Tag icon={'pi pi-check'}/>
                                        </div> : null
                                    }
                                </Fragment>
                            }
                        >
                            <Report
                                nominationId={activeNomination?._id}
                                festivalId={activitiesData?.festivalId}
                                activityId={act._id}
                                queryId={activitiesData?.queryId}
                                closeReport={onCloseReport}
                                preloadData={preloadData}
                                access={isArchive ? "archive" : false}
                            />
                        </AccordionTab>
                    })}
                </Accordion>
            </div>

            {isVisible && !isArchive ? <div className={`reports-next-stage-block${countOfNomins > 1 ? ' nomins' : ''}`}>
                {countOfNomins > 1 ?
                    <div className={'reports-next-stage-text'}>
                        Внимание! Ваша образовательная организация принимает участие в нескольких номинациях.
                        Сформировать итоговый отчёт необходимо будет для каждой номинации.
                    </div> : null
                }

                <div className={'reports-next-stage-btn-block'}>
                    <Tooltip
                        target=".disabled-button"
                        position={"top"}
                    >
                        Для формирования итогового отчёта<br/>необходимо заполнить информацию о<br/>проведении
                        минимум {preloadData?.festival?.minCountFinishedReports} мероприятий
                    </Tooltip>
                    <span className={`${!activitiesData?.summary?.finishButtonEnabled ? 'disabled-button' : ''}`}>
                        <Button
                            className={`reports-next-stage-btn`}
                            onClick={complete}
                            disabled={!activitiesData?.summary?.finishButtonEnabled}
                        >
                            Сформировать итоговый отчёт
                        </Button>
                    </span>
                    для "{activeNomination?.name}"
                </div>
            </div> : null}
        </div>
    )
}

const pointItems = [
    {label: "За раннюю  подачу заявки", key: "earlyRegistrationPoints"},
    {label: "За кол-во проведенных  мероприятий", key: "activitiesScores"},
    {label: "За раннюю загрузку отчётов ", key: "totalCountFinishedPoints"},
    {label: "Баллы за загруженный финальный ролик", key: "hasExtraPointsFinishedVideo"}
]

export default ReportsBlock