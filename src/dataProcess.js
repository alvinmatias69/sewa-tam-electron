import _ from 'lodash'

let processDate = (date) => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

let calculateDuration = (date1, date2) => {
  let timeDiff = Math.abs(date1.getTime() - date2.getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

export let calculateData = (data) => {
  let result = []
  let lengthMasuk, indexMasuk, lengthKirim, indexKirim, qtyBroke, qty, qtyLost, brokeMasuk, lostMasuk

  for (let name in data.masuk) {
    if (data.kirim[name]) {
      lengthMasuk = data.masuk[name].length
      indexMasuk = 0
      lengthKirim = data.kirim[name].length
      indexKirim = 0
      brokeMasuk = parseInt(data.masuk[name][indexMasuk].qtyBroke) ? parseInt(data.masuk[name][indexMasuk].qtyBroke) : 0
      lostMasuk = parseInt(data.masuk[name][indexMasuk].qtyLost) ? parseInt(data.masuk[name][indexMasuk].qtyLost) : 0
      while (indexMasuk < lengthMasuk && indexKirim < lengthKirim) {
        qtyBroke = 0
        qtyLost = 0
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
          if (lostMasuk < data.kirim[name][indexKirim].qty) {
            qtyLost = lostMasuk
            data.kirim[name][indexKirim].qty -= lostMasuk
            lostMasuk = 0
          } else {
            qtyLost = data.kirim[name][indexKirim].qty
            lostMasuk -= data.kirim[name][indexKirim].qty
            data.kirim[name].qty = 0
          }
        } else {
          qty = data.kirim[name][indexKirim].qty
          data.masuk[name][indexMasuk].qty -= data.kirim[name][indexKirim].qty
          data.kirim[name][indexKirim].qty = 0
        }

        result.push({
          kode: data.masuk[name][indexMasuk].code,
          nama: name,
          sj_kirim: data.kirim[name][indexKirim].sj,
          sj_kembali: data.masuk[name][indexMasuk].sj,
          tgl_kirim: processDate(data.kirim[name][indexKirim].date),
          tgl_kembali: processDate(data.masuk[name][indexMasuk].date),
          durasi: calculateDuration(data.masuk[name][indexMasuk].date, data.kirim[name][indexKirim].date),
          quantity: qty,
          quantity_rusak: qtyBroke,
          quantity_hilang: qtyLost
        })

        if (!(lostMasuk + brokeMasuk + data.masuk[name][indexMasuk].qty)) {
          indexMasuk += 1
          brokeMasuk = data.masuk[name][indexMasuk] && data.masuk[name][indexMasuk].qtyBroke ? parseInt(data.masuk[name][indexMasuk].qtyBroke) : 0
          lostMasuk = data.masuk[name][indexMasuk] && data.masuk[name][indexMasuk].qtyLost ? parseInt(data.masuk[name][indexMasuk].qtyLost) : 0
        }

        if (!data.kirim[name][indexKirim].qty) {
          indexKirim += 1
        }
      }
    }
  }

  return result
}

export let calculateNotRetreived = (finalDate, data) => {
  let result = []
  let index = 0
  for (let name in data) {
    for (index = 0; index < data[name].length; index++) {
      if (data[name][index].qty) {
        result.push({
          kode: data[name][index].code,
          nama: name,
          sj_kirim: data[name][index].sj,
          sj_kembali: '',
          tgl_kirim: processDate(data[name][index].date),
          tgl_kembali: processDate(finalDate),
          durasi: calculateDuration(data.masuk[name][index].date, finalDate),
          quantity: data[name][index].qty,
          quantity_rusak: '',
          quantity_hilang: ''
        })
      }
    }
  }
  return result
}

export let processData = (results) => {
  let processedResult = results.data
    .filter(result => !!result.nama && !!result.nama.length && result.nama.substring(result.nama.length - 5).toUpperCase() !== 'TOTAL')
    .map(result => {
      let qty, type, qtyBroke, qtyLost
      if (result['kirim']) {
        qty = result['kirim']
        type = 'kirim'
      } else {
        qty = result['masuk']
        qtyBroke = result['rusak']
        qtyLost = result['hilang']
        type = 'masuk'
      }
      return {
        name: result['nama'],
        code: result['kode'],
        sj: result['sj'],
        date: new Date(result['tanggal']),
        qty,
        type,
        qtyBroke,
        qtyLost
      }
    })
  let groupedResult = _.groupBy(processedResult, 'type')
  let finalResult = {
    'kirim': _.groupBy(groupedResult['kirim'], 'name'),
    'masuk': _.groupBy(groupedResult['masuk'], 'name')
  }
  return finalResult
}

export let sortResult = (a, b) => {
  let nameA = a.nama.toUpperCase()
  let nameB = b.nama.toUpperCase()
  if (a.nama.toUpperCase() < b.nama.toUpperCase()) {
    return -1
  } else if (a.nama.toUpperCase() > b.nama.toUpperCase()) {
    return 1
  } else if (a.tgl_kirim < b.tgl_kirim) {
    return -1
  } else if (a.tgl_kirim > b.tgl_kirim) {
    return 1
  } else if (a.sj_kirim < b.sj_kirim) {
    return -1
  } else if (a.sj_kirim > b.sj_kirim) {
    return 1
  } else if (a.sj_kembali < b.sj_kembali) {
    return -1
  } else if (a.sj_kembali > b.sj_kembali) {
    return 1
  }
  return 0
}
