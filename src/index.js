import Papa from 'papaparse'

import { processData, calculateData, calculateNotRetreived, sortResult } from './dataProcess'

let download = (filename, text) => {
  let element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename);

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

let onComplete = (results, date) => {
  let data = processData(results)
  let result = calculateData(data).concat(calculateNotRetreived(date, data))
  download('result.csv', Papa.unparse(result.sort(sortResult), { quotes: true }))
}

export let handleData = (date, csv) => {
  let options = {
    complete: (result) => onComplete(result, date),
    header: true,
    dynamicTyping: true,
  }
  Papa.parse(csv, options)
}
