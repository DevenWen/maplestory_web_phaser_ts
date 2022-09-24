var ZMAP = [
	"mobEquipFront",
	"tamingMobFront",
	"mobEquipMid",
	"saddleFront",
	"mobEquipUnderSaddle",
	"tamingMobMid",
	"characterStart",
	"emotionOverBody",
	"weaponWristOverGlove",
	"capeOverHead",
	"weaponOverGlove",
	"gloveWristOverHair",
	"gloveOverHair",
	"handOverHair",
	"weaponOverHand",
	"shieldOverHair",
	"gloveWristBelowWeapon",
	"gloveBelowWeapon",
	"handBelowWeapon",
	"weaponOverArm",
	"gloveWristBelowMailArm",
	"mailArmOverHair",
	"gloveBelowMailArm",
	"armOverHair",
	"mailArmOverHairBelowWeapon",
	"armOverHairBelowWeapon",
	"weaponBelowArm",
	"capOverHair",
	"accessoryEarOverHair",
	"accessoryOverHair",
	"hairOverHead",
	"accessoryEyeOverCap",
	"capAccessory",
	"cap",
	"hair",
	"accessoryEye",
	"accessoryEyeShadow",
	"accessoryFace",
	"capAccessoryBelowAccFace",
	"accessoryEar",
	"capBelowAccessory",
	"accessoryFaceOverFaceBelowCap",
	"face",
	"accessoryEyeBelowFace",
	"accessoryFaceBelowFace",
	"hairShade",
	"head",
	"cape",
	"gloveWrist",
	"mailArm",
	"glove",
	"hand",
	"arm",
	"weapon",
	"shield",
	"weaponOverArmBelowHead",
	"gloveWristBelowHead",
	"mailArmBelowHeadOverMailChest",
	"gloveBelowHead",
	"armBelowHeadOverMailChest",
	"mailArmBelowHead",
	"armBelowHead",
	"weaponOverBody",
	"mailChestTop",
	"gloveWristOverBody",
	"mailChestOverHighest",
	"pantsOverMailChest",
	"mailChest",
	"shoesTop",
	"pantsOverShoesBelowMailChest",
	"shoesOverPants",
	"mailChestOverPants",
	"pants",
	"shoes",
	"pantsBelowShoes",
	"mailChestBelowPants",
	"gloveOverBody",
	"body",
	"gloveWristBelowBody",
	"gloveBelowBody",
	"capAccessoryBelowBody",
	"shieldBelowBody",
	"capeBelowBody",
	"hairBelowBody",
	"weaponBelowBody",
	"backHairOverCape",
	"backWing",
	"backWeaponOverShield",
	"backShield",
	"backCapOverHair",
	"backHair",
	"backCap",
	"backWeaponOverHead",
	"backHairBelowCapWide",
	"backHairBelowCapNarrow",
	"backHairBelowCap",
	"backCape",
	"backAccessoryOverHead",
	"backAccessoryFaceOverHead",
	"backHead",
	"backMailChestOverPants",
	"backPantsOverMailChest",
	"backMailChest",
	"backPantsOverShoesBelowMailChest",
	"backShoes",
	"backPants",
	"backShoesBelowPants",
	"backPantsBelowShoes",
	"backMailChestBelowPants",
	"backWeaponOverGlove",
	"backGloveWrist",
	"backGlove",
	"backBody",
	"backAccessoryEar",
	"backAccessoryFace",
	"backCapAccessory",
	"backMailChestAccessory",
	"backShieldBelowBody",
	"backHairBelowHead",
	"backWeapon",
	"characterEnd",
	"saddleRear",
	"tamingMobRear",
	"mobEquipRear",
	"backMobEquipFront",
	"backTamingMobFront",
	"backMobEquipMid",
	"backSaddle",
	"backMobEquipUnderSaddle",
	"backTamingMobMid",
	"Sd",
	"Tm",
	"Sr",
	"Wg",
	"Ma",
	"Ws",
	"Pn",
	"So",
	"Si",
	"Wp",
	"Gv",
	"Ri",
	"Cp",
	"Ay",
	"As",
	"Ae",
	"Am",
	"Af",
	"At",
	"Fc",
	"Hr",
	"Hd",
	"Bd"
]

export function depthOf_Z(z: string)
{
	return ZMAP.indexOf(z)
}

export enum AvatarPart {
	Head = 'head',
	Body = 'body',
	Hair = 'hair',
	Cap = 'cap',
	Longcoat = 'longcoat',
	Coat = 'coat',
	Pants = 'pants',
	Shoes = 'shoes',
	Weapon = 'weapon'
}