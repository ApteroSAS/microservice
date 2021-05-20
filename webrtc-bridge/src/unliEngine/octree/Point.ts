// <copyright file="Point.cs">
//     Distributed under the BSD Licence (see LICENCE file).
//     
//     Copyright (c) 2014, Nition, http://www.momentstudio.co.nz/
//     Copyright (c) 2017, Máté Cserép, http://codenet.hu
//     All rights reserved.
// </copyright>
export default class Point
{
    /// <summary>
    /// Gets or sets the x coordinate.
    /// </summary>
    
    public x:number;

    /// <summary>
    /// Gets or sets the y coordinate.
    /// </summary>
    
    public y:number

    /// <summary>
    /// Gets or sets the z coordinate.
    /// </summary>
    
    public z:number; 

    /// <summary>
    /// Gets the length of the vector.
    /// </summary>
    getMagnitude() { 
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /// <summary>
    /// Gets the squared length of the vector.
    /// </summary>
    getSqrMagnitude() { return this.x * this.x + this.y * this.y + this.z * this.z; }

    /// <summary>
    /// Gets the vector with a magnitude of 1.
    /// </summary>
    getNormalized():Point
    {
        let copy:Point = this;
        copy.normalize();
        return copy;
    }

    /// <summary>
    /// Creates a new vector with given coordinates.
    /// </summary>
    /// <param name="x">The x coordinate.</param>
    /// <param name="y">The y coordinate.</param>
    /// <param name="z">The z coordinate.</param>
    constructor(x:number, y:number, z:number = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /// <summary>
    /// Normalizes the vector with a magnitude of 1.
    /// </summary>
    public normalize()
    {
        let num = this.getMagnitude();
        if (num > 1E-05)
        {
            let point = new Point(this.x / num, this.y / num, this.z / num);
            this.x = point.x;
            this.y = point.y;
            this.z = point.z;
            //this = this / num;
        }
        else
        {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
    }

    /// <summary>
    /// Returns a hash code for this instance.
    /// </summary>
    /// <returns>A hash code for this instance, suitable for use in hashing algorithms and data structures like a hash table.</returns>
    public getHashCode()
    {
        return this.x ^ this.y << 2 ^ this.z >> 2;
    }

    /// <summary>
    /// Determines whether the specified object as a <see cref="Point" /> is exactly equal to this instance.
    /// </summary>
    /// <remarks>
    /// Due to floating point inaccuracies, this might return false for vectors which are essentially (but not exactly) equal. Use the <see cref="op_Equality"/> to test two points for approximate equality.
    /// </remarks>
    /// <param name="other">The <see cref="Point" /> object to compare with this instance.</param>
    /// <returns><c>true</c> if the specified point is equal to this instance; otherwise, <c>false</c>.</returns>
    public equals(other:Point)
    {
        let result:boolean;
        result = (this.x === other.x) && (this.y === other.y) && (this.z === other.z);
        return result;
    }

    /// <summary>
    /// Returns a nicely formatted string for this vector.
    /// </summary>
    public toString():string
    {
        return "("+this.x+", "+this.y+", "+this.z+")";
    }

    /// <summary>
    /// Returns a nicely formatted string for this vector.
    /// </summary>
    /// <param name="format">The format for each coordinate.</param>
    /*public string ToString(string format)
    {
        return String.Format("({0}, {1}, {2})", x.ToString(format), y.ToString(format), z.ToString(format));
    }*/

    /// <summary>
    /// Shorthand for writing Point(0, 0, 0).
    /// </summary>
    public static zero = new Point(0, 0, 0);

    /// <summary>
    /// Shorthand for writing Point(1, 1, 1).
    /// </summary>
    public static one = new Point(1, 1, 1);

    /// <summary>
    /// Shorthand for writing Point(0, 0, 1).
    /// </summary>
    public static forward = new Point(0, 0, 1);

    /// <summary>
    /// Shorthand for writing Point(0, 0, -1).
    /// </summary>
    public static back = new Point(0, 0, -1);

    /// <summary>
    /// Shorthand for writing Point(0, 1, 0).
    /// </summary>
    public static up = new Point(0, 1, 0);

    /// <summary>
    /// Shorthand for writing Point(0, -1, 0).
    /// </summary>
    public static down = new Point(0, -1, 0);

    /// <summary>
    /// Shorthand for writing Point(-1, 0, 0).
    /// </summary>
    public static left = new Point(-1, 0, 0);

    /// <summary>
    /// Shorthand for writing Point(1, 0, 0).
    /// </summary>
    public static right = new Point(1, 0, 0);

    /// <summary>
    /// Returns the distance between two points.
    /// </summary>
    /// <param name="a">The first point.</param>
    /// <param name="b">The second point.</param>
    /// <returns>The distance.</returns>
    public static distance(a:Point, b:Point):number
    {
        let vector = new Point(a.x - b.x, a.y - b.y, a.z - b.z);
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    }

    /// <summary>
    /// Multiplies two vectors component-wise.
    /// </summary>
    /// <param name="a">The first vector.</param>
    /// <param name="b">The second vector.</param>
    /// <returns>The scaled up vector.</returns>
    public static scale(a:Point, b:Point):Point
    {
        return new Point(a.x * b.x, a.y * b.y, a.z * b.z);
    }

    /// <summary>
    /// Cross-product of two vectors.
    /// </summary>
    /// <param name="a">The first vector.</param>
    /// <param name="b">The second vector.</param>
    /// <returns>The cross product vector.</returns>
    public static cross(a:Point, b:Point):Point
    {
        return new Point(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    }

    /// <summary>
    /// Dot-product of two vectors.
    /// </summary>
    /// <param name="a">The first vector.</param>
    /// <param name="b">The second vector.</param>
    /// <returns>The dot product vector.</returns>
    public static dot(a:Point, b:Point):number
    {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    /// <summary>
    /// Returns a point that is made from the smallest components of two points.
    /// </summary>
    /// <param name="a">The first point.</param>
    /// <param name="b">The second point.</param>
    /// <returns>The minimal coordinates.</returns>
    public static min(a:Point, b:Point):Point
    {
        return new Point(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
    }

    /// <summary>
    /// Returns a point that is made from the largest components of two points.
    /// </summary>
    /// <param name="a">The first point.</param>
    /// <param name="b">The second point.</param>
    /// <returns>The maximal coordinates.</returns>
    public static max(a:Point, b:Point):Point
    {
        return new Point(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
    }

    /// <summary>
    /// Adds two vectors.
    /// </summary>
    /// <param name="a">The first vector.</param>
    /// <param name="b">The second vector.</param>
    public static operatorPlus(a:Point, b:Point):Point
    {
        return new Point(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    /// <summary>
    /// Subtracts one vector from another.
    /// </summary>
    /// <param name="a">The first vector.</param>
    /// <param name="b">The second vector.</param>
    public static operatorMinus(a:Point, b:Point):Point
    {
        return new Point(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    /// <summary>
    /// Negates a vector.
    /// </summary>
    /// <param name="a">The vector.</param>
    public static operatorMinus1(a:Point):Point
    {
        return new Point(-a.x, -a.y, -a.z);
    }

    /// <summary>
    /// Multiplies a vector by a number.
    /// </summary>
    /// <param name="a">The vector.</param>
    /// <param name="d">The number.</param>
    public static operatorMult(a:Point, d:number):Point
    {
        return new Point(a.x * d, a.y * d, a.z * d);
    }

    /// <summary>
    /// Multiplies a vector by a number.
    /// </summary>
    /// <param name="d">The number.</param>
    /// <param name="a">The vector.</param>
    public static operatorMult2(d:number, a:Point):Point
    {
        return new Point(a.x * d, a.y * d, a.z * d);
    }

    /// <summary>
    /// Divides a vector by a number.
    /// </summary>
    /// <param name="a">The vector.</param>
    /// <param name="d">The number.</param>
    public static operatorDiv(a:Point,  d:number):Point
    {
        return new Point(a.x / d, a.y / d, a.z / d);
    }

    /// <summary>
    /// Determines whether two points are approximately equal.
    /// </summary>
    /// <remarks>
    /// To allow for floating point inaccuracies, the two vectors are considered equal if the magnitude of their difference is less than 1e-5..
    /// </remarks>
    /// <param name="a">The first point.</param>
    /// <param name="b">The second point.</param>
    public static operatorEqual(a:Point, b:Point):boolean
    {
        return this.operatorMinus(a , b).getSqrMagnitude() < 9.99999944E-11;
    }

    /// <summary>
    /// Determines whether two points are different.
    /// </summary>
    /// <remarks>
    /// To allow for floating point inaccuracies, the two vectors are considered equal if the magnitude of their difference is less than 1e-5.
    /// </remarks>
    /// <param name="a">The first point.</param>
    /// <param name="b">The second point.</param>
    public static operatorNotEqual(a:Point, b:Point):boolean
    {
        return !this.operatorEqual(a, b);
    }
}
