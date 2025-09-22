import { useParams } from 'react-router-dom'

import List from './List'
import Detail from './Detail'

const Events = () => {
    const { fourthParam } = useParams()
    const Specified = fourthParam ? Detail : List

    return <Specified />
}

export default Events