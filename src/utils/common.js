// 日期格式化
export const formatDate = (date, format = 'YYYY-MM-DD') => {
    if (!date) return '-'
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'

    const pad = (n) => String(n).padStart(2, '0')
    const map = {
        'YYYY': d.getFullYear(),
        'MM': pad(d.getMonth() + 1),
        'DD': pad(d.getDate()),
        'HH': pad(d.getHours()),
        'mm': pad(d.getMinutes()),
        'ss': pad(d.getSeconds())
    }

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match])
}

// 文件下载
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

// 防抖
export const debounce = (fn, delay = 300) => {
    let timer = null
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

// 节流
export const throttle = (fn, interval = 300) => {
    let last = 0
    return (...args) => {
        const now = Date.now()
        if (now - last >= interval) {
            last = now
            fn(...args)
        }
    }
}