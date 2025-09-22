import { useParams } from 'react-router-dom'

import Points from './Points'
import Nominations from './Nominations'
import Events from './Events'

const Pages = () => {
    const { thirdParam } = useParams()
    const Specified = thirdParam && pages[thirdParam] ? pages[thirdParam] : Points

    return <Specified />
}

const pages = {
    points: Points,
    nominations: Nominations,
    events: Events,
}

export default Pages