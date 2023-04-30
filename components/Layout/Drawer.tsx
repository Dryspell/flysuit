import * as React from "react"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import Divider from "@mui/material/Divider"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import InboxIcon from "@mui/icons-material/MoveToInbox"
import MailIcon from "@mui/icons-material/Mail"

const drawerLinksList = [
	[
		{
			text: "Inbox",
			icon: <InboxIcon />,
			navigateLink: "/inbox",
		},
		{
			text: "Starred",
			icon: <MailIcon />,
			navigateLink: "/starred",
		},
		{
			text: "Send email",
			icon: <MailIcon />,
			navigateLink: "/send-email",
		},
	],
	[
		{
			text: "All mail",
			icon: <MailIcon />,
			navigateLink: "/all-mail",
		},
		{
			text: "Trash",
			icon: <MailIcon />,
			navigateLink: "/trash",
		},
		{
			text: "Spam",
			icon: <MailIcon />,
			navigateLink: "/spam",
		},
	],
]

const drawerLinksListNode = (
	drawerLinksList: Array<
		{ text: string; icon: JSX.Element; navigateLink: string }[]
	>
) => {
	return (
		<>
			{drawerLinksList.map((list, index) => {
				return (
					<List key={index}>
						{list.map((item, index) => {
							return (
								<ListItem key={item.text} disablePadding>
									<ListItemButton>
										<ListItemIcon>{item.icon}</ListItemIcon>
										<ListItemText primary={item.text} />
									</ListItemButton>
								</ListItem>
							)
						})}
						{index !== drawerLinksList.length - 1 && <Divider />}
					</List>
				)
			})}
		</>
	)
}

export default function TemporaryDrawer(props: {
	drawerOpen: boolean
	setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
	const anchor = "left"

	return (
		<div>
			<Drawer
				anchor={anchor}
				open={props.drawerOpen}
				onClose={() => props.setDrawerOpen(false)}
			>
				<Box
					sx={{ width: 250 }}
					role="presentation"
					onClick={() => props.setDrawerOpen(false)}
					onKeyDown={() => props.setDrawerOpen(false)}
				>
					{drawerLinksListNode(drawerLinksList)}
				</Box>
			</Drawer>
			))
		</div>
	)
}
