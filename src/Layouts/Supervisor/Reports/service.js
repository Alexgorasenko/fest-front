import axios from 'axios'
import {ENDPOINT} from "../../../env.js";

const getReports = async (token, nominationId, activityId, page, limit = 10) => {
    try {
        const resp = await axios.get(
            `${ENDPOINT}svr/get_reports?limit=${limit}${(nominationId && activityId && page !== 'undefined') ? `&nominationId=${nominationId}&activityId=${activityId}&page=${page}` : ''}`,
            {
                headers: {
                    authorization: token
                }
            }
        )

        return resp.data
    } catch(e) {
        return []
    }
}

const getActivityReport = async (token, id) => {
    try {
        const resp = await axios.get(
            `${ENDPOINT}svr/get_activity_report/${id}`,
            {
                headers: {
                    authorization: token
                }
            }
        )

        return resp.data
    } catch(e) {
        return []
    }
}

export { getReports, getActivityReport }