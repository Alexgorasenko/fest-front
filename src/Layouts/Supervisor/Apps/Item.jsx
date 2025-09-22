import {useState, useEffect, useContext, useRef} from 'react'

import { Button } from 'primereact/button'
import { ScrollPanel } from 'primereact/scrollpanel'
import { InputTextarea } from 'primereact/inputtextarea'
import moment from 'moment'

import SvrContext from '../ctx'
import { fetchApplication, applyDecision } from '../service'

import { Dialog } from 'primereact/dialog'

import Checklist from './Checklist'
import Attachment from './Attachment'

import './item.scss'
import {useNavigate} from "react-router-dom";

const statuses = {
    NEED_MODERATION: 'Необработанная заявка',
    NOT_VALID: 'Отклоненная заявка',
    VALID: 'Верифицированная заявка'
}

const Item = ({ id, toast, updateToastMessage }) => {

    const [data, setData] = useState(null)
    const [attachmentModal, setAttachmentModal] = useState(false)
    const [comment, setComment] = useState('')
    const [completedChecklist, setCompletedChecklist] = useState(false)
    const [progress, setProgress] = useState(false)
    const [moderCheckList, setModerCheckList] = useState([])

    const { token } = useContext(SvrContext)

    const navigator = useNavigate()

    useEffect(() => {
        if(id) {
            fetchApplication(id, token)
                .then(data => {
                    setData(data)
                    setModerCheckList(data?.meta?.moderatorData?.moderCheckList || data.checklist.map(section => {
                        return section.list.map(b => false)
                    }))
                    setComment(data?.meta?.moderatorData?.comment || '')
                })
        }
    }, [id])

    const handleApplication = () => {
        setProgress(true)
        if(completedChecklist) {
            applyDecision(id, {decision: true, moderCheckList: moderCheckList}, token)
                .then(resp => {
                    if (resp.success){
                        setProgress(false)
                        navigator('/apps')
                        updateToastMessage('Заявка принята')
                    }
                })
        } else {
            applyDecision(id, {decision: false, comment: comment, moderCheckList: moderCheckList}, token)
                .then(resp => {
                    if (resp.success){
                        setProgress(false)
                        navigator('/apps')
                        updateToastMessage('Заявка отклонена')
                    }
                })
        }
    }

    return  data ? <div className='app-item'>
                <div className='item-top'>
                    <div className='info'>
                        <div className='title'>{statuses[data?.meta?.status]}</div>
                        <div className='meta'>{data.meta.datetime ? `Заявка подана ${moment(data.meta.datetime).format('DD.MM.YYYY HH:mm')}` : null}</div>
                    </div>

                    {data.meta.status === 'VALID' ?
                        <div className={'meta-info'}>
                            Принял(-а) {moment(data.meta.datetime, 'YYYY-MM-DD HH:mm').format('DD.MM.YYYY')} {moment(data.meta.datetime, 'YYYY-MM-DD HH:mm').format('HH:mm')}
                        </div>
                        : data.meta.status === 'NOT_VALID' ? <div className={'meta-info'}>
                            Отклонил(-а) {moment(data.meta.datetime, 'YYYY-MM-DD HH:mm').format('DD.MM.YYYY')} {moment(data.meta.datetime, 'YYYY-MM-DD HH:mm').format('HH:mm')}
                        </div>
                        : data.meta.status === 'ARCHIVED' ? null
                        : <div className='action'>
                            <Button
                                className={`p-button-sm ${completedChecklist ? 'positive' : 'negative'}`}
                                label={completedChecklist ? 'Принять заявку' : 'Отклонить заявку'}
                                disabled={!completedChecklist && (!comment || comment.length < 5)}
                                onClick={() => handleApplication()}
                                loading={progress}
                            />
                        </div>
                    }
                </div>

                <div className='item-content'>
                    <div className='checklist panel'>
                        <div className='title _sub'>Отметьте корректное</div>
                        <ScrollPanel>
                            <Checklist
                                data={data.checklist}
                                moderCheckList={moderCheckList}
                                setCompleted={setCompletedChecklist}
                                updateCheckList={setModerCheckList}
                                status={data?.meta?.status === 'NOT_VALID' || data?.meta?.status === 'VALID' || data?.meta?.status === 'ARCHIVED'}
                            />
                        </ScrollPanel>
                    </div>

                    <div className='tools'>
                        <div className='panel comment'>
                            <div className='title _sub'>Что надо исправить</div>
                            <div className='title_disclaimer'>Если не все пункты отмечены как корректные, то укажите, что надо исправить</div>
                            <InputTextarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                disabled={data?.meta?.status === 'NOT_VALID' || data?.meta?.status === 'VALID' || data?.meta?.status === 'ARCHIVED'}
                            />
                        </div>

                        <div className='preview panel'>
                            <div className='preview_head'>
                                <div className='title _tretiary'>Прикрепленный файл</div>
                            </div>
                            <div className='preview_body'>
                                <Attachment data={data.attachment} setAttachmentModal={setAttachmentModal} />
                            </div>
                        </div>
                    </div>
                </div>

                {data.attachment ? (
                    <Dialog style={{width: '75vw'}} visible={attachmentModal} onHide={() => setAttachmentModal(false)}>
                        <Attachment data={data.attachment} isModal={attachmentModal}/>
                    </Dialog>
                ) : null}
            </div> : null
}

export default Item
