import { Container, LoadingOverlay } from "@mantine/core"
import { AppBar, Button, IconButton, Toolbar, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import React from "react"
import MenuIcon from "@mui/icons-material/Menu"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import TemporaryDrawer from "./Drawer"

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const { data: session, status: sessionStatus } = useSession()
	const router = useRouter()

	if (sessionStatus === "unauthenticated") {
		signIn().catch((err) => console.log(err))
	}

	const [drawerOpen, setDrawerOpen] = React.useState(false)

	return (
		<Container fluid className="p-10">
			{sessionStatus === "authenticated" ? (
				<>
					<AppBar component="nav">
						<Toolbar className="justify-between">
							<IconButton
								size="large"
								edge="start"
								color="inherit"
								aria-label="open drawer"
								sx={{ mr: 2 }}
								onClick={() => setDrawerOpen(true)}
							>
								<MenuIcon />
							</IconButton>
							<Typography
								variant="h6"
								noWrap
								component="div"
								sx={{ display: { xs: "none", sm: "block" } }}
							>
								{`${session?.user?.name || "Unknown User"}, Game Room: ${
									router.query.id as string
								}`}
							</Typography>
							<Box sx={{ flexGrow: 1 }} />

							<Box sx={{ display: { xs: "none", sm: "block" } }}></Box>
						</Toolbar>
					</AppBar>
					<TemporaryDrawer
						drawerOpen={drawerOpen}
						setDrawerOpen={setDrawerOpen}
					/>
					<Box component="main">{children}</Box>
				</>
			) : (
				<LoadingOverlay visible />
			)}
		</Container>
	)
}
