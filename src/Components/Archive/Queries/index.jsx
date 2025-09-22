import Applications from "../../Applications/index.jsx";

import './style.scss'

const Queries = ({ data }) => {
    return (
        <div className="archive-queries">
            <Applications archiveData={data} />
        </div>
    )
}

export default Queries