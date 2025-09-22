import ReportsBlock from "../../Reports/ReportsBlock/index.jsx";

import './style.scss'

const Reports = ({ data }) => {

    return (
        <div className="archive-reports">
            {data?.nominations?.map((n, k) => (
                <ReportsBlock key={k} activeNomination={n} activitiesData={data?.reports?.find(r => r.nominationId === n._id)} isArchive={true}/>
            ))}
        </div>
    )
}

export default Reports