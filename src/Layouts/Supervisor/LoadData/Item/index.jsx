import React, {useEffect, useRef, useState} from "react";

import axios from "axios";
import {ENDPOINT} from "../../../../env.js";

import {FileUpload} from "primereact/fileupload";
import {SelectButton} from "primereact/selectbutton";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";

import './style.scss'

const LoadDataItem = ({data, onUpdate, toast}) => {

    const fileUploadRef = useRef(null);

    const [link, setLink] = useState('');
    const [mode, setMode] = useState('link');

    useEffect(() => {
        if (data && data.item) {
            setMode(data.item.linkActive ? 'link' : 'file')
            setLink(data.item[`${data.key}Link`] || '')
        }
    }, [data]);

    const uploadHandler = async (event) => {
        if (event.files[0]) {
            const formData = new FormData();
            const originalFile = event.files[0];
            const originalFileName = originalFile.name;

            formData.append('file', originalFile)
            formData.append('patchField', data.key)
            formData.append('filename', originalFileName)

            const resp = await axios.post(`${ENDPOINT}svr/upload_doc`, formData, {
                headers: {
                    Authorization: localStorage.getItem('_amateum_svr')
                }
            })

            if (resp && resp.data) {
                const {success} = resp.data
                if (success) {
                    toast.current.show({severity:'success', detail:'Файл успешно загружен', life: 3000});
                    onUpdate()
                } else {
                    toast.current.show({severity:'error', detail:'Ошибка загрузки файла', life: 3000});
                }
            }
        }

        fileUploadRef.current.clear()
    }

    const deleteHandler = async () => {
        const resp = await axios.get(`${ENDPOINT}svr/remove_doc/${data.file._id}?patchField=${data.key}`, {
            headers: {
                Authorization: localStorage.getItem('_amateum_svr')
            }
        })
        if (resp && resp.data) {
            const {success} = resp.data
            if (success) {
                toast.current.show({severity:'success', detail:'Файл успешно удален', life: 3000});
                onUpdate()
            } else {
                toast.current.show({severity:'error', detail:'Ошибка удаления файла', life: 3000});
            }
        }
    }

    const updateHandler = async (changed) => {
        const resp = await axios.put(`${ENDPOINT}svr/patch_doc/${data.collectionId}`, changed, {
            headers: {
                Authorization: localStorage.getItem('_amateum_svr')
            }
        })

        if (resp && resp.data) {
            const {success} = resp.data
            if (success) {
                onUpdate()
                return true
            }
            return false
        }
    }

    const changeMode = async (value) => {
        setMode(value)
        const changed = {
            [data.key]: {...data.item, linkActive: value === 'link'}
        }
        const resp = await updateHandler(changed)
        if (resp) {
            toast.current.show({severity:'success', detail:'Данные успешно заменены', life: 3000});
        } else {
            toast.current.show({severity:'error', detail:'Ошибка изменения данных', life: 3000});
        }
    }

    const updateLink = async () => {
        const changed = {
            [data.key]: {...data.item, [`${data.key}Link`]: link}
        }
        const resp = await updateHandler(changed)
        if (resp) {
            toast.current.show({severity:'success', detail:'Данные успешно изменены', life: 3000});
        } else {
            toast.current.show({severity:'error', detail:'Ошибка изменения данных', life: 3000});
        }
    }

    return !!data && (
        <div className='load-data-item__card'>
            <div className='load-data-item'>
                <div className='load-data-item__header'>
                    {data.title}
                    <SelectButton value={mode} options={options} onChange={e => changeMode(e.value)} optionLabel="label" className='load-data-item__select-btn' unselectable={false}/>
                </div>
                {mode === 'file' ? (
                    !data.file ? (
                        <FileUpload
                            ref={fileUploadRef}
                            mode="basic"
                            customUpload
                            onSelect={uploadHandler}
                            uploadHandler={removeHandler}
                            accept=".pdf"
                            chooseOptions={chooseOptions}
                            className='load-data-item__fileupload'
                            chooseLabel='Загрузить файл'
                        />
                    ) : (
                        <div className='load-data-item__file'>
                            <Button className='load-data-item__remove-btn' icon='pi pi-times' onClick={deleteHandler}/>
                            <div className='load-data-item__filename'>
                                {data.file.filename}
                            </div>
                        </div>
                    )
                ) : (
                  <InputText value={link} placeholder='Вставьте ссылку' className='load-data-item__input' onChange={e => setLink(e.target.value)} onBlur={updateLink}/>
                )}
            </div>
        </div>
    )
}

const chooseOptions = {label: 'Загрузить файл', icon: 'pi pi-upload'};

const removeHandler = (event) => {
    event.options.clear()
}

const options = [{label: 'Ссылка на файл', value: 'link'}, {label: 'Загрузка файла', value: 'file'}]

export default LoadDataItem;