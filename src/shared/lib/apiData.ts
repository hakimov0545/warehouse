export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback
}

export function normalizeListResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  return []
}

export async function getList(queryFn) {
  const { data } = await queryFn()
  return normalizeListResponse(data)
}
