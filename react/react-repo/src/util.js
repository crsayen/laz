const fillTheBlank = (text, filler) => {
  let index = text.indexOf('_')
  let fillerFixed =
    filler.charAt(filler.length - 1) == '.'
      ? filler.slice(0, -1)
      : filler
  return index > -1
    ? `${text.slice(0, index)}${fillerFixed}${text.slice(index + 1)}`
    : `${text}\n${fillerFixed}`
}