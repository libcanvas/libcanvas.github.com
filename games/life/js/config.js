
window.config = {
	updateTime: 60,
	field: {
		width : 80,
		height: 50
	},
	cell: {
		width : 5,
		height: 5,
		margin: 0
	}
};

config.canvasSize = {
	width : (config.cell.width +config.cell.margin)*config.field.width,
	height: (config.cell.height+config.cell.margin)*config.field.height
};