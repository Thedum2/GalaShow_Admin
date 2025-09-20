export const unwrap = (resOrData) => {
  const top = resOrData?.data ?? resOrData
  return top?.data ?? top
}
