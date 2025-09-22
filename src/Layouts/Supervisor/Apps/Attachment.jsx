import {useRef, useState} from 'react'
import { pdfjs, Document, Page } from 'react-pdf'
import {Button} from "primereact/button";
// import { ENDPOINT } from '../../../env'

// const STORAGE = 'https://preprod-api-fests.rfs.ru/'
// const STORAGE = 'https://api-fests.rfs.ru/'
// const STORAGE = 'http://localhost:5000/'
const STORAGE = 'https://s3.megafon.cloud/fstbe2-fs/'
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

import './attachment.scss'

const Attachment = ({ data, setAttachmentModal, isModal }) => {
    const containerRef = useRef()
    const mode = data?.path && data?.path?.toLowerCase()?.includes('.pdf') ? 'pdf' : 'image'
    const [rotate, setRotate] = useState(0)

    return  data ? [
        !isModal ?
            <div className={'attachment-btn-group'} key='file-buttons'>
                <Button
                    onClick={() => setRotate(rotate - 90)}
                    className={'attachment-btn-group__button'}
                    icon={'pi pi-replay'}
                />
                <Button
                    onClick={() => setRotate(rotate + 90)}
                    className={'attachment-btn-group__button'}
                    icon={'pi pi-refresh'}
                />
        </div> : null,
        <div key="file" ref={containerRef} className='attachment' onClick={() => setAttachmentModal ? setAttachmentModal(true) : null}>
            {mode === 'pdf' ? (
                <Document file={`${STORAGE}${data.path}`} rotate={rotate}>
                    {isModal ?
                        <div className={'attachment-btn-group'}>
                            <Button
                                onClick={() => setRotate(rotate - 90)}
                                className={'attachment-btn-group__button'}
                                icon={'pi pi-replay'}
                            />
                            <Button
                                onClick={() => setRotate(rotate + 90)}
                                className={'attachment-btn-group__button'}
                                icon={'pi pi-refresh'}
                            />
                        </div> : null
                    }
                    <Page pageNumber={1} orientation='landscape'/>
                </Document>
            ) : (
                <div className='attachment__image-container'>
                    {isModal ?
                        <div className={'attachment-btn-group'}>
                            <Button
                                onClick={() => setRotate(rotate - 90)}
                                className={'attachment-btn-group__button'}
                                icon={'pi pi-replay'}
                            />
                            <Button
                                onClick={() => setRotate(rotate + 90)}
                                className={'attachment-btn-group__button'}
                                icon={'pi pi-refresh'}
                            />
                        </div> : null
                    }
                    <img src={`${STORAGE}${data.path}`} style={{transform: `rotate(${rotate}deg)`}}/>
                </div>
            )}
        </div>
    ] : 'Скан заявки не загружен'
}

export default Attachment
