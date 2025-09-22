import { useContext, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'

import { Toast } from 'primereact/toast';

import List from './List'
import Detail from './Detail'
import Modal from './Modal'

import SvrContext from '../../ctx'

import 'moment/dist/locale/ru'

const Festivals = () => {
    const toast = useRef(null);
    const { secondParam } = useParams()
    const { space, setSpace } = useContext(SvrContext)
    const toastMessage = space && space.toast ? space && space.toast : null
    
    useEffect(() => {
        if (toastMessage) {
            toast.current.show(toastMessage);
        }

        return () => {
            setSpace(prev => ({ ...prev, toast: null }))
        };
    }, [toastMessage])

    const Specified = secondParam ? Detail : List

    return (
        <>
            <Toast ref={toast} />
            <Modal />
            <Specified />
        </>
    )
}

export default Festivals

// setSpace(prev => ({ ...prev, toast: { severity: 'info', summary: 'Info', detail: 'Message Content' }})) //toast example
