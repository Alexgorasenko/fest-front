import './style.scss'
import {Button} from "primereact/button";
import {useEffect, useState} from "react";
import service from "../../service.js";
import {Document, Page} from "react-pdf";
import {Skeleton} from "primereact/skeleton";

const StepTwo = ({updateActiveStep, queryId, isDownload, updateIsDownload}) => {
    const [progress, setProgress] = useState(false)
    const [obj, setObj] = useState(new Blob())

    useEffect(() => {
        setProgress(true)
        service.render({
            'url': `print/formQuery/${queryId}`
        }).then((resp) => {
            setObj(resp)
            setProgress(false)
        })
    }, [queryId]);

    const download = async () => {
        setProgress(true)

        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(obj)
        link.download = `Заявка на участие.pdf`
        link.click()

        updateIsDownload(true)
        setProgress(false)
        await service.updateQuery(queryId, {isPrintFormGetted: true})
    }

    return <div className={'step_two'}>
        <div className={'group'}>
            <div className={'title'}>
                Распечатайте заявку и подпишите <br/>у руководителя образовательной организации
                <span>
                    Вам необходимо распечатать заявку, <br/>проверить информацию и получить подпись
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
                    onClick={() => download()}
                    iconPos="right"
                    disabled={progress}
                    id='downloadForm'
                >
                    Скачать заявку
                </Button>
                { isDownload ?
                    <Button
                        className={'download_button'}
                        onClick={() => updateActiveStep(2)}
                        id='postDownloadBtn'
                    >
                        Перейти к следующему шагу
                    </Button> : null
                }
            </div>
        </div>
    </div>
}

export default StepTwo
