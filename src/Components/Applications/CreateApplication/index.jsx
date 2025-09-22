import {useState} from "react";

import StepOne from "./StepOne/index.jsx";
import StepTwo from "./StepTwo/index.jsx";
import StepThree from "./StepThree/index.jsx";

import {Steps} from "primereact/steps";

import './style.scss'

const CreateApplication = ({queryId, data, toast, closeApp, updateData, updateAttachAndStatus}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const [isDownload, setIsDownload] = useState(false)

    const Specified = steps[activeIndex]

    return <div className={'create-app'}>
        <div className={'progress'}>
            <Steps
                model={items}
                activeIndex={activeIndex}
                onSelect={(e) => {
                    if (e.index < activeIndex){
                        setActiveIndex(e.index)
                    }
                }}
                readOnly={false}
                className={activeIndex === 0 ? 'first' : activeIndex === 1 ? 'second' : 'third'}
            />
        </div>
        <Specified
            updateActiveStep={setActiveIndex}
            queryId={queryId}
            data={data}
            toast={toast}
            closeApp={closeApp}
            updateData={updateData}
            isDownload={isDownload}
            updateIsDownload={setIsDownload}
            updateAttachAndStatus={updateAttachAndStatus}
        />
    </div>
}

const items = [
    {label: 'Заполнение данных'},
    {label: 'Печать заявки'},
    {label: 'Загрузка заявки'}
];

const steps = [StepOne,StepTwo,StepThree]

export default CreateApplication
