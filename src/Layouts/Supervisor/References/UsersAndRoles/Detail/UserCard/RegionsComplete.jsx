import { useState, useEffect } from 'react'
import { AutoComplete } from 'primereact/autocomplete'

import { regionsList } from '../../../../service'

const items = [
    {key: 'canView', label: 'Может просматривать заявки/отчеты'},
    {key: 'canEdit', label: 'Может редактировать заявки/отчеты'}
]

const attachLabels = (admin, ref) => {
    let output = {}
    for(let key in admin) {
        output[key] = []
        for(let kladr_id of admin[key]) {
            const match = ref.find(r => r.value === kladr_id)
            if(match) {
                output[key].push(match)
            }
        }
    }

    return output
}

const cleanupPerms = obj => {
    return {
        ...obj,
        canView: obj.canView.filter(r => !obj.canEdit.find(_r => _r.value === r.value))
    }
}

const RegionsComplete = ({ data, token, onUpdated }) => {
    const [regions, setRegions] = useState([])
    const [filtered, setFiltered] = useState([])
    const [selected, setSelected] = useState({canView: [], canEdit: []})

    useEffect(() => {
        if(token) {
            regionsList()
                .then(list => {
                    setRegions(list)
                })
        }
    }, [token])

    useEffect(() => {
        if(regions && regions.length) {
            const { region_admin } = data
            if(region_admin && region_admin.canView && region_admin.canEdit) {
                setSelected(cleanupPerms(attachLabels(region_admin, regions)))
            }
        }
    }, [regions])

    useEffect(() => {
        onUpdated(Object.keys(selected).reduce((acc, role) => {
            acc[role] = selected[role].map(r => r.value)
            return acc
        }, {}))
    }, [selected])

    const searchRegions = evt => {
        setFiltered(regions.filter(r => r.label.toLowerCase().includes(evt.query.toLowerCase())))
    }

    return  <div className='user-form report-form-block row'>
                {items.map((role, i) => (
                    <div className='report-form-field' key={i}>
                        <label className='report-form-field-title'>{role.label}</label>
                        <AutoComplete
                            suggestions={filtered}
                            completeMethod={searchRegions}
                            field='label'
                            multiple
                            value={selected[role.key]}
                            onChange={e => setSelected(cleanupPerms({...selected, [role.key]: e.value}))}
                        />
                    </div>
                ))}
            </div>
}

export default RegionsComplete
