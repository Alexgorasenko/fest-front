import './style.scss'

import { useNavigate } from 'react-router-dom'

import { Button } from 'primereact/button'

import {useRef} from "react";
import {Toast} from "primereact/toast";

import moment from 'moment'

const getDate = (date) => {
    return date ? moment(date, 'DD.MM.YYYY').format('DD MMMM YYYY') + ' года' : 'не указано'
}

const EntryPoint = ({device, preflow}) => {
    const navigator = useNavigate()
    const toast = useRef(null);

    const restrictedRegistration = process.env.NODE_ENV === "production" && moment().startOf('day') > moment(preflow?.dateQueriesEnd, 'DD.MM.YYYY')

    return  <div className='entrypoint'>
        <Toast ref={toast} />
                <div className='container'>
                    <div className='cta'>
                        <div className={'text'}>
                            <div className='title'>{preflow?.titleShort}</div>
                            <img className='brand' src={preflow?.logo} />
                            <div className={'description'}>
                                <div>Сроки подачи заявки: <br/> <span>с {getDate(preflow?.dateQueriesStart)} по {getDate(preflow?.dateQueriesEnd)}.</span></div>
                                <div>Сроки проведения: <br/> <span>с {getDate(preflow?.dateStart)} по {getDate(preflow?.dateEnd)}.</span></div>
                            </div>
                        </div>
                        <div className={'buttons'}>
                            <div className={'button-group'}>
                                {!restrictedRegistration ? (
                                    <Button
                                        className='p-button-sm negative'
                                        label='Зарегистрироваться'
                                        onClick={() => navigator('/auth/registration')}
                                        id='registerBtn'
                                    />
                                ) : null}
                                <Button
                                    className='p-button-sm negative'
                                    label='Войти'
                                    onClick={() => navigator('/auth')}
                                />
                            </div>
                            <div className={'button-group'}>
                                <Button
                                    className='p-button-sm tutor'
                                    label='Инструкция'
                                    onClick={() => window.open('/docs/tutorial.pdf')}
                                />

                                <Button
                                    className='p-button-sm tutor'
                                    label='Положение'
                                    onClick={() => window.open('/docs/polozhenie.pdf')}
                                />
                            </div>
                        </div>
                        <div className={'support'}>Поддержка: <span onClick={() => {
                            navigator.clipboard.writeText('sd-fest@rfs.ru')
                            toast.current.show({severity: 'success', detail: 'Почта поддержки скопирована', life: 3000});
                            }}>
                                sd-fest@rfs.ru
                            </span>
                        </div>
                    </div>
                </div>
                {device === 'mobile' ? <div className={'mobile-content'}>
                        <div className={'block'}>
                            <div className={'block-text'}>
                                <div className={'title'}>О Фестивале</div>
                                Футбол – это не просто самый доступный вид спорта в мире, это еще и многогранность. Фестиваль, состоящий из совокупности творческих, интеллектуальных, социальных и спортивных активностей на футбольную тематику, погружает обучающихся в увлекательное путешествие под названием «Футбол».
                            </div>
                        </div>
                        <div className={'block'}>
                            <div className={'block-text'}>
                                <div className={'title'}>Участники</div>
                                Принять участие в Фестивале может любая общеобразовательная или дошкольная образовательная организация Российской Федерации, просто подав заявку. Зарегистрированные организации самостоятельно формируют программу Фестиваля и приглашают обучающихся различных возрастов принять участие в мероприятиях.
                            </div>
                        </div>
                        <div className={'block'}>
                            <div className={'block-text'}>
                                <div className={'title'}>Номинации и награждение</div>
                                По итогам Фестиваля в каждом регионе определяются 3 лучшие организации (общеобразовательные организации до 300 и более 300 обучающихся и лучшие дошкольные образовательные организации), которым вручается футбольные мячи и спортивный инвентарь. Три самые активные и творческие организации в стране поощряются специальными призами.
                            </div>
                        </div>
                    </div>
                    : null
                }
            </div>
}

export default EntryPoint
