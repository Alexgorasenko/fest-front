import {useContext, useEffect} from "react";
import {useParams} from "react-router-dom";

import SvrContext from "../../ctx.js";
import List from "./List/index.jsx";
import Report from "./Report/index.jsx";

const Detail = () => {
    const { space, setSpace } = useContext(SvrContext)
    const { thirdParam } = useParams()

    useEffect(() => {
        setSpace(prev => !thirdParam ? ({
            ...prev,
            path: [...prev.path.slice(0,2)]
        }) : prev)

    }, [thirdParam]);

    const Specified = thirdParam ? Report : List

    return <>
        <Specified/>
    </>
}

export default Detail