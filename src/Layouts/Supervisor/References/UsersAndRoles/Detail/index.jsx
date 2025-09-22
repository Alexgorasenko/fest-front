import {useParams} from "react-router-dom";

import UserCard from "./UserCard/index.jsx";


const Cards = {
    'role': UserCard,
    'user': UserCard
}

const Detail = () => {
    const { secondParam } = useParams()

    const Specified = secondParam ? Cards[secondParam] : null

    return Specified ? <Specified/> : null
}

export default Detail