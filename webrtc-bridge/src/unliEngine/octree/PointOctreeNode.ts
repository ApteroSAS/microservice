// <copyright file="PointOctreeNode.cs">
//     Distributed under the BSD Licence (see LICENCE file).
//     
//     Copyright (c) 2014, Nition, http://www.momentstudio.co.nz/
//     Copyright (c) 2017, Máté Cserép, http://codenet.hu
//     All rights reserved.
// </copyright>
/// <summary>
/// A node in a PointOctree

import Point from "@root/unliEngine/octree/Point";
import BoundingBox from "@root/unliEngine/octree/BoundingBox";
/// <summary>
/// An object in the octree
/// </summary>

export interface Equalable {
    equals(t:any):boolean
}

class OctreeObject<T extends Equalable>
{

    constructor(obj: T, pos: Point) {
        this.obj = obj;
        this.pos = pos;
    }

/// <summary>
    /// Object content
    /// </summary>
    public obj:T;

    /// <summary>
    /// Object position
    /// </summary>
    public pos:Point;
}

/// </summary>
export default class OctNode<T extends Equalable>
{
    /// <summary>
    /// The logger
    /// </summary>
    private static readonly Logger = console;

    /// <summary>
    /// this.center of this node
    /// </summary>
    public center:Point;

    /// <summary>
    /// Length of the sides of this node
    /// </summary>
    public sideLength:number;

    /// <summary>
    /// Minimum size for a node in this octree
    /// </summary>
    private _minSize:number;

    /// <summary>
    /// Bounding box that represents this node
    /// </summary>
    private _bounds:BoundingBox = null;//TODO

    /// <summary>
    /// Objects in this node
    /// </summary>
    private readonly _objects:OctreeObject<T>[] = [];

    /// <summary>
    /// Child nodes, if any
    /// </summary>
    private  _children:OctNode<T>[] = null;

    /// <summary>
    /// Bounds of potential children to this node. These are actual size (with looseness taken into account), not base size
    /// </summary>
    private  _childBounds:BoundingBox[];

    /// <summary>
    /// If there are already this.numObjectsAllowed in a node, we split it into children
    /// </summary>
    /// <remarks>
    /// A generally good number seems to be something around 8-15
    /// </remarks>
    private numObjectsAllowed = 8;

    /// <summary>
    /// For reverting the bounds size after temporary changes
    /// </summary>
    private _actualBoundsSize:Point;

    /// <summary>
    /// Gets a value indicating whether this node has children
    /// </summary>
    hasChildren():boolean { return this._children != null; }

    /// <summary>
    /// Constructor.
    /// </summary>
    /// <param name="baseLengthVal">Length of this node, not taking looseness into account.</param>
    /// <param name="minSizeVal">Minimum size of nodes in this octree.</param>
    /// <param name="centerVal">this.center position of this node.</param>
    constructor(baseLengthVal:number, minSizeVal:number,  centerVal:Point)
    {
        this.setValues(baseLengthVal, minSizeVal, centerVal);
    }

    // #### PUBLIC METHODS ####

    /// <summary>
    /// Add an object.
    /// </summary>
    /// <param name="obj">Object to add.</param>
    /// <param name="objPos">Position of the object.</param>
    /// <returns></returns>
    public add(obj:T, objPos:Point):boolean
    {
        if (!OctNode.encapsulates(this._bounds, objPos))
        {
            return false;
        }
        this.subAdd(obj, objPos);
        return true;
    }

    arrayRemove(array,value){
        for( var i = 0; i < array.length; i++){
            if ( array[i] === value) {
                array.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /// <summary>
    /// remove an object. Makes the assumption that the object only exists once in the tree.
    /// </summary>
    /// <param name="obj">Object to remove.</param>
    /// <returns>True if the object was removed successfully.</returns>
    public remove(obj: T):boolean
    {
        let removed:boolean = false;

        for (let i = 0; i < this._objects.length; i++)
        {
            if (this._objects[i].obj.equals(obj))
            {
                removed = true;
                this._objects.splice(i,1);
                break;
            }
        }

        if (!removed && this._children != null)
        {
            for (let i = 0; i < 8; i++)
            {
                removed = this._children[i].remove(obj);
                if (removed) break;
            }
        }

        if (removed && this._children != null)
        {
            // Check if we should merge nodes now that we've removed an item
            if (this.shouldMerge())
            {
                this.merge();
            }
        }

        return removed;
    }

    /// <summary>
    /// Removes the specified object at the given position. Makes the assumption that the object only exists once in the tree.
    /// </summary>
    /// <param name="obj">Object to remove.</param>
    /// <param name="objPos">Position of the object.</param>
    /// <returns>True if the object was removed successfully.</returns>
    public removePoint(obj:T, objPos:Point):boolean
    {
        if (!OctNode.encapsulates(this._bounds, objPos))
        {
            return false;
        }
        return this.subRemove(obj, objPos);
    }

    /// <summary>
    /// Return objects that are within <paramref name="maxDistance"/> of the specified ray.
    /// </summary>
    /// <param name="ray">The ray.</param>
    /// <param name="maxDistance">Maximum distance from the ray to consider.</param>
    /// <param name="result">List result.</param>
    /// <returns>Objects within range.</returns>
    /*public getNearby(ref Ray ray, float maxDistance, List<T> result)
    {
        // Does the ray hit this node at all?
        // Note: Expanding the bounds is not exactly the same as a real distance check, but it's fast.
        // TODO: Does someone have a fast AND accurate formula to do this check?
        _bounds.Expand(new Point(maxDistance * 2, maxDistance * 2, maxDistance * 2));
        bool intersected = _bounds.IntersectRay(ray);
        _bounds.Size = this._actualBoundsSize;
        if (!intersected)
        {
            return;
        }

        // Check against any objects in this node
        for (int i = 0; i < this._objects.length; i++)
        {
            if (SqrDistanceToRay(ray, this._objects[i].pos) <= (maxDistance * maxDistance))
            {
                result.Add(this._objects[i].obj);
            }
        }

        // Check children
        if (this._children != null)
        {
            for (int i = 0; i < 8; i++)
            {
                this._children[i].GetNearby(ref ray, maxDistance, result);
            }
        }
    }*/

    /// <summary>
    /// Return objects that are within <paramref name="maxDistance"/> of the specified position.
    /// </summary>
    /// <param name="position">The position.</param>
    /// <param name="maxDistance">Maximum distance from the position to consider.</param>
    /// <param name="result">List result.</param>
    /// <returns>Objects within range.</returns>
    public getNearby(position:Point, maxDistance:number, result:any[])
    {
        // Does the node contain this position at all?
        // Note: Expanding the bounds is not exactly the same as a real distance check, but it's fast.
        // TODO: Does someone have a fast AND accurate formula to do this check?
        this._bounds.expandPoint(new Point(maxDistance * 2, maxDistance * 2, maxDistance * 2));
        let contained = this._bounds.contains(position);
        this._bounds.setSize(this._actualBoundsSize);
        if (!contained)
        {
            return;
        }

        // Check against any objects in this node
        for (let i = 0; i < this._objects.length; i++)
        {
            if (Point.distance(position, this._objects[i].pos) <= maxDistance)
            {
                result.push(this._objects[i].obj);
            }
        }

        // Check children
        if (this._children != null)
        {
            for (let i = 0; i < 8; i++)
            {
                this._children[i].getNearby(position, maxDistance, result);
            }
        }
    }

    /// <summary>
    /// Return all objects in the tree.
    /// </summary>
    /// <returns>All objects.</returns>
    public getAll(result:T[])
    {
        // add directly contained objects
        result.push(...this._objects.map(o => o.obj));

        // add children objects
        if (this._children != null)
        {
            for (let i = 0; i < 8; i++)
            {
                this._children[i].getAll(result);
            }
        }
    }

    /// <summary>
    /// Set the 8 children of this octree.
    /// </summary>
    /// <param name="childOctrees">The 8 new child nodes.</param>
    public setChildren(childOctrees:OctNode<T>[])
    {
        if (childOctrees.length != 8)
        {
            console.error("Child octree array must be length 8. Was length: " + childOctrees.length);
            return;
        }

        this._children = childOctrees;
    }

    /// <summary>
    /// We can shrink the octree if:
    /// - This node is >= double minLength in length
    /// - All objects in the root node are within one octant
    /// - This node doesn't have children, or does but 7/8 children are empty
    /// We can also shrink it if there are no objects left at all!
    /// </summary>
    /// <param name="minLength">Minimum dimensions of a node in this octree.</param>
    /// <returns>The new root, or the existing one if we didn't shrink.</returns>
    public shrinkIfPossible(minLength:number):OctNode<T>
    {
        if (this.sideLength < (2 * minLength))
        {
            return this;
        }
        if (this._objects.length == 0 && (this._children == null || this._children.length == 0))
        {
            return this;
        }

        // Check objects in root
        let bestFit = -1;
        for (let i = 0; i < this._objects.length; i++)
        {
            let curObj:OctreeObject<T> = this._objects[i];
            let newBestFit = this.bestFitChild(curObj.pos);
            if (i == 0 || newBestFit == bestFit)
            {
                if (bestFit < 0)
                {
                    bestFit = newBestFit;
                }
            }
            else
            {
                return this; // Can't reduce - objects fit in different octants
            }
        }

        // Check objects in children if there are any
        if (this._children != null)
        {
            let childHadContent = false;
            for (let i = 0; i < this._children.length; i++)
            {
                if (this._children[i].hasAnyObjects())
                {
                    if (childHadContent)
                    {
                        return this; // Can't shrink - another child had content already
                    }
                    if (bestFit >= 0 && bestFit != i)
                    {
                        return this; // Can't reduce - objects in root are in a different octant to objects in child
                    }
                    childHadContent = true;
                    bestFit = i;
                }
            }
        }

        // Can reduce
        if (this._children == null)
        {
            // We don't have any children, so just shrink this node to the new size
            // We already know that everything will still fit in it
            this.setValues(this.sideLength / 2, this._minSize, this._childBounds[bestFit].center);
            return this;
        }

        // We have children. Use the appropriate child as the new root node
        return this._children[bestFit];
    }

    /// <summary>
    /// Find which child node this object would be most likely to fit in.
    /// </summary>
    /// <param name="objPos">The object's position.</param>
    /// <returns>One of the eight child octants.</returns>
    public bestFitChild(objPos:Point):number
    {
        return (objPos.x <= this.center.x ? 0 : 1) + (objPos.y >= this.center.y ? 0 : 4) + (objPos.z <= this.center.z ? 0 : 2);
    }

    /// <summary>
    /// Checks if this node or anything below it has something in it.
    /// </summary>
    /// <returns>True if this node or any of its children, grandchildren etc have something in them</returns>
    public hasAnyObjects():boolean
    {
        if (this._objects.length > 0) return true;

        if (this._children != null)
        {
            for (let i = 0; i < 8; i++)
            {
                if (this._children[i].hasAnyObjects()) return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Returns the squared distance to the given ray from a point.
    /// </summary>
    /// <param name="ray">The ray.</param>
    /// <param name="point">The point to check distance from the ray.</param>
    /// <returns>Squared distance from the point to the closest point of the ray.</returns>
    /*public static sqrDistanceToRay(Ray ray, Point point):number
    {
        return Point.Cross(ray.Direction, point - ray.Origin).SqrMagnitude;
    }*/

    // #### PRIVATE METHODS ####

    /// <summary>
    /// Set values for this node.
    /// </summary>
    /// <param name="baseLengthVal">Length of this node, not taking looseness into account.</param>
    /// <param name="minSizeVal">Minimum size of nodes in this octree.</param>
    /// <param name="centerVal">Centre position of this node.</param>
    private setValues(baseLengthVal:number, minSizeVal:number, centerVal:Point)
    {
        this.sideLength = baseLengthVal;
        this._minSize = minSizeVal;
        this.center = centerVal;

        // Create the bounding box.
        this._actualBoundsSize = new Point(this.sideLength, this.sideLength, this.sideLength);
        this._bounds = new BoundingBox(this.center, this._actualBoundsSize);

        let quarter = this.sideLength / 4;
        let childActualLength = this.sideLength / 2;
        let childActualSize = new Point(childActualLength, childActualLength, childActualLength);
        this._childBounds = new BoundingBox[8];
        this._childBounds[0] = new BoundingBox(Point.operatorPlus(this.center , new Point(-quarter, quarter, -quarter)), childActualSize);
        this._childBounds[1] = new BoundingBox(Point.operatorPlus(this.center , new Point(quarter, quarter, -quarter)), childActualSize);
        this._childBounds[2] = new BoundingBox(Point.operatorPlus(this.center , new Point(-quarter, quarter, quarter)), childActualSize);
        this._childBounds[3] = new BoundingBox(Point.operatorPlus(this.center , new Point(quarter, quarter, quarter)), childActualSize);
        this._childBounds[4] = new BoundingBox(Point.operatorPlus(this.center , new Point(-quarter, -quarter, -quarter)), childActualSize);
        this._childBounds[5] = new BoundingBox(Point.operatorPlus(this.center , new Point(quarter, -quarter, -quarter)), childActualSize);
        this._childBounds[6] = new BoundingBox(Point.operatorPlus(this.center , new Point(-quarter, -quarter, quarter)), childActualSize);
        this._childBounds[7] = new BoundingBox(Point.operatorPlus(this.center , new Point(quarter, -quarter, quarter)), childActualSize);
    }

    /// <summary>
    /// Private counterpart to the public Add method.
    /// </summary>
    /// <param name="obj">Object to add.</param>
    /// <param name="objPos">Position of the object.</param>
    private subAdd(obj:T, objPos:Point)
    {
        // We know it fits at this level if we've got this far

        // We always put things in the deepest possible child
        // So we can skip checks and simply move down if there are children aleady
        if (!this.hasChildren)
        {
            // Just add if few objects are here, or children would be below min size
            if (this._objects.length < this.numObjectsAllowed || (this.sideLength / 2) < this._minSize)
            {
                let newObj:OctreeObject<T> = new OctreeObject(obj, objPos );
                this._objects.push(newObj);
                return; // We're done. No children yet
            }

            // Enough objects in this node already: Create the 8 children
            let bestFitChild;
            if (this._children == null)
            {
                this.split();
                if (this._children == null)
                {
                    console.error("Child creation failed for an unknown reason. Early exit.");
                    return;
                }

                // Now that we have the new children, move this node's existing objects into them
                for (let i = this._objects.length - 1; i >= 0; i--)
                {
                    let existingObj:OctreeObject<T> = this._objects[i];
                    // Find which child the object is closest to based on where the
                    // object's center is located in relation to the octree's center
                    bestFitChild = this.bestFitChild(existingObj.pos);
                    this._children[bestFitChild].subAdd(existingObj.obj, existingObj.pos); // Go a level deeper
                    this._objects.splice(i,1); // remove from here
                }
            }
        }

        // Handle the new object we're adding now
        let bestFit = this.bestFitChild(objPos);
        this._children[bestFit].subAdd(obj, objPos);
    }

    /// <summary>
    /// Private counterpart to the public <see cref="remove(T, Point)"/> method.
    /// </summary>
    /// <param name="obj">Object to remove.</param>
    /// <param name="objPos">Position of the object.</param>
    /// <returns>True if the object was removed successfully.</returns>
    private subRemove(obj:T, objPos:Point):boolean
    {
        let removed = false;

        for (let i = 0; i < this._objects.length; i++)
        {
            if (this._objects[i].obj.equals(obj))
            {
                removed = true;
                this._objects.splice(i,1);
                break;
            }
        }

        if (!removed && this._children != null)
        {
            let bestFitChild = this.bestFitChild(objPos);
            removed = this._children[bestFitChild].subRemove(obj, objPos);
        }

        if (removed && this._children != null)
        {
            // Check if we should merge nodes now that we've removed an item
            if (this.shouldMerge())
            {
                this.merge();
            }
        }

        return removed;
    }

    /// <summary>
    /// Splits the octree into eight children.
    /// </summary>
    private split()
    {
        let quarter = this.sideLength / 4;
        let newLength = this.sideLength / 2;
        this._children = new OctNode[8];
        this._children[0] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center , new Point(-quarter, quarter, -quarter)));
        this._children[1] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center , new Point(quarter, quarter, -quarter)));
        this._children[2] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center,  new Point(-quarter, quarter, quarter)));
        this._children[3] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center , new Point(quarter, quarter, quarter)));
        this._children[4] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center , new Point(-quarter, -quarter, -quarter)));
        this._children[5] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center , new Point(quarter, -quarter, -quarter)));
        this._children[6] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center , new Point(-quarter, -quarter, quarter)));
        this._children[7] = new OctNode(newLength, this._minSize, Point.operatorPlus(this.center , new Point(quarter, -quarter, quarter)));
    }

    /// <summary>
    /// Merge all children into this node - the opposite of this.split.
    /// Note: We only have to check one level down since a merge will never happen if the children already have children,
    /// since THAT won't happen unless there are already too many objects to merge.
    /// </summary>
    private merge()
    {
        // Note: We know children != null or we wouldn't be merging
        for (let i = 0; i < 8; i++)
        {
            let curChild:OctNode<T> = this._children[i];
            let numObjects = curChild._objects.length;
            for (let j = numObjects - 1; j >= 0; j--)
            {
                let curObj:OctreeObject<T> = curChild._objects[j];
                this._objects.push(curObj);
            }
        }
        // remove the child nodes (and the objects in them - they've been added elsewhere now)
        this._children = null;
    }

    /// <summary>
    /// Checks if outerBounds encapsulates the given point.
    /// </summary>
    /// <param name="outerBounds">Outer bounds.</param>
    /// <param name="point">Point.</param>
    /// <returns>True if innerBounds is fully encapsulated by outerBounds.</returns>
    private static encapsulates(outerBounds:BoundingBox, point:Point):boolean
    {
        return outerBounds.contains(point);
    }

    /// <summary>
    /// Checks if there are few enough objects in this node and its children that the children should all be merged into this.
    /// </summary>
    /// <returns>True there are less or the same amount of objects in this and its children than <see cref="this.numObjectsAllowed"/>.</returns>
    private shouldMerge():boolean
    {
        let totalObjects = this._objects.length;
        if (this._children != null)
        {
            this._children.forEach((child:OctNode<T>) => {
                if (child._children != null)
                {
                    // If any of the *children* have children, there are definitely too many to merge,
                    // or the child would have been merged already
                    return false;
                }
                totalObjects += child._objects.length;
            });
        }
        return totalObjects <= this.numObjectsAllowed;
    }
}