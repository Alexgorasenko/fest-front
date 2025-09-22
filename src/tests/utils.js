const { faker } = require('@faker-js/faker')
const moment = require('moment')

module.exports = {
    querySelectorsRules: [
        {selector: '#fullName'},
        {selector: '#ogrn'},
        {selector: '#kpp'},
        {selector: '#region span.p-inputtext', key: 'textContent'},
        {selector: '#display'}
    ],
    queryManualFill: [
        {selector: '.director-fullname', value: faker.person.fullName()},
        {selector: '.director-position', value: 'Директор'},
        {selector: '.director-phone', value: '+79119119911'},
        {selector: '.director-email', value: faker.internet.email()},
        {selector: '.delegate-fullname', value: faker.person.fullName()},
        {selector: '.delegate-position', value: 'Преподаватель физкультуры'},
        {selector: '.delegate-phone', value: '+71991991199'},
        {selector: '.delegate-email', value: faker.internet.email()},
        {selector: '#site', value: 'https://testschool.ru'}
    ],
    reportFormFieldSelectors: [
        //{selector: '#date-start>input', value: moment().add(1, 'month').format('DD.MM.YY')},
        {selector: '.report-form-qty-input>input', type: true, value: '200', multiple: true},
        {selector: '.report-form-custom-qty-input>input', type: true, random: true, randomMax: 15, multiple: true},
        {selector: '.report-form-video-link', type: true, value: `https://youtube.com/?v=${faker.string.uuid()}`},
        {selector: '.report-form-publication-link', type: true, value: `https://school.ru/${faker.string.uuid()}`, multiple: true},
        {selector: '.report-form input[type="file"]', multiple: true, upload: true}
    ]
}
