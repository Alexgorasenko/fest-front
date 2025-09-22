import {useContext, useEffect, useRef} from "react";
import {Toast} from "primereact/toast";
import {useNavigate, useParams} from "react-router-dom";

import Detail from "./Detail/index.jsx";
import List from "./List/index.jsx";
import SvrContext from "../ctx.js";

const Reports = () => {
    const toast = useRef(null);
    const { space, setSpace } = useContext(SvrContext)
    const toastMessage = space?.toast || null
    const path = !!(space?.path)

    const { secondParam } = useParams()
    const navigator = useNavigate();

    useEffect(() => {
        if (toastMessage) {
            toast.current.show(toastMessage);
            setSpace(prev => ({ ...prev, toast: null }))
        }
    }, [toastMessage])

    useEffect(() => {
        setSpace(prev => !secondParam ? ({
            ...prev,
            path: null
        }) : prev)

    }, [secondParam]);

    useEffect(() => {
        if (!space?.path && secondParam){
            navigator('/reviews')
        }
    }, [space]);

    const Specified = path ? Detail : List

    return <>
        <Toast ref={toast} />
        <Specified />
    </>
}

export default Reports