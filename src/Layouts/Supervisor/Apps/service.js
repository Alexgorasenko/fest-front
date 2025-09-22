import axios from "axios";
import {ENDPOINT} from "../../../env.js";

const pathQuery = async (body, id, token) => {
    try {
        const resp = await axios.put(`${ENDPOINT}svr/patch_query/${id}`, body, {
            headers: {
                authorization: token
            }
        })

        return resp.data
    } catch (e) {
        return null
    }
}

export { pathQuery }