import { StatsControls } from "../../components/MantineComponents/stats/stats-with-controls"
import {
	BadgeCard,
	testData as BadgeData,
} from "@/components/MantineComponents/cards/card-with-badges"
import { Container, Grid, SimpleGrid, useMantineTheme } from "@mantine/core"
import { StatsCard } from "@/components/MantineComponents/stats/card-with-progress"
import {
	StatsSegments,
	testData as StatsSegmentsData,
} from "@/components/MantineComponents/stats/stats-with-segments"
import * as React from "react"
import { LanguagePicker } from "@/components/MantineComponents/LanguagePicker"
import { GradientSegmentedControl } from "@/components/MantineComponents/GradientSegementedControl"
import { HeaderSearch } from "@/components/MantineComponents/HeaderWithSearch"
import { DoubleNavbar } from "@/components/MantineComponents/DoubleNavbar"
import { NavbarNested } from "@/components/MantineComponents/NestedNavbar"

const PRIMARY_COL_HEIGHT = 300
const links = [
	{
		link: "/about",
		label: "Features",
	},
	{
		link: "/pricing",
		label: "Pricing",
	},
	{
		link: "/learn",
		label: "Learn",
	},
	{
		link: "/community",
		label: "Community",
	},
]

export default function Page() {
	const theme = useMantineTheme()
	const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2

	return (
		<>
			<HeaderSearch links={links} />
			{/* <SimpleGrid
        cols={2}
        spacing="md"
        breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
      >
        <NavbarNested /> */}
			<Grid>
				<Grid.Col span={3}>
					{/* <NavbarNested /> */}
					<div>Drawer</div>
				</Grid.Col>
				<Grid.Col span={6}>
					<Container my="md">
						<Container my="md">
							<SimpleGrid
								cols={2}
								spacing="md"
								breakpoints={[{ maxWidth: "sm", cols: 1 }]}
							>
								<LanguagePicker />
								<GradientSegmentedControl />
							</SimpleGrid>
						</Container>
						<SimpleGrid
							cols={2}
							spacing="md"
							breakpoints={[{ maxWidth: "sm", cols: 1 }]}
						>
							<BadgeCard
								image={BadgeData.image}
								title={BadgeData.title}
								description={BadgeData.description}
								country={BadgeData.description}
								badges={BadgeData.badges}
							/>
							<Grid gutter="md">
								<Grid.Col>{/* <StatsControls /> */}</Grid.Col>
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
					{/* </SimpleGrid> */}
				</Grid.Col>
			</Grid>
		</>
	)
}
