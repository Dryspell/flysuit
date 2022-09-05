import { StatsControls } from '../../components/MantineComponents/stats/stats-with-controls'
import {
  BadgeCard,
  testData as BadgeData,
} from '@/components/MantineComponents/cards/card-with-badges'
import {
  Container,
  Grid,
  SimpleGrid,
  Skeleton,
  useMantineTheme,
} from '@mantine/core'
import { StatsCard } from '@/components/MantineComponents/stats/card-with-progress'
import {
  StatsSegments,
  testData as StatsSegmentsData,
} from '@/components/MantineComponents/stats/stats-with-segments'

const PRIMARY_COL_HEIGHT = 300

export default function Page() {
  const theme = useMantineTheme()
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2

  return (
    <Container my="md">
      <SimpleGrid
        cols={2}
        spacing="md"
        breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
      >
        <BadgeCard
          image={BadgeData.image}
          title={BadgeData.title}
          description={BadgeData.description}
          country={BadgeData.description}
          badges={BadgeData.badges}
        />
        <Grid gutter="md">
          <Grid.Col>
            <StatsControls />
          </Grid.Col>
          <Grid.Col span={6}>
            <StatsCard />
          </Grid.Col>
          <Grid.Col span={6}>
            <StatsSegments
              total={StatsSegmentsData.total}
              diff={StatsSegmentsData.diff}
              data={StatsSegmentsData.data}
            />
          </Grid.Col>
        </Grid>
      </SimpleGrid>
    </Container>
  )
}
