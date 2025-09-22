import './style.scss'
import {useEffect, useState} from "react";

const ReportSent = ({activeNomins, preloadData}) => {
    const [countOfNomins, setCountOfNomins] = useState(0)

    useEffect(() => {
        setCountOfNomins(preloadData?.query?.nominations?.filter(n => n.handle).length)
    }, [preloadData]);

    return <div className={'report-sent'}>
        <div className={'status-block'}>
            <div className={'title-group'}>
                <i className={'pi pi-check-circle'}/>
                <div className={'title'}>
                    Итоговый отчёт в номинации «{activeNomins?.name}» успешно отправлен!
                    <span>
                        Итоги проведения Всероссийского фестиваля "Футбол в школе" будут опубликованы не позднее 15.07.2025 года
                    </span>
                </div>
            </div>
        </div>
        {countOfNomins > 1 ?
            <div className={'attention'}>
                <div className={'title'}>
                    Внимание! Ваша образовательная организация принимает участие в нескольких номинациях
                    <i className={'pi pi-info-circle'}/>
                </div>
                Сформировать итоговый отчёт необходимо для каждой номинации
            </div> : null
        }
    </div>
}

export default ReportSent