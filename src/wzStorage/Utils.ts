const RES_PATHS = [
	"Character/00002000.img",
	"Character/00012000.img",
	"Character/Face/00020000.img",
	"Character/Hair/00030020.img",
	"Character/Hair/00030000.img",
	"Character/Cap/01000001.img",
	"Character/Cap/01000003.img",
	"Character/Coat/01040002.img",
	"Character/Pants/01060003.img",
	"Map/Obj/acc1/grassySoil/nature.img",
	"Map/Obj/acc1/grassySoil/market.img",
	"Map/Obj/acc1/grassySoil/artificiality.img",
	"Map/Obj/acc1/lv200/archer.img",
	"Map/Back/grassySoil.img"

]


function textureKeyChanger(path) {
	// 根据加载路径，拆分大的 texture 和 sub frame 的数据，并返回 sub frame
	let res = RES_PATHS.find(res => path.startsWith(`/${res}`))
	if(res) {
		return path.replace(`/${res}`, "").replaceAll("/", "-") + ".jpg"
	}
	throw new Error("can not find the resouces path for " + path)
}

function getFromTiledProperties(properties, key) {
	return properties
					.filter((item) => item.name == key)
					.map((item) => item.value)
					.pop()
}


export {RES_PATHS, textureKeyChanger, getFromTiledProperties}