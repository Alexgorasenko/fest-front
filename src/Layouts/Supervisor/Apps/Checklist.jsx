import { useState, useEffect } from 'react'

import { Checkbox } from 'primereact/checkbox'

import './checklist.scss'

const Checklist = ({ data, moderCheckList, setCompleted, updateCheckList, status }) => {
    const [boxes, setBoxes] = useState(moderCheckList)

    const [showAlert, setShowAlert] = useState(false)

    useEffect(() => {
        updateCheckList(boxes)
        const warnings = data.map(s => s.list).flat(1).map(r => r.warning)
        const checks = boxes.flat(1)
        const actual = warnings.filter((w, i) => w && !checks[i])
        setShowAlert(actual.length)
        setCompleted(checks.filter(ch => !ch).length === 0)
    }, [boxes])

    const toggleBox = (section, box) => {
        setBoxes(boxes.map((s, i) => {
            return i !== section ? [...s] : s.map((b, j) => j === box ? !s[j] : s[j])
        }))
    }

    return [
        showAlert ? (
            <div className='non-ideal-alert' key='alert'>
                <div className='message'>Найдены несоответствия <i className='pi pi-exclamation-triangle'></i></div>
                <div className='notice'>Внимательно проверьте, некоторые поля не соответствует данным из базы</div>
            </div>
        ) : null
    ].concat(data.map((section, i) => (
        <div
            className="checklist-section"
            key={i}
        >
            <div className='checklist-section_head'>
                <Checkbox
                    inputId={i+'_head'+JSON.stringify(boxes[i])}
                    disabled
                    checked={!boxes[i].filter(b => !b).length}
                />
                <label htmlFor={i+'_head'} className='p-checkbox-label'>{section.rootLabel}</label>
            </div>

            <div className='checklist-section_body'>
                {section.list.map((row, j) => (
                    <div className='checklist-section_row' key={j}>
                        <Checkbox
                            inputId={`${i}_${j}_row`}
                            onChange={() => toggleBox(i, j)}
                            checked={boxes[i][j]}
                            disabled={status}
                        />
                        <label
                            htmlFor={`${i}_${j}_row`}
                            className='p-checkbox-label'
                        >
                            {row.strong ? (
                                <span className='strong'>
                                    {row.label}
                                    <span>{row.sub}</span>
                                </span>
                            ) : <span>{row.label}{row.warning && !boxes[i][j] ? <i className='pi pi-exclamation-triangle'></i> : null}</span>}
                            {row.value ? <i>{row.value}</i> : null}
                            {row.values ? row.values.map((v, k) => (
                                <div className='checklist-section_row_values' key={k}>
                                    {v.sectionLabel ? (
                                        <span className='checklist-section_row_values_label'>{v.sectionLabel}</span>
                                    ) : null}
                                    <div className='checklist-section_row_values_grid'>
                                        {v.list.map((cell, m) => (
                                            <div className='checklist-section_row_values_cell' key={m}>
                                                <span>{cell.label}</span>
                                                <i>{cell.value}</i>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : null}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    ))).filter(node => node)
}

export default Checklist
