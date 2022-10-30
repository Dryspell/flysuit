import { HS_Property, PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const exampleSchema = {
  labels: {
    singular: 'My object',
    plural: 'My objects',
  },
  requiredProperties: ['my_object_property'],
  secondaryDisplayProperties: ['test2ndDisplayProperty'],
  properties: [
    {
      name: 'my_object_property',
      label: 'My object property',
      isPrimaryDisplayLabel: true,
      description: 'TEST_Description',
      options: [
        {
          label: 'testLabel',
          value: 'testValue',
          description: 'testDescription',
          displayOrder: -1,
          hidden: true,
        },
      ],
      displayOrder: -1,
      type: 'enumeration',
      fieldType: 'checkbox',
    },
  ],
  associatedObjects: ['CONTACT'],
  name: 'my_object',
  primaryDisplayProperty: 'my_object_property',
  metaType: 'PORTAL_SPECIFIC',
}

type HSSchema = {
  name?: string
  labels?: {
    singular: string
    plural: string
  }
  requiredProperties?: string[]
  secondaryDisplayProperties?: string[]
  properties: HSPropertyData[]
  associatedObjects?: string[]
  primaryDisplayProperty?: string
  metaType?: string
}

type HSPropertyData = {
  name?: string
  label?: string
  isPrimaryDisplayLabel?: boolean
  description?: string
  options?: {
    label?: string
    value?: string
    description?: string
    displayOrder?: number
    hidden?: boolean
  }[]
  displayOrder?: number
  type?: string
  fieldType?: string
  isRequired?: boolean
  isSecondaryDisplayLabel?: boolean
  isSearchable?: boolean
}

type sampleJSON = { [key: string]: string }

const formatToHRText = (text: string) => {
  const regex = /(\b[a-z](?!\s))/g
  return text
    .toLowerCase()
    .replace('_', ' ')
    .replace(regex, (x) => x.toUpperCase())
}

type InputSchema = {
  name?: string
  labels?: {
    singular?: string
    plural?: string
  }
  properties: sampleJSON | { [key: string]: HSPropertyData }
}

const parseSchema = async (schema: InputSchema) => {
  const primaryDisplayProperty =
    Object.values(schema.properties).find(
      (prop: HSPropertyData) => prop?.isPrimaryDisplayLabel === true
    )?.name || (schema?.name === 'contact' ? 'email' : 'id')

  const requiredProperties = Object.values(schema.properties)
    .filter((prop: HSPropertyData) => prop.isRequired === true)
    .map((prop: HSPropertyData) => prop.name as string)

  const secondaryDisplayProperties = Object.values(schema.properties)
    .filter((prop: HSPropertyData) => prop.isSecondaryDisplayLabel === true)
    .map((prop: HSPropertyData) => prop.name as string)

  const searchableProperties = Object.values(schema.properties)
    .filter((prop: HSPropertyData) => prop.isSearchable === true)
    .map((prop: HSPropertyData) => prop.name as string)

  const parsedSchema = {
    name: schema?.name || 'my_object',
    labels: {
      singular: schema?.labels?.singular
        ? formatToHRText(schema?.labels?.singular)
        : formatToHRText(schema.name || 'my_object'),
      plural:
        schema?.labels?.plural ||
        formatToHRText(schema.name || 'my_object') + 's',
    },
    properties: Object.entries(schema.properties)
      .filter(([key, value]) => value != null)
      .map(([key, value]) => {
        const hsPropertyData: HSPropertyData = {
          name: value?.name || key.toLowerCase(),
          label: value?.label || formatToHRText(key),
          ...(value?.isPrimaryDisplayLabel && { isPrimaryDisplayLabel: true }),
          ...(value?.description && { description: value.description }),
          ...(value?.displayOrder && { displayOrder: value.displayOrder }),
          ...(value?.options?.length && { options: value.options }),
          type: value?.type || 'string',
          fieldType: value?.fieldType
            ? value.fieldType
            : value.type === 'dateTime' || value.type === 'date'
            ? 'date'
            : value.type === 'number'
            ? 'number'
            : value.type === 'enumeration'
            ? 'checkbox'
            : 'text',
        }

        if (
          value === (true || false || 'true' || 'false') ||
          value?.type === 'boolean'
        ) {
          hsPropertyData.type = 'enumeration'
          hsPropertyData.fieldType = 'booleancheckbox'
          hsPropertyData.options = [
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
          ]
        }
        if (
          hsPropertyData.type === 'enumeration' &&
          !hsPropertyData?.options?.length
        )
          hsPropertyData.options = [
            {
              label: 'Placeholder',
              value: 'placeholder',
            },
          ]

        return hsPropertyData
      }),
    associatedObjects: ['CONTACT'],
    ...(!!primaryDisplayProperty && { primaryDisplayProperty }),
    ...(!!secondaryDisplayProperties.length && { secondaryDisplayProperties }),
    ...(!!requiredProperties.length && { requiredProperties }),
    ...(!!searchableProperties.length && { requiredProperties }),
  }

  const prisma = new PrismaClient()
  await prisma.$connect()

  await prisma.hS_Schema.create({
    data: {
      name: parsedSchema.name,
      labels: {
        create: {
          singular: parsedSchema.labels.singular,
          plural: parsedSchema.labels.plural,
        },
      },
      properties: {
        //@ts-ignore
        create: parsedSchema.properties,
      },
      associatedObjects: {
        create: parsedSchema.associatedObjects.map((obj) => ({
          name: obj,
        })),
      },
      primaryDisplayProperty: parsedSchema.primaryDisplayProperty,
    },
  })

  await prisma.$disconnect()

  return parsedSchema
}

const parseValuesBySchema = (schema: sampleJSON, values: sampleJSON) => {
  const parsedValues = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      return [key, value]
    })
  )
  return parsedValues
}

const isHSSchema = (schema: any): schema is HSSchema => {
  return schema?.properties != null
}
const isSampleJSON = (schema: any): schema is sampleJSON => {
  let truth = true
  Object.values(schema).forEach((value) => {
    if (typeof value !== 'string') {
      truth = false
      return truth
    }
  })
  return truth
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (Object.keys(req.body).length !== 0) {
    if (isHSSchema(req.body.schema)) {
      return res.status(200).json({
        data: {
          input: req.body,
          output: parseSchema(req.body.schema),
        },
      })
    }
    if (isSampleJSON(req.body)) {
      return res.status(200).json({
        data: {
          input: req.body,
          output: parseSchema({ properties: req.body }),
        },
      })
    }
  }

  const testSchema = {
    name: 'test',
    labels: { singular: 'test' },
    properties: {
      firstname: 'Novella',
      lastname: 'Von',
      date_of_birth: '2002-07-12T11:27:25.022Z',
      salutation: 'Mrs.',
      twitterhandle: 'Meda46',
      email: 'Kyleigh.Satterfield@gmail.com',
      mobilephone: '(705) 261-5466 x53039',
      phone: '(587) 234-5588 x23915',
      fax: '845.552.3577 x4929',
      address: '23910 Fredy Harbor',
      city: 'South Hyman',
      state: 'Indiana',
      zip: '70869',
      country: 'Egypt',
      jobtitle: 'Product Infrastructure Technician',
      company: 'Abernathy and Sons',
      website: 'http://antique-blank.info',
      industry: 'Solutions',
    },
  }

  return res.status(200).json({
    message: `No input provided, showing example output`,
    data: {
      input: testSchema,
      output: parseSchema(testSchema),
    },
  })
}
