import {useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";

import SvrContext from './ctx'

import Apps from './Apps'
import Samples from "./Samples"
import Reports from "./Reports/index.jsx";
import Festivals from "./References/Festivals";
import UsersAndRoles from "./References/UsersAndRoles/index.jsx";
import PersonalAccount from "../../Components/PersonalAccount/index.jsx";
import Dashboard from "../../Components/Dashboard/index.jsx";
import Instruction from '../../Components/Instruction/index.jsx';
import Archive from "./Archive";
import LoadData from "./LoadData";
import Logging from "./Logging";

import './style.scss'

const Supervisor = ({ token, space, setSpace, init, docs, updateDocs }) => {
    const { firstParam } = useParams();

    const Specified = firstParam && pages[firstParam] ? pages[firstParam] : Festivals

    return (
        <SvrContext.Provider value={{ space, setSpace, token }}>
            <div className='layout-public-user svr'>
                {init && <Specified roles={space.roles} token={token} docs={docs} updateDocs={updateDocs}/>}

                {/*{init ?*/}
                {/*    <Switch>*/}
                {/*        <Route exact path='/festivals/:second/:third/:fourth'>*/}
                {/*            <Festivals />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/festivals/:second/:third'>*/}
                {/*            <Festivals />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/festivals/:second'>*/}
                {/*            <Festivals />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/festivals'>*/}
                {/*            <Festivals />*/}
                {/*        </Route>*/}
                {/*        <Route path='/users-and-roles/:chapter/:id'>*/}
                {/*            <UsersAndRoles />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/users-and-roles'>*/}
                {/*            <UsersAndRoles />*/}
                {/*        </Route>*/}
                {/*        <Route path='/apps/:appId?'>*/}
                {/*            <Apps roles={space.roles} />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/account'>*/}
                {/*            <PersonalAccount />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/samples'>*/}
                {/*            <Samples token={token} />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/reviews/:second/:third'>*/}
                {/*            <Reports token={token} />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/reviews/:second'>*/}
                {/*            <Reports token={token} />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/reviews'>*/}
                {/*            <Reports token={token} />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/dashboard'>*/}
                {/*            <Dashboard token={token} />*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/instructions'>*/}
                {/*            <Instruction roles={space.roles}/>*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/load-data'>*/}
                {/*            <LoadData token={token} docs={docs} updateDocs={updateDocs}/>*/}
                {/*        </Route>*/}
                {/*        <Route exact path='/logging'>*/}
                {/*            <Logging token={token}/>*/}
                {/*        </Route>*/}
                {/*    </Switch> : null*/}
                {/*}*/}
            </div>
        </SvrContext.Provider>
    )
}

const pages = {
    festivals: Festivals,
    "users-and-roles": UsersAndRoles,
    apps: Apps,
    samples: Samples,
    reviews: Reports,
    account: PersonalAccount,
    instructions: Instruction,
    dashboard: Dashboard,
    "load-data": LoadData,
    logging: Logging,
    archive: Archive,
    x: () => null
}

export default Supervisor
