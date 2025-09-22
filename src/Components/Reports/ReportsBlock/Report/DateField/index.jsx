import {Calendar} from "primereact/calendar";
import { addLocale } from 'primereact/api';
import moment from "moment";


addLocale('ru', {
    firstDayOfWeek: 0,
    dayNames: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
    dayNamesShort: ['пон', 'вто', 'сре', 'чет', 'пят', 'суб', 'вос'],
    dayNamesMin: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'],
    monthNames: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
    monthNamesShort: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    today: 'Сегодня',
    clear: 'Очистить'
});



const DateField = ({fieldData, form, updateForm, preloadData, access}) => {

    return <div className={'report-form-block row'}>
        <div className={'report-form-field sm'}>
            <label htmlFor="date-start" className={'report-form-field-title'}>
                {fieldData.label}* <span>{fieldData.mutedLabel}</span>
            </label>
            <Calendar
                id='date-start'
                placeholder={'Выберите дату'}
                value={form?.value?.[fieldData.reportDataKey] || ''}
                onChange={(e) => {
                    console.log('Update date', e.value)
                    updateForm(fieldData.type, [fieldData.reportDataKey], e.value, true, !!e.value, false)
                }}
                className={`report-form-field-input${!form?.isValid && form?.showValid ? ' not-valid' : ''}`}
                showIcon
                locale={'ru'}
                dateFormat="dd.mm.yy"
                maxDate={new Date(moment(preloadData?.festival?.dateReportEnd, 'DD.MM.YYYY').format())}
                minDate={new Date(moment(preloadData?.festival?.dateReportStart, 'DD.MM.YYYY').format())}
                disabled={access && access !== 'full'}
            />
        </div>
    </div>
}

export default DateField
