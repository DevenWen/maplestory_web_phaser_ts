




/**
 * Wz 文件下的精灵对象
 */
export default class WzSprite {

  public width: number
  public height: number
  public originX: number
  public originY: number
  public textures_key: string

  constructor(textures_key: string, width: number, height: number, originX: number, originY: number) {
    this.width = width
    this.height = height
    this.originX = originX
    this.originY = originY
    this.textures_key = textures_key
  }
	
}