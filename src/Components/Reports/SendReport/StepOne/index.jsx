import './style.scss'

import {render} from './../../service.js';

import {Skeleton} from "primereact/skeleton";
import {Document, Page} from "react-pdf";
import {Button} from "primereact/button";
import {useEffect, useState} from "react";

const StepOne = ({updateActiveStep, queryId, nominationId, isDownload, updateIsDownload, prevStage}) => {
    const [progress, setProgress] = useState(false)
    const [obj, setObj] = useState(new Blob())

    useEffect(() => {
        setProgress(true)
        render({
            'url': `print/getaActivitiesWithReports/${queryId}?nominationId=${nominationId}`
        }, localStorage.getItem('_amateum_tkn')).then((resp) => {
            setObj(resp)
            setProgress(false)
        })
    }, [queryId, nominationId]);

    const download = async () => {
        setProgress(true)

        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(obj)
        link.download = `Итоговый отчет.pdf`
        link.click()

        updateIsDownload(true)
        localStorage.setItem(`${nominationId}_isDownload`, 'true')
        setProgress(false)
    }

    return <div className={'step-one'}>
        <div className={'group'}>
            <div className={'title'}>
                Распечатайте итоговый отчёт, подпишите его и заверьте печатью<br/>у руководителя образовательной организации
                <span>
                    Для каждой номинации Вам необходимо распечатать итоговый отчёт, подписать и<br/>поставить печать у руководителя образовательной организации
                </span>
            </div>
            {progress ? <Skeleton shape="circle" /> :
                <Document file={obj}>
                    <Page pageNumber={1} orientation='landscape' />
                </Document>
            }
            <div className={'actions'}>
                <Button
                    className={`download_button${isDownload ? ' isClicked' : ''}`}
                    iconPos="right"
                    disabled={progress}
                    onClick={download}
                >
                    Скачать итоговый отчёт
                </Button>
                <Button
                    className={'download_button'}
                    onClick={() => updateActiveStep(1)}
                    visible={isDownload}
                    id='next_step_btn'
                >
                    Перейти к следующему шагу
                </Button>
            </div>
            <Button
                className={`prev-stage-btn`}
                icon={'pi pi-chevron-left'}
                onClick={() => prevStage()}
            >
                Вернуться к заполнению отчётов
            </Button>
        </div>
    </div>
}

export default StepOne
