
export default class Point {
	public a: integer = 0;
	public b: integer = 0;

	constructor(a: integer, b: integer) 
	{
		this.a = a
		this.b = b
	}

	shift(p: Point)
	{
		this.a += p.a
		this.b += p.b
	}

	static null(): Point {
		return new Point(0, 0)
	}
}