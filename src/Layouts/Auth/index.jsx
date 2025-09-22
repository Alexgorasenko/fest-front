import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import Signin from "./Signin/index.jsx";
import Signup from "./Signup/index.jsx";
import Recovery from "./Recovery/index.jsx";
import Verify from "./Verify/index.jsx";

import mobileLogo from './img/logo-color.svg'

import './style.scss'

const Auth = ({ updateToken, requestPath, updateToastMessage, preflow, docs, device }) => {

    const { secondParam } = useParams()

    const Specified = wrap[secondParam] ? wrap[secondParam] : wrap['enter'];

    const [docsData, setDocsData] = useState({...defaultDocs})

    useEffect(() => {
        if (docs) {
            const newDocs = {}
            for (const d of docs) {
                newDocs[d.key] = d.item && d.item.linkActive && d.item[`${d.key}Link`] ? d.item[`${d.key}Link`] : d.file && d.file.fullpath ? d.file.fullpath : defaultDocs[d.key];
            }
            setDocsData(newDocs)
        }
    }, [docs]);

    return <div className='auth'>
        <div className='auth-background'>
            <div className='auth-background-container'>
                <div className='auth-background-title'>
                    {preflow?.titleShort}
                </div>
                <img src={device === 'mobile' ? mobileLogo : preflow?.logo} className='auth-background-container--img'/>
            </div>
        </div>
        <Specified
            updateToken={updateToken}
            requestPath={requestPath}
            updateToastMessage={updateToastMessage}
            preflow={preflow}
            docsData={docsData}
        />
    </div>
}

const wrap = {
    'enter': Signin,
    'registration': Signup,
    'recovery': Recovery,
    'complete': Verify
}

const defaultDocs = {policy: 'https://www.rfs.ru/static/rfs-privacy-policy.pdf', userMsg: '/docs/terms.pdf'}

export default Auth
