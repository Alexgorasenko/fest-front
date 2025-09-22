import { useParams } from 'react-router-dom'

import List from './List'
import Pages from './Pages'

const Detail = () => {
    const { thirdParam } = useParams()
    const Specified = thirdParam ? Pages : List

    return <Specified />
}

export default Detail