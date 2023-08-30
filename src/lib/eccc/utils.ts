export function generateConditionsUUID(timeStamp: string) {
  // the timestamp on <datetime ...> object is a good unique string to use for this
  // we'll just chop off the last 4 digits (mmss) as they can change a lot
  return timeStamp?.slice(0, timeStamp.length - 4) ?? "";
}
