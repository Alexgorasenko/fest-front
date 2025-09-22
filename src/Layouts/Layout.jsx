import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom"

import {inject, observer} from "mobx-react";
import {computed} from "mobx";

import axios from "axios";
import {ENDPOINT} from "../env.js";

import {Toast} from "primereact/toast";

import PublicUser from "./PublicUser/index.jsx";
import Supervisor from "./Supervisor/index.jsx";
import Sidebar from "../Components/Sidebar/index.jsx";

import {initSupervisor} from "./Supervisor/service.js";

const Layout = inject('mainStore')(observer(({ mainStore, userToken, svrToken, data, updateToken, updateData, error, device, toastMessage, updateToastMessage, activeSubLink, updateActiveSubLink, preflow }) => {
    const queries = computed(() => mainStore.getMainStore('queries')).get();
    const festival = computed(() => mainStore.getMainStore('festival')).get();
    const { nominations } = festival

    const toast = useRef()

    const { firstParam } = useParams();
    const prevFirstParam = useRef(firstParam);
    const navigator = useNavigate()

    const [space, setSpace] = useState({})
    const [init, setInit] = useState(false)
    const [docs, setDocs] = useState(null)

    useEffect(() => {
        if (toastMessage?.value) {
            toast.current.show({severity: toastMessage?.status, detail: toastMessage?.value, life: 3000});
            updateToastMessage({status: '', value: ''})
        }
    }, [toastMessage]);

    useEffect(() => {
        if (svrToken) {
            initSupervisor(svrToken)
                .then(data => {
                    if (data) {
                        setInit(true)
                        setSpace({ ...space, roles: data })
                        if (!userToken) navigator(data.region_admin?.canEdit?.length || data.region_admin?.canView?.length ? '/dashboard' : data.moderator ? '/apps' : '/festivals')
                    }
                })
        }
    }, [svrToken])

    useEffect(() => {
        if (prevFirstParam.current && prevFirstParam.current !== firstParam) {
            localStorage.removeItem('pagination');
            localStorage.removeItem('tabMenu');
            localStorage.removeItem('paginationSecond');
        }
        prevFirstParam.current = firstParam;
    }, [firstParam]);

    useEffect(() => {
        getDocs()
    }, []);

    const getDocs = () => {
        axios.get(`${ENDPOINT}userflow/get_public_docs`, {
            headers: {
                Authorization: localStorage.getItem('_amateum_svr')
            }
        }).then(resp => {
            if (resp && resp.data) {
                const { data } = resp.data
                const newData = defaultState.map(d => ({...d, item: data[d.key], file: data[`${d.key}File`] || null, collectionId: data._id}))
                setDocs(newData)
            }
        })
    }

    const logout = () => {
        localStorage.removeItem('_amateum_tkn')
        localStorage.removeItem('_amateum_svr')
        updateToken({svr: null, user: null})
        navigator('/auth')
        setSpace({})
        setInit(false)
        updateData(null)
    }

    return (
        <>
            <Toast ref={toast}/>

            {(!!userToken || !!svrToken) && (
                <Sidebar
                    updateToken={updateToken}
                    roles={{...space?.roles, public_user: !!userToken}}
                    logout={logout}
                    device={device}
                    activeSubLink={activeSubLink}
                    updateActiveSubLink={updateActiveSubLink}
                    preflow={preflow}
                    status={queries?.find(q => q.status === "VALID")?.status}
                    nominations={nominations?.filter(n => queries?.filter(q => q.status === "VALID")?.find(q => q.nominationId === n._id))}
                    docs={docs}
                />
            )}

            {!checkSvrPath(svrToken, window.location.pathname) && (
                <PublicUser
                    token={userToken}
                    data={data}
                    updateToken={updateToken}
                    updateData={updateData}
                    error={error}
                    device={device}
                    toastMessage={toastMessage}
                    updateToastMessage={updateToastMessage}
                    activeSubLink={activeSubLink}
                    updateActiveSubLink={updateActiveSubLink}
                    preflow={preflow}
                    docs={docs}
                />
            )}

            {!!svrToken && checkSvrPath(svrToken, window.location.pathname) && (
                <Supervisor
                    token={svrToken}
                    updateToken={updateToken}
                    updateData={updateData}
                    error={error}
                    device={device}
                    toastMessage={toastMessage}
                    updateToastMessage={updateToastMessage}
                    activeSubLink={activeSubLink}
                    updateActiveSubLink={updateActiveSubLink}
                    preflow={preflow}
                    space={space}
                    setSpace={setSpace}
                    init={init}
                    docs={docs}
                    updateDocs={getDocs}
                />
            )}
        </>
    );
}))

const svrPaths = ['festivals', 'users-and-roles', 'apps', 'account', 'samples', 'reviews', 'dashboard', 'instructions', 'load-data', 'logging', 'archive']

const checkSvrPath = (svrToken, path) => {
    return !!(svrToken && path && svrPaths.includes(path.split('/')[1]))
}

const defaultState = [
    {title: 'Политика обработки ПДн*', key: 'policy'},
    {title: 'Пользовательское соглашение*', key: 'userMsg'}
]

export default Layout