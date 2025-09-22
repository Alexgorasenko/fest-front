export const createBreads = (params, path) => Object.values(params).reduce((acc, row) => {
    const item = path.find(f => f.key == row)
    if (item) {
        acc.items.push(item)
    }
    return acc
}, {home: { key: 'festivals', label: 'Фестивали', url: '/festivals' }, items: []})

export const editData = (path, initData, value) => {
    const str = JSON.stringify(initData)
    const init = JSON.parse(str)
    return path.split('.').reduce((acc, row, idx, arr) => {
        if (idx == arr.length - 1) {
            acc[row] = value
            return init
        }
        return acc[row]
    }, init)
}
