
export const ensureHttp = (endpoint: string): string => {
  if (!endpoint.startsWith('http://')) {
    return 'http://' + endpoint;
  }

  return endpoint;
}
