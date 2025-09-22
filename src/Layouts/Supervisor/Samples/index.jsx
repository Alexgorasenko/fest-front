import { useState, useEffect } from 'react'

import axios from 'axios'
import moment from 'moment'
import { ENDPOINT } from '../../../env'
import { ProgressBar } from 'primereact/progressbar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'

import './style.scss'

const Item = ({ data, token }) => {
    const [selected, setSelected] = useState(null)
    const [addon, setAddon] = useState(null)
    const [fileAppend, setFileAppend] = useState(null)
    const [progress, setProgress] = useState(false)

    useEffect(() => {
        if(!selected && data.options && data.options[0]) {
            setSelected(data.options[0].value)
            setFileAppend(data.options[0].label)
            setAddon(data.options[0].key)
        }
    }, [data])

    useEffect(() => {
        if(selected && data) {
            const idx = data.options.findIndex(opt => opt.value === selected)
            if(idx > -1) {
                setFileAppend(data.options[idx].label)
                setAddon(data.options[idx].key)
            }
        }
    }, [selected])

    const download = () => {
        setProgress(true)
        axios.get(`${ENDPOINT}${data.source}${selected && addon ? '?'+addon+'='+selected : ''}`, {
            responseType: 'arraybuffer',
            headers: {
                authorization: token,
                accept: 'application/octet-stream'
            }
        }).then(resp => {
            if(resp.data && !resp.data.error) {
                const obj = new Blob([resp.data], {type: 'application/octet-stream'})
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(obj)
                link.download = `${data.name}_${selected && fileAppend ? fileAppend+'_' : ''}${moment().format('DD.MM.YYYY')}.xlsx`
                link.click()

                setProgress(false)
            }
        })
    }

    return  <div>
                <div className='name'>{data.name}</div>
                <div className='actions'>
                    {data.options ? (
                        <div>
                            <Dropdown
                                options={data.options}
                                value={selected}
                                disabled={data.options.length < 2}
                                onChange={e => {
                                    setSelected(e.target.value)
                                }}
                            />
                        </div>
                    ) : null}

                    <div>
                        <Button
                            label='Скачать'
                            className='p-button-sm'
                            icon='pi pi-download'
                            onClick={() => download()}
                            loading={progress}
                        />
                    </div>
                </div>
            </div>
}

const Samples = ({ token }) => {
    const [data, setData] = useState(null)

    useEffect(() => {
        if(token) {
            axios.get(`${ENDPOINT}svr/available_samples`, {
                headers: {
                    authorization: token
                }
            }).then(resp => {
                if(!resp.data.error) {
                    if(resp.data.length) {
                        setData(resp.data)
                    }
                }
            })
        }
    }, [token])

    return  <div className="samples">
                <h2>Выгрузки и отчеты</h2>

                {data ? (
                    <div className='list'>
                        {data.map((item, i) => (
                            <Item key={i} data={item} token={token} />
                        ))}
                    </div>
                ) : (
                    <div className='progress-wrap'>
                        <div>Данные загружаются...</div>
                        <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
                    </div>
                )}
            </div>
}

export default Samples
