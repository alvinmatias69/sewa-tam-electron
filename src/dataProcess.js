import _ from 'lodash'

let processDate = (date) => {
  return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
}

let calculateDuration = (date1, date2) => {
  let timeDiff = Math.abs(date1.getTime() - date2.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

export let calculateData = (data) => {
  let result = []
  let lengthMasuk, indexMasuk, lengthKirim, indexKirim, qtyBroke, qty, brokeMasuk

  for (name in data.masuk) {
    if (data.kirim[name]) {
      lengthMasuk = data.masuk[name].length
      indexMasuk = 0
      lengthKirim = data.kirim[name].length
      indexKirim = 0
      brokeMasuk = parseInt(data.masuk[name][indexMasuk].qtyBroke) ? parseInt(data.masuk[name][indexMasuk].qtyBroke) : 0
      while (indexMasuk < lengthMasuk && indexKirim < lengthKirim) {
        qtyBroke = 0
        if (data.masuk[name][indexMasuk].qty < data.kirim[name][indexKirim].qty) {
          qty = data.masuk[name][indexMasuk].qty
          data.kirim[name][indexKirim].qty -= data.masuk[name][indexMasuk].qty
          data.masuk[name][indexMasuk].qty = 0
          if (brokeMasuk < data.kirim[name][indexKirim].qty) {
            qtyBroke = brokeMasuk
            data.kirim[name][indexKirim].qty -= brokeMasuk
            brokeMasuk = 0
          } else {
            qtyBroke = data.kirim[name][indexKirim].qty
            brokeMasuk -= data.kirim[name][indexKirim].qty
            data.kirim[name].qty = 0
          }
        } else {
          qty = data.kirim[name][indexKirim].qty
          data.masuk[name][indexMasuk].qty -= data.kirim[name][indexKirim].qty
          data.kirim[name][indexKirim].qty = 0
        }

        result.push({
          name,
          dischargeDate: processDate(data.kirim[name][indexKirim].date),
          entryDate: processDate(data.masuk[name][indexMasuk].date),
          duration: calculateDuration(data.masuk[name][indexMasuk].date, data.kirim[name][indexKirim].date), 
          entrySJ: data.masuk[name][indexMasuk].sj,
          dischargeSJ: data.kirim[name][indexKirim].sj,
          qty,
          qtyBroke,
        })

        if (!(brokeMasuk+data.masuk[name][indexMasuk].qty)) {
          indexMasuk += 1
          brokeMasuk = data.masuk[name][indexMasuk] && data.masuk[name][indexMasuk].qtyBroke ? parseInt(data.masuk[name][indexMasuk].qtyBroke) : 0
        }

        if (!data.kirim[name][indexKirim].qty) {
          indexKirim += 1
        }
      }
    }
  }

  return result
}

export let processData = (results) => {
  let processedResult = results.data
    .filter(result => !!result['NAMA BARANG'].length && result['NAMA BARANG'].substring(result['NAMA BARANG'].length-5) !== 'Total' )
    .map(result => {
      let qty, type, qtyBroke
      if (!!result[' KIRIM ']) {
        qty = result[' KIRIM ']
        type = 'kirim'
      } else {
        qty = result[' MASUK ']
        qtyBroke = result[' RUSAK ']
        type = 'masuk'
      }
      return {
        name: result['NAMA BARANG'],
        sj: result['SJ'],
        date: new Date(result['TGL']),
        qty,
        type,
        qtyBroke
      }
    })
  let groupedResult = _.groupBy(processedResult, 'type')
  let finalResult = {
    'kirim': _.groupBy(groupedResult['kirim'], 'name'),
    'masuk': _.groupBy(groupedResult['masuk'], 'name'),
  }
  return finalResult
}

export let calculateNotRetreived = (finalDate, data) => {
  let result = []
  let index = 0
  for (name in data) {
    for (index = 0; index < data[name].length; index++) {
      if (!!data[name][index].qty) {
        result.push({
          name,
          dischargeDate: processDate(data[name][index].date),
          entryDate: processDate(finalDate),
          duration: calculateDuration(data[name][index].date, finalDate),
          entrySJ: '',
          dischargeSJ: data[name][index].sj,
          qty: data[name][index].qty,
        })
      }
    }
  }
  return result
}

export let sortResult = (a, b) => {
  let nameA = a.name.toUpperCase()
  let nameB = b.name.toUpperCase()
  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }
  return 0
}
