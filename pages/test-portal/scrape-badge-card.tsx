import {
  BadgeCard,
  testData as BadgeData,
} from '@/components/MantineComponents/cards/card-with-badges'
import { Container, useMantineTheme } from '@mantine/core'

const PRIMARY_COL_HEIGHT = 300

export default function Page() {
  const theme = useMantineTheme()
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2

  return (
    <Container my="md">
      <BadgeCard
        image={BadgeData.image}
        title={BadgeData.title}
        description={BadgeData.description}
        country={BadgeData.description}
        badges={BadgeData.badges}
      />
    </Container>
  )
}
