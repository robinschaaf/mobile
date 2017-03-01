import crypto from 'react-native-crypto'

export function generateSessionID() {
  const sha2 = crypto.createHash('sha256')
  const id = sha2.update("#{Math.random() * 10000 }#{Date.now()}#{Math.random() * 1000}").digest('hex')

  console.log('ATTEMPT TO GET SESSION ID: ', id)
  //const id = '32a81eb2694c3a8b2d9f8d6831fdb61ae838fdc06481d5909e01715ef2906fab'
  let ttl = fiveMinutesFromNow()

  return  {id, ttl}
}

export function fiveMinutesFromNow(){
  let d = new Date()
  d.setMinutes(d.getMinutes() + 5)

  return d
}
