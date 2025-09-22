import './style.scss'

const Application = ({appdata}) => {

    return <div className={'application'}>
        <div className={'block'}>
            <div className={'block-title'}>
                Данные организации
            </div>
            <div className={'fields'}>
                <div className={'field'}>
                    <div className={'field-title'}>
                        Полное наименование организации
                    </div>
                    <div className={'field-content'}>
                        {appdata?.organizationQueryData?.fullName}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        ИНН организации
                    </div>
                    <div className={'field-content'}>
                        {appdata?.organizationQueryData?.inn}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        ОГРН организации
                    </div>
                    <div className={'field-content'}>
                        {appdata?.organizationQueryData?.ogrn}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        КПП организации
                    </div>
                    <div className={'field-content'}>
                        {appdata?.organizationQueryData?.kpp}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Официальный сайт
                    </div>
                    <div className={'field-content'}>
                        {appdata?.organizationQueryData?.site}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Субъект РФ
                    </div>
                    <div className={'field-content'}>
                        {appdata?.organizationQueryData?.address?.region?.name}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Почтовый адрес
                    </div>
                    <div className={'field-content'}>
                        {appdata?.organizationQueryData?.address?.display}
                    </div>
                </div>

            </div>
        </div>
        <div className={'block'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="959" height="2" viewBox="0 0 959 2" fill="none">
                <path d="M0 1H959" stroke="#DFE7EF"/>
            </svg>
            <div className={'block-title'}>
                Руководитель образовательной организации
            </div>
            <div className={'fields'}>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        ФИО
                    </div>
                    <div className={'field-content'}>
                        {appdata?.director?.fullname}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Должность
                    </div>
                    <div className={'field-content'}>
                        {appdata?.director?.post}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Телефон образовательной организации
                    </div>
                    <div className={'field-content'}>
                        {appdata?.director?.phone}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Почта образовательной организации
                    </div>
                    <div className={'field-content'}>
                        {appdata?.director?.email}
                    </div>
                </div>
            </div>
        </div>
        <div className={'block'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="959" height="2" viewBox="0 0 959 2" fill="none">
                <path d="M0 1H959" stroke="#DFE7EF"/>
            </svg>
            <div className={'block-title'}>
                Ответственное лицо за проведение фестиваля
            </div>
            <div className={'fields'}>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        ФИО
                    </div>
                    <div className={'field-content'}>
                        {appdata?.contactPerson?.fullname}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Должность
                    </div>
                    <div className={'field-content'}>
                        {appdata?.contactPerson?.post}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Телефон
                    </div>
                    <div className={'field-content'}>
                        {appdata?.contactPerson?.phone}
                    </div>
                </div>
                <div className={'field small'}>
                    <div className={'field-title'}>
                        Почта
                    </div>
                    <div className={'field-content'}>
                        {appdata?.contactPerson?.email}
                    </div>
                </div>
            </div>
        </div>
        <div className={'block'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="959" height="2" viewBox="0 0 959 2" fill="none">
                <path d="M0 1H959" stroke="#DFE7EF"/>
            </svg>
            {appdata?.nominations?.map((d, index) => {
                return [
                    <div className={'block-title'} key={index}>
                        {d.name} <span>{d.nominationtype?.name ? `(${d.nominationtype?.name})` : d.description ? `(${d.description})` : null}</span>
                    </div>,
                    d.levels.map((l, lindex) => {
                        return [
                            d.levels?.length > 1 ? <div className={'block-title'} key={lindex}>
                                {l.levelData?.name}
                            </div> : null,
                            <div className={'fields'} key={lindex}>
                                <div className={'field small'}>
                                    <div className={'field-title'}> Девочки </div>
                                    <div className={'field-content'}> {l.woman || 0} </div>
                                </div>
                                <div className={'field small'}>
                                    <div className={'field-title'}> Мальчики </div>
                                    <div className={'field-content'}> {l.man || 0} </div>
                                </div>
                            </div>
                        ]
                    })
                ]
            })}
        </div>
    </div>
}

export default Application
