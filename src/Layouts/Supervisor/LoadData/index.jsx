import React, {useState, useEffect, useRef} from 'react'

import axios from "axios";
import {ENDPOINT} from "../../../env.js";

import {Toast} from "primereact/toast";

import LoadDataItem from "./Item/index.jsx";

import './style.scss'

const LoadData = ({ docs, updateDocs }) => {
    const toastRef = useRef(null);

    return (
        <div className='load-data'>
            <h2>Загрузка данных</h2>
            <Toast ref={toastRef}/>

            {docs && <div className='load-data__list'>{docs.map((d, k) => <LoadDataItem key={k} data={d} onUpdate={updateDocs} toast={toastRef}/>)}</div>}
        </div>
    )
}

export default LoadData