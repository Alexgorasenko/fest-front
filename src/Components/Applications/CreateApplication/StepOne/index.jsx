import './style.scss'

import OrganizationQueryData from "./OrganizationQueryData/index.jsx";
import Nominations from "./Nominations/index.jsx";
import {ScrollPanel} from "primereact/scrollpanel";
import Director from "./Director/index.jsx";
import ContactPerson from "./ContactPerson/index.jsx";
import {Button} from "primereact/button";
import {useEffect, useRef, useState} from "react";
import {Toast} from "primereact/toast";
import {pathQuery} from "../../../../Layouts/Supervisor/Apps/service.js";

const StepOne = ({updateActiveStep, queryId, data, updateData, svrFlow, token}) => {
    const [dataRequired, setDataRequired] = useState(false)

    const [orgDataRequired, setOrgDataRequired] = useState(false)
    const [nominsRequired, setNominsDataRequired] = useState(false)
    const [directorRequired, setDirectorDataRequired] = useState(false)
    const [contactPersonRequired, setContactPersonDataRequired] = useState(false)
    const [visibleError, setVisibleError] = useState(false)

    useEffect(() => {
        if (orgDataRequired && nominsRequired && directorRequired && contactPersonRequired) {
            setDataRequired(true)
        } else setDataRequired(false)
    }, [contactPersonRequired, directorRequired, nominsRequired, orgDataRequired])

    const toast = useRef(null);

    const nextStepClick = () => {
        if (dataRequired) {
            if (!svrFlow) {
                updateActiveStep(1)
            } else pathQuery(data, queryId, token).then(toast.current.show({severity: 'success', detail: 'Отчет успешно сохранен', life: 3000}))
        } else {
            toast.current.show({severity: 'error', detail: 'Заполните все поля', life: 3000});
            setVisibleError(true)
        }
    }

    return <>
        <Toast ref={toast} />
            <div className={'form-list'}>
                {data?.moderatorData && !svrFlow ?
                    <div className={'form'}>
                        <div className={'title'}>
                            Исправьте ошибки и попробуйте еще раз подать заявление <i className="pi pi-exclamation-triangle"/>
                        </div>
                        <div className={'meta'}>
                            {data?.moderatorData?.comment}
                        </div>
                    </div> : null
                }
                <OrganizationQueryData
                    queryId={queryId}
                    defData={data?.organizationQueryData}
                    dataRequired={orgDataRequired}
                    updateDataRequired={setOrgDataRequired}
                    updateData={updateData}
                    moderData={data?.moderatorData?.moderCheckList[0]}
                    toast={toast}
                    visibleError={visibleError}
                    svrFlow={svrFlow}
                    token={token}
                />
                <Nominations
                    queryId={queryId}
                    defData={data?.nominations}
                    dataRequired={nominsRequired}
                    updateDataRequired={setNominsDataRequired}
                    updateData={updateData}
                    moderData={data?.moderatorData?.moderCheckList[1]}
                    visibleError={visibleError}
                    nominationFest={data?.festival?.nominations}
                    svrFlow={svrFlow}
                />
                <Director
                    queryId={queryId}
                    defData={data?.director}
                    dataRequired={directorRequired}
                    updateDataRequired={setDirectorDataRequired}
                    updateData={updateData}
                    moderData={data?.moderatorData?.moderCheckList[2]}
                    visibleError={visibleError}
                    svrFlow={svrFlow}
                />
                <ContactPerson
                    queryId={queryId}
                    defData={data?.contactPerson}
                    dataRequired={contactPersonRequired}
                    updateDataRequired={setContactPersonDataRequired}
                    updateData={updateData}
                    moderData={data?.moderatorData?.moderCheckList[3]}
                    visibleError={visibleError}
                    svrFlow={svrFlow}
                />
                <Button onClick={() => nextStepClick()} id='nextStep' className={'next-step'}>{!svrFlow ? 'Следующий шаг' : 'Сохранить'}</Button>
            </div>
    </>
}

export default StepOne
