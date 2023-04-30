/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	modularizeImports: {
		"@mui/icons-material": {
			transform: "@mui/icons-material/{{member}}",
		},
		"@mui/material": {
			transform: "@mui/material/{{member}}",
		},
	},
	images: {
		domains: ["res.cloudinary.com", "avatars.githubusercontent.com"],
	},
}
