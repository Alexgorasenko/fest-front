import {useNavigate} from "react-router-dom";

import {handleDownloadFile} from "../../../utils.js";

import './style.scss'

const Tabs = ({ data }) => {
    const navigator = useNavigate()

    const handleTab = async (tab) => {
        if (!tab.file) {
            navigator(tab.link)
            return
        }

        await handleDownloadFile(data.certificate)
    }

    return (
        <div className="archive-tabs">
            {tabs.map((t, k) => (
                <div key={k} className="archive-tabs__tab" onClick={() => handleTab(t)}>
                    <span>{t.label}</span>
                    <i className={t.icon}/>
                </div>
            ))}
        </div>
    )
}

const tabs = [
    {label: "Заявки на участие", icon: "pi pi-chevron-right", link: "/archive/queries"},
    {label: "Отчёты о мероприятиях", icon: "pi pi-chevron-right", link: "/archive/reports"},
    {label: "Сертификат участника", icon: "pi pi-download", file: true}
]

export default Tabs