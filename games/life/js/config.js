
window.config = {
	updateTime: 300,
	field: {
		width : 50,
		height: 50
	},
	cell: {
		width : 10,
		height: 10,
		margin: 1
	}
};

config.canvasSize = {
	width : (config.cell.width +config.cell.margin)*config.field.width,
	height: (config.cell.height+config.cell.margin)*config.field.height
};