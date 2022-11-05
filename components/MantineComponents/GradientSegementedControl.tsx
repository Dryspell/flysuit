import { createStyles, SegmentedControl } from '@mantine/core'
import { useState } from 'react'

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    boxShadow: theme.shadows.md,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1]
    }`,
  },

  active: {
    backgroundImage: theme.fn.gradient({ from: 'pink', to: 'orange' }),
  },

  control: {
    border: '0 !important',
  },

  labelActive: {
    color: `${theme.white} !important`,
  },
}))

export function GradientSegmentedControl(props: any) {
  const { classes } = useStyles()
  const data =
    props?.data?.length > 0
      ? props.data
      : ['All', 'AI/ML', 'C++', 'Rust', 'TypeScript']
  const [value, setValue] = useState(data[0])
  const onChange = (val: string) => {
    setValue(val)
    props.onChange(val)
  }

  return (
    <SegmentedControl
      radius="xl"
      size="md"
      data={data}
      classNames={classes}
      value={value}
      onChange={onChange}
    />
  )
}
