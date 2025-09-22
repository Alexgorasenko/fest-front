import './style.scss'
import {Steps} from "primereact/steps";
import {useState} from "react";
import StepOne from "./StepOne/index.jsx";
import StepTwo from "./StepTwo/index.jsx";

const items = [
    {
        label: 'Печать отчёта'
    },
    {
        label: 'Загрузка отчёта'
    }
];

const steps = [StepOne, StepTwo]

const SendReport = ({prevStage, activitiesData, setIsReportSended, activeNomins, nominationId}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDownload, setIsDownload] = useState(localStorage.getItem(`${nominationId}_isDownload`) || false)

    const Specified = steps[activeIndex]

    return <div className={'send-report'}>
        <div className={'progress'}>
            <Steps
                model={items}
                activeIndex={activeIndex}
                onSelect={(e) => {
                    if (e.index < activeIndex){
                        setActiveIndex(e.index)
                    }
                }}
                readOnly={false}
                className={activeIndex === 0 ? 'first' : 'second'}
            />
        </div>
        <Specified
            updateActiveStep={setActiveIndex}
            isDownload={isDownload}
            updateIsDownload={setIsDownload}
            prevStage={prevStage}
            setIsReportSended={setIsReportSended}
            activeNomins={activeNomins}
            nominationId={nominationId}
            queryId={activitiesData?.queryId}
        />
    </div>
}

export default SendReport