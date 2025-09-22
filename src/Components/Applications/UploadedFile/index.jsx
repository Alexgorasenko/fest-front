import './style.scss'
import {Tag} from "primereact/tag";
import {useState} from "react";
import {Button} from "primereact/button";
import axios from "axios";
import {ENDPOINT} from "../../../env.js";

const responses = {
    '400': 'Файл не найден'
}

const UploadedFile = ({data, svr, toast}) => {
    const [loading, setLoading] = useState(false)

    const download = async () => {
        setLoading(true)

        try {
            const response = await axios.get(`${ENDPOINT}userflow/get_attachment/${svr ? data : data?._id}`, {
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'application/octet-stream',
                    'Authorization': localStorage.getItem('_amateum_tkn') || localStorage.getItem('_amateum_svr')
                }})

            if(!response.error && response.succes !== false ) {
                const blob = new Blob([response.data], {type: 'application/octet-stream'})
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = `Заявка на участие.pdf`
                link.click()
                setLoading(false)
            }
        } catch (e) {
            toast.current.show({severity:'error', detail:responses[e.response.status], life: 3000});
            setLoading(false)
        }
    }

    return <div className={'uploaded-file'}>
        <div className={`uploaded-file-row${svr ? ' svr' : ''}`}>
            {!svr ? <>
                    <div className={'uploaded-file-col first'}>
                        <Tag icon={'pi pi-file'} className={'with-icon'}/>
                        <div className={'uploaded-file-col-text'}>{data?.name || data?.filename}</div>
                    </div>
                    <div className={'uploaded-file-col'}>
                        <Tag value={`${(data?.size / 1000000).toFixed(1)} MB`}/>
                    </div>
                </> : null
            }
            <div className={`uploaded-file-col${svr ? ' svr' : ''}`}>
                <Button
                    onClick={() => download()}
                    disabled={loading}
                    iconPos="center"
                    icon={'pi pi-download'}
                    loading={loading}
                    className={'uploaded-file-button'}
                />
            </div>
        </div>
    </div>
}

export default UploadedFile