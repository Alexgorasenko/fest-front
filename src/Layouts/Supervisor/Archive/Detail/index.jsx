import Archive from "../../../../Components/Archive";

const Detail = ({ activeOrg, token, handleSvrBack }) => {
    return (
        <div className="archive-detail">
            <Archive svrArchiveData={activeOrg} token={token} handleSvrBack={handleSvrBack}/>
        </div>
    )
}

export default Detail