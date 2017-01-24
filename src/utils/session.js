
export function generateSessionID() {
  const id = '32a81eb2694c3a8b2d9f8d6831fdb61ae838fdc06481d5909e01715ef2906fab'
  let ttl = fiveMinutesFromNow()

  return  {id, ttl}
}

export function fiveMinutesFromNow(){
  let d = new Date()
  d.setMinutes(d.getMinutes() + 5)

  return d
}
