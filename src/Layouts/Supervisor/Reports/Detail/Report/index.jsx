import {useContext, useEffect, useState} from "react";
import {getActivityReport} from "../../service.js";
import SvrContext from "../../../ctx.js";
import ReportForm from "../../../../../Components/Reports/ReportsBlock/Report/index.jsx";
import {useNavigate} from "react-router-dom";

const Report = () => {
    const { space, setSpace, token } = useContext(SvrContext)

    const [reportData, setReportData] = useState(null)
    const [access, setAccess] = useState(null)

    const navigator = useNavigate()

    useEffect(() => {
        if(token) {
            getActivityReport(token, space?.path[2]?.key)
                .then(resp => {
                    setReportData(resp.data)
                    setAccess(resp.access)
                    if (resp.access === null){
                        onCloseReport(false, 'У вас нет доступа к просмотру этого отчета')
                        navigator(-1)
                    }
                })
        }
    }, [token])

    const onCloseReport = (status, message) => {
        if (status) {
            setSpace(prev => ({ ...prev, toast: { severity: 'success', summary: '', detail: message }}))
            navigator(-1)
        } else {
            setSpace(prev => ({ ...prev, toast: { severity: 'error', summary: '', detail: message }}))
        }
    }

    return reportData && access ? <ReportForm
        token={token}
        reportDataSvr={reportData}
        closeReport={onCloseReport}
        access={access}
    /> : null
}

export default Report