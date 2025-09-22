import {useEffect, useState} from 'react'
import axios from 'axios'

import { ENDPOINT } from '../../../env'

import Application from '../../../Components/Applications/Application'
import StepOne from "../../../Components/Applications/CreateApplication/StepOne/index.jsx";

const AppWrapper = ({ id, token }) => {
    const [data, setData] = useState(null)
    const [access, setAccess] = useState(null)

    useEffect(() => {
        if(id) {
            axios.get(`${ENDPOINT}svr/load_query/${id}`, {
                headers: {
                    authorization: token
                }
            }).then(resp => {
                setData(resp.data.entry)
                setAccess(resp.data.access)
            })
        }
    }, [id])

    const updateData = (key, value) => {
        setData(prev => ({...prev, [key]: value}))
    }

    return  access ? access === 'full' ? (
                <div className={'create-app'}>
                    <StepOne
                        queryId={id}
                        svrFlow={true}
                        data={data}
                        token={token}
                        updateData={updateData}
                    />
                </div>
            ) : (
                <div className='apps wrapped'>
                    <Application
                        appdata={data}
                    />
                </div>
            ) : null
}

export default AppWrapper
