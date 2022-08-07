import type { NextApiRequest, NextApiResponse } from 'next'

export type HS_Property = {
  updatedAt: Date
  createdAt: Date
  name: string
  label: string
  type: string
  fieldType: string
  description: string
  groupName: string
  options: any[]
  displayOrder: number
  calculated: boolean
  externalOptions: boolean
  hasUniqueValue: boolean
  hidden: boolean
  hubspotDefined: boolean
  modificationMetadata: {
    archivable: boolean
    readOnlyDefinition: boolean
    readOnlyValue: boolean
  }
  formField: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    console.log(Object.keys(req))
    console.log(req.query)
    const HS_Properties = await fetch(
      `https://api.hubapi.com/crm/v3/properties/contacts?archived=false`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.HS_PRIVATE_APP_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then((res: any) => res.json())
      .then((res) => {
        console.log(`Received ${res.results.length} HS_Properties`)
        const results = req.query.hasOwnProperty('short')
          ? res.results
              .filter(
                (result: HS_Property) =>
                  result.groupName === 'contactinformation'
              )
              .filter((result: HS_Property) => result.name.slice(0, 2) !== 'hs')
              .map((result: HS_Property) => {
                return {
                  name: result.name,
                  label: result.label,
                  type: result.type,
                  fieldType: result.fieldType,
                }
              })
          : res.results
        console.log(`Returning ${results.length} Qualifying HS_Properties`)
        return results
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
    return res.status(200).json({ message: `Success`, data: { HS_Properties } })
  }

  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
}
