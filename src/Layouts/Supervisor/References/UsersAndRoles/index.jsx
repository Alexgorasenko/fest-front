import {useContext, useEffect, useRef} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Toast} from "primereact/toast";

import SvrContext from "../../ctx.js";
import Detail from "../UsersAndRoles/Detail/index.jsx";
import List from "../UsersAndRoles/List/index.jsx";
import Modal from "../Festivals/Modal/index.jsx";

const UsersAndRoles = () => {
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
            navigator('/users-and-roles')
        }
    }, [space]);

    const Specified = path ? Detail : List

    return (
        <>
            <Toast ref={toast} />
            <Modal/>
            <Specified/>
        </>
    )
}

export default UsersAndRoles