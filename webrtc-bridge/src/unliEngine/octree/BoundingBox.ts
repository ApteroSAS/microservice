// <copyright file="BoundingBox.cs">
//     Distributed under the BSD Licence (see LICENCE file).
//     
//     Copyright (c) 2014, Nition, http://www.momentstudio.co.nz/
//     Copyright (c) 2017, Máté Cserép, http://codenet.hu
//     All rights reserved.

import Point from "./Point";

// </copyright>
export default class BoundingBox
{
    /// <summary>
    /// Gets or sets the center of the bounding box.
    /// </summary>
    
    public center :Point;

    /// <summary>
    /// Gets or sets the extents of the bounding box. This is always half of the <see cref="Size"/>.
    /// </summary>
    
    public extents  :Point;

    /// <summary>
    /// Gets or sets the size of the bounding box. This is always twice as large as the <see cref="Extents"/>.
    /// </summary>
    getSize():Point { return Point.operatorMult(this.extents , 2); }
    setSize(value) { this.extents = Point.operatorMult(value , 0.5); }

    /// <summary>
    /// Gets or sets the minimal point of the box.
    /// </summary>
    /// <remarks>
    /// This is always equal to <c>center-extents</c>.
    /// </remarks>
    getMin():Point { return Point.operatorMinus(this.center , this.extents); }
    setMin(value:Point) { this.setMinMax(value, this.getMax()); }

    /// <summary>
    /// Gets or sets the maximal point of the box.
    /// </summary>
    /// <remarks>
    /// This is always equal to <c>center+extents</c>.
    /// </remarks>
    getMax():Point { return Point.operatorPlus(this.center , this.extents); }
    setMax(value:Point) { this.setMinMax(this.getMin(), value); }

    /// <summary>
    /// Creates a new bounding box.
    /// </summary>
    /// <param name="center">The center of the box.</param>
    /// <param name="size">The size of the box.</param>
    constructor(center:Point, size:Point)
    {
        this.center = center;
        this.extents = Point.operatorMult(size , 0.5);
    }

    /// <summary>
    /// Sets the bounds to the min and max value of the box.
    /// </summary>
    /// <param name="min">The minimal point.</param>
    /// <param name="max">The maximal point.</param>
    public setMinMax(min:Point, max:Point)
    {
        this.extents = Point.operatorMult(Point.operatorMinus(max , min) , 0.5);
        this.center = Point.operatorPlus(min , this.extents);
    }

    /// <summary>
    /// Grows the bounding box include the point.
    /// </summary>
    /// <param name="point">The specified point to include.</param>
    public encapsulate(point:Point)
    {
        this.setMinMax(Point.min(this.getMin(), point), Point.max(this.getMax(), point));
    }

    /// <summary>
    /// Grows the bounding box include the other box.
    /// </summary>
    /// <param name="box">The specified box to include.</param>
    public encapsulateBox(box:BoundingBox)
    {
        this.encapsulate(Point.operatorMinus(box.center , box.extents));
        this.encapsulate(Point.operatorMinus(box.center , box.extents));
    }

    /// <summary>
    /// Expands the bounds by increasing its <see cref="Size"/> by <paramref name="amount"/> along each side.
    /// </summary>
    /// <param name="amount">The expansions for each dimension.</param>
    public expand(amount:number)
    {
        amount *= 0.5;
        this.extents = Point.operatorPlus(this.extents , new Point(amount, amount, amount));
    }

    /// <summary>
    /// Expands the bounds by increasing its <see cref="Size"/> by <paramref name="amount"/> along each side.
    /// </summary>
    /// <param name="amount">The expansions for each dimension in order.</param>
    public expandPoint(amount:Point)
    {
        this.extents = Point.operatorPlus(this.extents , Point.operatorMult(amount , 0.5));
    }

    /// <summary>
    /// Determines whether the box contains the point.
    /// </summary>
    /// <param name="point">The point to test.</param>
    /// <returns><c>true</c> if the box contains the point; otherwise, <c>false</c>.</returns>
    public contains(point:Point)
    {
        return this.getMin().x <= point.x && this.getMax().x >= point.x &&
            this.getMin().y <= point.y && this.getMax().y >= point.y &&
            this.getMin().z <= point.z && this.getMax().z >= point.z;
    }

    /// <summary>
    /// Determines whether the bounding box intersects with another box.
    /// </summary>
    /// <param name="box">The box to test.</param>
    /// <returns><c>true</c> if the bounding box intersects with another box, <c>false</c> otherwise.</returns>
    public intersects(box:BoundingBox)
    {
        return this.getMin().x <= box.getMax().x && this.getMax().x >= box.getMin().x &&
            this.getMin().y <= box.getMax().y && this.getMax().y >= box.getMin().y &&
            this.getMin().z <= box.getMax().z && this.getMax().z >= box.getMin().z;
    }

    /// <summary>
    /// Determines whether the bounding box intersects with a ray.
    /// </summary>
    /// <param name="ray">The ray to test.</param>
    /// <returns><c>true</c> if the box intersects with the ray, <c>false</c> otherwise.</returns>
    /*public bool IntersectRay(Ray ray)
    {
        float distance;
        return IntersectRay(ray, out distance);
    }*/

    /// <summary>
    /// Determines whether the bounding box intersects with a ray.
    /// </summary>
    /// <param name="ray">The ray to test.</param>
    /// <param name="distance">The calculated distance from the origin of the ray to the box along the ray.</param>
    /// <returns><c>true</c> if the box intersects with the ray, <c>false</c> otherwise.</returns>
    /*public bool IntersectRay(Ray ray, out float distance)
    {
        Point dirFrac = new Point(
            1f / ray.Direction.x,
            1f / ray.Direction.y,
            1f / ray.Direction.z
        );

        float t1 = (this.getMin().x - ray.Origin.x) * dirFrac.x;
        float t2 = (this.getMax().x - ray.Origin.x) * dirFrac.x;
        float t3 = (this.getMin().y - ray.Origin.y) * dirFrac.y;
        float t4 = (this.getMax().y - ray.Origin.y) * dirFrac.y;
        float t5 = (this.getMin().z - ray.Origin.z) * dirFrac.z;
        float t6 = (this.getMax().z - ray.Origin.z) * dirFrac.z;

        float tmin = Math.this.getMax()(Math.this.getMax()(Math.this.getMin()(t1, t2), Math.this.getMin()(t3, t4)), Math.this.getMin()(t5, t6));
        float tmax = Math.this.getMin()(Math.this.getMin()(Math.this.getMax()(t1, t2), Math.this.getMax()(t3, t4)), Math.this.getMax()(t5, t6));

        // if tmax < 0, ray (line) is intersecting AABB, but the whole AABB is behind us
        if (tmax < 0)
        {
            distance = tmax;
            return false;
        }

        // if tmin > tmax, ray doesn't intersect AABB
        if (tmin > tmax)
        {
            distance = tmax;
            return false;
        }

        distance = tmin;
        return true;
    }*/

    /// <summary>
    /// Returns a hash code for this instance.
    /// </summary>
    /// <returns>A hash code for this instance, suitable for use in hashing algorithms and data structures like a hash table.</returns>
    /*public override int GetHashCode()
    {
        return Center.GetHashCode() ^ Extents.GetHashCode() << 2;
    }*/

    /// <summary>
    /// Determines whether the specified object as a <see cref="BoundingBox" /> is equal to this instance.
    /// </summary>
    /// <param name="other">The <see cref="BoundingBox" /> object to compare with this instance.</param>
    /// <returns><c>true</c> if the specified box is equal to this instance; otherwise, <c>false</c>.</returns>
    /*public override bool Equals(object other)
    {
        bool result;
        if (!(other is BoundingBox))
        {
            result = false;
        }
        else
        {
            BoundingBox box = (BoundingBox)other;
            result = (Center.Equals(box.Center) && Extents.Equals(box.Extents));
        }
        return result;
    }*/

    /// <summary>
    /// Returns a nicely formatted string for this bounding box.
    /// </summary>
    publictoString()
    {
        return "Center: "+this.center+", Extents: "+this.extents+"";
    }

    /// <summary>
    /// Returns a nicely formatted string for this bounding box.
    /// </summary>
    /// <param name="format">The format for the center and the extent.</param>
    /*public string ToString(string format)
    {
        return String.Format("Center: {0}, Extents: {1}",
            Center.ToString(format),
            Extents.ToString(format)
        );
    }*/

    /// <summary>
    /// Determines whether two bounding boxes are equal.
    /// </summary>
    /// <param name="lhs">The first box.</param>
    /// <param name="rhs">The second box.</param>
    /*public static bool operator ==(BoundingBox lhs, BoundingBox rhs)
    {
        return lhs.Center == rhs.Center && lhs.Extents == rhs.Extents;
    }*/

    /// <summary>
    /// Determines whether two bounding boxes are different.
    /// </summary>
    /// <param name="lhs">The first box.</param>
    /// <param name="rhs">The second box.</param>
    /*public static bool operator !=(BoundingBox lhs, BoundingBox rhs)
    {
        return !(lhs == rhs);
    }*/
}

