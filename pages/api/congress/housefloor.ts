import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let date =
    (req.query.date as string) ||
    new Date(Date.now()).toISOString().slice(0, 10).replace(/-/g, '')
  console.log(date)

  let congressBroadcastData: any = {}
  //   while (!Object.keys(congressBroadcastData).length) {
  congressBroadcastData = (
    await fetch(
      `https://liveproxy-azapp-prod-eastus2-003.azurewebsites.net/broadcastevents/${date}`
    ).then((res) => res.json())
  )[0]

  const congressBroadcastMP4 = congressBroadcastData?.asset?.files?.find(
    (file: { type: string; id: string; name: string; url: string }) =>
      file.type === 'MP4Format'
  )?.url

  console.log({ congressBroadcastMP4, congressBroadcastData })
  return res.status(200).json({ congressBroadcastMP4, congressBroadcastData })
}
