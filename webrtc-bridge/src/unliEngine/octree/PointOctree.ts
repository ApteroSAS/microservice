// <copyright file="PointOctree.cs">
//     Distributed under the BSD Licence (see LICENCE file).
//     
//     Copyright (c) 2014, Nition, http://www.momentstudio.co.nz/
//     Copyright (c) 2017, Máté Cserép, http://codenet.hu
//     All rights reserved.
// </copyright>

/// <summary>
/// A Dynamic Octree for storing any objects that can be described as a single point
/// </summary>
/// <seealso cref="BoundsOctree{T}"/>
/// <remarks>
/// Octree:	An octree is a tree data structure which divides 3D space into smaller partitions (nodes) 
/// and places objects into the appropriate nodes. This allows fast access to objects
/// in an area of interest without having to check every object.
/// 
/// Dynamic: The octree grows or shrinks as required when objects as added or removed.
/// It also splits and merges nodes as appropriate. There is no maximum depth.
/// Nodes have a constant - <see cref="PointOctree{T}.Node.NumObjectsAllowed"/> - which sets the amount of items allowed in a node before it splits.
/// 
/// See also BoundsOctree, where objects are described by AABB bounds.
/// </remarks>
/// <typeparam name="T">The content of the octree can be anything, since the bounds data is supplied separately.</typeparam>
import BoundingBox from "@root/unliEngine/octree/BoundingBox";
import Point from "@root/unliEngine/octree/Point";
import OctNode, {Equalable} from "@root/unliEngine/octree/PointOctreeNode";

export default class PointOctree<T extends Equalable>
{
    /// <summary>
    /// The console
    /// </summary>
    private static readonly console = console;

    /// <summary>
    /// Root node of the octree
    /// </summary>
    private _rootNode:OctNode<T>;

    /// <summary>
    /// Size that the octree was on creation
    /// </summary>
    private readonly _initialSize:number;

    /// <summary>
    /// Minimum side length that a node can be - essentially an alternative to having a max depth
    /// </summary>
    private readonly _minSize:number;

    /// <summary>
    /// The total amount of objects currently in the tree
    /// </summary>
    public count :number;

    /// <summary>
    /// Gets the bounding box that represents the whole octree
    /// </summary>
    /// <value>The bounding box of the root node.</value>
    public MaxBounds:BoundingBox;
    
    getMaxBounds() { 
        return new BoundingBox(this._rootNode.center, new Point(this._rootNode.sideLength, this._rootNode.sideLength, this._rootNode.sideLength));
    }
    

    /// <summary>
    /// Constructor for the point octree.
    /// </summary>
    /// <param name="initialWorldSize">Size of the sides of the initial node. The octree will never shrink smaller than this.</param>
    /// <param name="initialWorldPos">Position of the centre of the initial node.</param>
    /// <param name="minNodeSize">Nodes will stop splitting if the new nodes would be smaller than this.</param>
    constructor(initialWorldSize:number, initialWorldPos:Point,  minNodeSize:number)
    {
        if (minNodeSize > initialWorldSize)
        {
            console.warn(
                "Minimum node size must be at least as big as the initial world size. Was: " + minNodeSize
                + " Adjusted to: " + initialWorldSize);
            minNodeSize = initialWorldSize;
        }
        this.count = 0;
        this._initialSize = initialWorldSize;
        this._minSize = minNodeSize;
        this._rootNode = new OctNode(this._initialSize, this._minSize,initialWorldPos);
    }

    // #### PUBLIC METHODS ####

    /// <summary>
    /// Add an object.
    /// </summary>
    /// <param name="obj">Object to add.</param>
    /// <param name="objPos">Position of the object.</param>
    public add(obj:T, objPos:Point)
    {
        // Add object or expand the octree until it can be added
        let count:number = 0; // Safety check against infinite/excessive growth
        while (!this._rootNode.add(obj, objPos))
        {
            this.grow(Point.operatorMinus(objPos , this._rootNode.center));
            if (++count > 20)
            {
                console.error(
                    "Aborted Add operation as it seemed to be going on forever (" + (count - 1)
                    + ") attempts at growing the octree.");
                return;
            }
        }
        this.count++;
    }

    /// <summary>
    /// Remove an object. Makes the assumption that the object only exists once in the tree.
    /// </summary>
    /// <param name="obj">Object to remove.</param>
    /// <returns>True if the object was removed successfully.</returns>
    public remove(obj:T):boolean
    {
        let removed:boolean = this._rootNode.remove(obj);

        // See if we can shrink the octree down now that we've removed the item
        if (removed)
        {
            this.count--;
            this.shrink();
        }

        return removed;
    }

    /// <summary>
    /// Removes the specified object at the given position. Makes the assumption that the object only exists once in the tree.
    /// </summary>
    /// <param name="obj">Object to remove.</param>
    /// <param name="objPos">Position of the object.</param>
    /// <returns>True if the object was removed successfully.</returns>
    public removePos(obj:T, objPos:Point):boolean
    {
        let removed:boolean = this._rootNode.removePoint(obj, objPos);

        // See if we can shrink the octree down now that we've removed the item
        if (removed)
        {
            this.count--;
            this.shrink();
        }

        return removed;
    }

    /// <summary>
    /// Returns objects that are within <paramref name="maxDistance"/> of the specified ray.
    /// If none, returns an empty array (not null).
    /// </summary>
    /// <param name="ray">The ray. Passing as ref to improve performance since it won't have to be copied.</param>
    /// <param name="maxDistance">Maximum distance from the ray to consider.</param>
    /// <returns>Objects within range.</returns>
    /*public getNearby(ray:Ray, maxDistance:number):T[]
    {
        let collidingWith:T[] = [];
        this._rootNode.getNearby(ray, maxDistance, collidingWith);
        return collidingWith;
    }*/

    /// <summary>
    /// Returns objects that are within <paramref name="maxDistance"/> of the specified position.
    /// If none, returns an empty array (not null).
    /// </summary>
    /// <param name="position">The position. Passing as ref to improve performance since it won't have to be copied.</param>
    /// <param name="maxDistance">Maximum distance from the position to consider.</param>
    /// <returns>Objects within range.</returns>
    public GetNearby(position:Point, maxDistance:number):T[]
    {
        let collidingWith:T[] = [];
        this._rootNode.getNearby(position, maxDistance, collidingWith);
        return collidingWith;
    }

    /// <summary>
    /// Returns all objects in the tree.
    /// If none, returns an empty array (not null).
    /// </summary>
    /// <returns>All objects.</returns>
    public getAll():any
    {
        let objects:T[] = [];
        this._rootNode.getAll(objects);
        return objects;
    }

    // #### PRIVATE METHODS ####

    /// <summary>
    /// Grow the octree to fit in all objects.
    /// </summary>
    /// <param name="direction">Direction to grow.</param>
    private grow(direction:Point)
    {
        let xDirection:number = direction.x >= 0 ? 1 : -1;
        let yDirection:number = direction.y >= 0 ? 1 : -1;
        let zDirection:number = direction.z >= 0 ? 1 : -1;
        let oldRoot:OctNode<T> = this._rootNode;
        let half:number = this._rootNode.sideLength / 2;
        let newLength:number = this._rootNode.sideLength * 2;
        let newCenter:Point = Point.operatorPlus(this._rootNode.center , new Point(xDirection * half, yDirection * half, zDirection * half));

        // Create a new, bigger octree root node
        this._rootNode = new OctNode(newLength, this._minSize, newCenter);

        if (oldRoot.hasAnyObjects())
        {
            // Create 7 new octree children to go with the old root as children of the new root
            let rootPos:number = this._rootNode.bestFitChild(oldRoot.center);
            let children:OctNode<T>[] = new OctNode[8];
            for (let i = 0; i < 8; i++)
            {
                if (i == rootPos)
                {
                    children[i] = oldRoot;
                }
                else
                {
                    xDirection = i % 2 == 0 ? -1 : 1;
                    yDirection = i > 3 ? -1 : 1;
                    zDirection = (i < 2 || (i > 3 && i < 6)) ? -1 : 1;
                    children[i] = new OctNode<T>(
                        oldRoot.sideLength,
                        this._minSize,
                        Point.operatorPlus(newCenter , new Point(xDirection * half, yDirection * half, zDirection * half)));
                }
            }

            // Attach the new children to the new root node
            this._rootNode.setChildren(children);
        }
    }

    /// <summary>
    /// Shrink the octree if possible, else leave it the same.
    /// </summary>
    private shrink()
    {
        this._rootNode = this._rootNode.shrinkIfPossible(this._initialSize);
    }
}