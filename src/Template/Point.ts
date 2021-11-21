
export default class Point {
	public a: number = 0;
	public b: number = 0;

	constructor(a: number, b: number) 
	{
		this.a = a
		this.b = b
	}

	shift(p: Point)
	{
		this.a += p.a
		this.b += p.b
	}
}