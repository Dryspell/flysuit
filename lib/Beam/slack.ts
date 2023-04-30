import { serverEnv } from "@/env/server"
import type { Post } from "@prisma/client"
import { markdownToBlocks } from "@instantish/mack"
import { marked } from "marked"

export async function postToSlackIfEnabled({
	post,
	authorName,
}: {
	post: Post
	authorName: string
}) {
	if (serverEnv.ENABLE_SLACK_POSTING && serverEnv.SLACK_WEBHOOK_URL) {
		const tokens = marked.lexer(post.content)
		const summaryToken = tokens.find((token) => {
			return (
				token.type === "paragraph" ||
				token.type === "html" ||
				token.type === "image"
			)
		})
		const summaryBlocks = summaryToken
			? await markdownToBlocks(summaryToken.raw)
			: []
		return fetch(serverEnv.SLACK_WEBHOOK_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `*<${serverEnv.NEXT_APP_URL}/post/${post.id}|${post.title}>*`,
						},
					},
					summaryBlocks[0],
					{ type: "divider" },
					{
						type: "context",
						elements: [
							{
								type: "plain_text",
								text: authorName,
								emoji: true,
							},
						],
					},
				],
			}),
		})
	}
}

// Slack Channel Interface
// https://api.slack.com/types/channel
export interface Channel {
	id: string
	name: string
	is_channel: boolean
	created: number
	creator: string
	is_archived: boolean
	is_general: boolean
	name_normalized: string
	is_shared: boolean
	is_org_shared: boolean
	is_member: boolean
	is_private: boolean
	is_mpim: boolean
	last_read: string
	latest: Latest
	unread_count: number
	unread_count_display: number
	members: string[]
	topic: Purpose
	purpose: Purpose
	previous_names: string[]
}

export interface Latest {
	text: string
	username: string
	bot_id: string
	attachments: Attachment[]
	type: string
	subtype: string
	ts: string
}

export interface Attachment {
	text: string
	id: number
	fallback: string
}

export interface Purpose {
	value: string
	creator: string
	last_set: number
}

// Slack USER Interface
// https://api.slack.com/types/user
export interface User {
	id: string
	team_id: string
	name: string
	deleted: boolean
	color: string
	real_name: string
	tz: string
	tz_label: string
	tz_offset: number
	profile: Profile
	is_admin: boolean
	is_owner: boolean
	is_primary_owner: boolean
	is_restricted: boolean
	is_ultra_restricted: boolean
	is_bot: boolean
	is_stranger: boolean
	updated: number
	is_app_user: boolean
	has_2fa: boolean
	locale: string
}

export interface Profile {
	title: string
	phone: string
	skype: string
	real_name: string
	real_name_normalized: string
	display_name: string
	display_name_normalized: string
	status_text: string
	status_emoji: string
	status_expiration: number
	avatar_hash: string
	first_name: string
	last_name: string
	email: string
	image_original: string
	image_24: string
	image_32: string
	image_48: string
	image_72: string
	image_192: string
	image_512: string
	team: string
}

// Slack File Interface
// https://api.slack.com/types/file
export interface File {
	id: string
	created: number
	timestamp: number
	name: string
	title: string
	mimetype: string
	filetype: string
	pretty_type: string
	user: string
	editable: boolean
	size: number
	mode: string
	is_external: boolean
	external_type: string
	is_public: boolean
	public_url_shared: boolean
	display_as_bot: boolean
	username: string
	url_private: string
	url_private_download: string
	thumb_64: string
	thumb_80: string
	thumb_360: string
	thumb_360_w: number
	thumb_360_h: number
	thumb_160: string
	thumb_360_gif: string
	image_exif_rotation: number
	original_w: number
	original_h: number
	deanimate_gif: string
	pjpeg: string
	permalink: string
	permalink_public: string
	comments_count: number
	is_starred: boolean
	shares: Shares
	channels: string[]
	groups: any[]
	ims: any[]
	has_rich_preview: boolean
}

export interface Shares {
	public: Public
}

export interface Public {
	C0T8SE4AU: C0T8Se4Au[]
}

export interface C0T8Se4Au {
	reply_users: string[]
	reply_users_count: number
	reply_count: number
	ts: string
	thread_ts: string
	latest_reply: string
	channel_name: string
	team_id: string
}

// Slack Group Interface
// https://api.slack.com/types/group
export interface Group {
	id: string
	name: string
	is_group: string
	created: number
	creator: string
	is_archived: boolean
	is_mpim: boolean
	members: string[]
	topic: Purpose
	purpose: Purpose
	last_read: string
	latest: Latest
	unread_count: number
	unread_count_display: number
}

// Slack mpim (multiparty IM) Interface
// https://api.slack.com/types/mpim
export interface MPIM {
	id: string
	name: string
	is_mpim: boolean
	is_group: boolean
	created: number
	creator: string
	members: string[]
	last_read: string
	latest: Latest
	unread_count: number
	unread_count_display: number
}

// Slack IM Interface
// https://api.slack.com/types/im
export interface IM {
	id: string
	is_im: boolean
	user: string
	created: number
	is_user_deleted: boolean
}

// Slack UserGroup Interface
// https://api.slack.com/types/usergroup
export interface MySchema {
	id: string
	team_id: string
	is_usergroup: boolean
	name: string
	description: string
	handle: string
	is_external: boolean
	date_create: number
	date_update: number
	date_delete: number
	auto_type: string
	created_by: string
	updated_by: string
	deleted_by: null
	prefs: Prefs
	users: string[]
	user_count: string
}

export interface Prefs {
	channels: any[]
	groups: any[]
}

// Slack Event Interface
// https://api.slack.com/types/event
export interface Event {
	token: string
	team_id: string
	api_app_id: string
	event: EventData
	type: string
	authed_users: string[]
	event_id: string
	event_time: number
}

export interface EventData {
	type: string
	event_ts: string
	user: string
}
