import moment from "moment";

const renderNavModel = (roles=null, nominations=null, status, dateReportStart) => {
    const publicUserModel = [
        nominations && nominations.length && status === 'VALID' && moment() >= moment(dateReportStart, 'DD.MM.YYYY') ? {
            display: 'Отчеты о мероприятиях',
            icon: 'images',
            path: nominations.length > 1 ? null : '/reports',
            nested: nominations.length > 1 ? nominations.map(nom => (
                {
                    display: nom.name,
                    path: '/reports',
                    nestedId: nom._id
                }
            )) : null
        } : null,
        {
            display: 'Заявка на участие',
            icon: 'file',
            path: '/applications'
        },
        status === 'VALID' ? {
            display: 'Информационная панель',
            icon: 'chart-pie',
            path: '/dashboard'
        } : null,
        {
            display: 'Личный кабинет',
            icon: 'user',
            path: '/account'
        },
        {
            display: 'Архив',
            icon: 'folder-open',
            path: '/archive'
        },
        {
            display: 'Сертифтикат участника',
            icon: 'id-card',
            download: '/docs/certificate.docx',
            fileId: "certificateFile"
        },
        {
            display: 'Положение',
            icon: 'file-pdf',
            document: 'https://api-fests.rfs.ru/landing/docs/b62df322-7d73-47b1-8476-c952b9571b04.pdf'
        }
    ]
    const moderModel = [
        {
            display: 'Модерация заявок',
            icon: 'file',
            path: '/apps'
        }
    ]
    const adminModel = [
        {
            display: 'Справочники',
            icon: 'list',
            nested: [
                {
                    display: 'Фестивали',
                    path: '/festivals'
                },
                {
                    display: 'Пользователи и роли',
                    path: '/users-and-roles'
                }
            ]
        },
        { display: 'Выгрузки и отчеты', icon: 'file-excel', path: '/samples' },
        { display: 'Заявки на участие', icon: 'file', path: '/apps' },
        { display: 'Отчеты о мероприятиях', icon: 'images', path: '/reviews' },
        { display: 'Информационная панель', icon: 'chart-pie', path: '/dashboard' },
        { display: 'Журнал событий', icon: 'shield', path: '/logging' },
        { display: 'Загрузка данных', icon: 'upload', path: '/load-data' },
        {
            display: 'Архив',
            icon: 'folder-open',
            path: '/archive'
        }
    ]
    const regionModel = [
        {
            display: 'Информационная панель',
            icon: 'chart-pie',
            path: '/dashboard'
        },
        {
            display: 'Выгрузки и отчеты',
            icon: 'file-excel',
            path: '/samples'
        },
        {
            display: 'Заявки на участие',
            icon: 'file',
            path: '/apps'
        },
        {
            display: 'Отчеты по мероприятиям',
            icon: 'images',
            path: '/reviews'
        }
    ]

    const getModel = () => {
        if (roles) {
            if (roles.rfu_admin || roles.superadmin) {
                if (roles.public_user) {
                    return publicUserModel.filter(p => !['/dashboard', '/account'].includes(p?.path)).concat(adminModel)
                }
                return adminModel
            }
            if (roles.moderator) {
                if (roles.public_user) {
                    return publicUserModel.concat(moderModel)
                }
                return moderModel
            }
            if (roles.region_admin && (roles.region_admin.canView?.length || roles.region_admin.canEdit?.length)) {
                if (roles.public_user) {
                    return publicUserModel.filter(p => !['/dashboard'].includes(p?.path)).concat(regionModel)
                }
                return regionModel
            }
            if (roles.public_user) {
                return publicUserModel
            }
        }
    }

    return getModel()
}

export default renderNavModel
