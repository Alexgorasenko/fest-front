import {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";

import PublicUserDashboard from '../../Components/Dashboard/PublicUserDashboard.jsx'
import Application from "../../Components/Applications/Application/index.jsx";
import PersonalAccount from "../../Components/PersonalAccount/index.jsx";
import Applications from "../../Components/Applications/index.jsx";
import Instruction from '../../Components/Instruction/index.jsx';
import EntryPoint from '../../Components/EntryPoint/index.jsx';
import Reports from "../../Components/Reports/index.jsx";
import Archive from "../../Components/Archive/index.jsx";
import Error from "../../Components/Error/index.jsx";
import Auth from "../Auth/index.jsx";

import './style.scss'

const PublicUser = ({ token, data, updateToken, updateData, error, device, updateToastMessage, activeSubLink, preflow, docs }) => {
    const { firstParam } = useParams();
    const navigator = useNavigate();

    useEffect(() => {
        if (!token) {
            if (checkPassPath()) return;

            navigator("/")
            return
        }
        if (!data && error) {
            navigator("/error")
            return;
        }

        if (data?.data?.query?.status === 'VALID' && !(window.location.pathname.includes('reports') || activeSubLink === -1)) {
            navigator("/reports")
            return;
        }

        if (!window.location.pathname.includes('applications/')) navigator("/applications")
    }, [token, data]);

    const Specified = firstParam && pages[firstParam] ? pages[firstParam] : EntryPoint

    return (
        <div className={`layout-public-user${token && data ? ' with-sidebar' : ''}`}>
            <Specified
                updateToastMessage={updateToastMessage}
                updateToken={updateToken}
                preflow={preflow}
                docs={docs}
                device={device}
                preloadData={data?.data}
                activeNomins={activeSubLink}
                data={data}
                updateData={updateData}
                token={token}
                roles={{public_user: true}}
            />

            {/*{*/}
            {/*    token ?*/}
            {/*        data ?*/}
            {/*            <>*/}
            {/*                {*/}
            {/*                    data?.data?.query?.status === 'VALID' ?*/}
            {/*                        window.location.pathname.includes('reports') || activeSubLink === -1 ? null :*/}
            {/*                            <Redirect to='/reports'/>*/}
            {/*                        : window.location.pathname.includes('application/') ? null :*/}
            {/*                            <Redirect to='/application'/>*/}
            {/*                }*/}
            {/*                <Route exact path='/application/:id'>*/}
            {/*                    <Application/>*/}
            {/*                </Route>*/}
            {/*                <Route exact path='/application'>*/}
            {/*                    <Applications data={data} updateData={updateData}/>*/}
            {/*                </Route>*/}
            {/*                <Route exact path='/account'>*/}
            {/*                    <PersonalAccount/>*/}
            {/*                </Route>*/}
            {/*                <Route exact path='/dashboard'>*/}
            {/*                    <PublicUserDashboard token={token}/>*/}
            {/*                </Route>*/}
            {/*                <Route exact path={'/reports'}>*/}
            {/*                    <Reports preloadData={data?.data} activeNomins={activeSubLink}/>*/}
            {/*                </Route>*/}
            {/*                <Route exact path='/instructions'>*/}
            {/*                    <Instruction roles={{public_user: true}}/>*/}
            {/*                </Route>*/}
            {/*            </> : error ?*/}
            {/*                <>*/}
            {/*                    /!*<Redirect to='/error'/>*!/*/}
            {/*                    /!*<Route exact path='/error'>*!/*/}
            {/*                    /!*    <Error/>*!/*/}
            {/*                    /!*</Route>*!/*/}
            {/*                </> : null :*/}
            {/*        <>*/}
            {/*            /!*{checkPassPath() ? null : <Redirect to='/'/>}*!/*/}

            {/*            <Route exact path="/auth">*/}
            {/*                <Auth updateToastMessage={updateToastMessage} updateToken={updateToken} preflow={preflow}*/}
            {/*                      docs={docs} device={device}/>*/}
            {/*            </Route>*/}
            {/*            <Route path="/auth/:secondParam">*/}
            {/*                <Auth updateToastMessage={updateToastMessage} updateToken={updateToken} preflow={preflow}*/}
            {/*                      docs={docs} device={device}/>*/}
            {/*            </Route>*/}

            {/*            <Route exact path="/">*/}
            {/*                <EntryPoint device={device} preflow={preflow}/>*/}
            {/*            </Route>*/}
            {/*        </>*/}
            {/*}*/}
        </div>
    )
}

const checkPassPath = () => {
    const paths = [
        'account/verify',
        'auth/recovery',
        'auth',
        'auth/registration'
    ]

    let output = false
    for(let p of paths) {
        if(window.location.pathname.includes(p)) {
            output = true
        }
    }

    return output
}

const pages = {
    auth: Auth,
    application: Application,
    applications: Applications,
    reports: Reports,
    account: PersonalAccount,
    archive: Archive,
    dashboard: PublicUserDashboard,
    instructions: Instruction,
    error: Error,
    x: () => null
}

export default PublicUser
