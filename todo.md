# bugs
- [x] hero or all objects disappear when the moveTo coords are close to the current coords
    - division by zero in moveTo logic : deltaY/deltaX. -> handled the case whenn deltaX is 0
    - in Collision logic if velocity is 0,0 for both the objects, the collision time is indeterminable, so for now fixed it by keeping the same coords in this case so that coords don't become undefined (might have to comeback to this)
- [ ] shodow of theHero object does not shift once object reaches the final coords
- [x] hard to reproduce but object jumps to some other spot after stopping sometimes and speed increases too. 
    - typo wrote coords[0] instead of coords[1] in object update. and coordsToReach reference was used instead of value
- [ ] controlled objects stick together and don't move after colliding
- [ ] move here cursor doesn't look sharp
- [x] weird vibrations when moving objects collide
    - collisions should be calculated after updates and collision in between 2 frames should be considered 
    - coordinates at collision is calculated using a formula
- [x] object passes through middle of objects horizontally bigger than self *-sept 28 19:30*
    - solved the bug by lazy fix, now both objects corner points are checked with respect to other

# todo
## important and urgent
- [ ] gravity
- [ ] instead of moveTo coords, user should have control over object's velocity
- [ ] object rotation
- [ ] animations
- [x] collision event should be emitted. is object touching ground or not, should be knowable
- [x] collision physics
    - [x] speed should stop after one collision 
- [x] import image texture
- [x] changed draw() of createObject to use coords as center and calculate the top-left-coords. also had to do same in areColliding() 
- [x] object should move from it's center

## important, not urgent
- [ ] object collision could be missed between 2 frames, if displacement between frames is greater than object size.
- [ ] use quadtree for collision optimization
- [ ] speed should be calcuated in px/ms instead of px/frame to make it frame rate independent
- [ ] use pointInPath() inbuilt function instead of the pointInsideBox() 
- [ ] look into SAT theorem etc. for better collision logic https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
- [ ] add collision detection for circle bounding box
    - this can be solved by calculating potential object collision and calculating line intersection to see if they would collide 
- [ ] multiple lightsources. find a better formula for shadow offset 
- [ ] objects should have a property if they are collidable or not
- [ ] seperate collision module
- [ ] buffer for key presses
- [x] instead of getProperties() return properties so that it can be accessed as e.g. obj1.properties.coords
- [x] point light source for rects using shadowOffset
- [x] show object velocity vectors x and y in debugging
- [x] make a seperate game engine module

## not important not urgent
- [ ] collision-detection should be an event for which collision-resolution logic can be given 
- can ctx argument be removed from createObject etc. functions? a universal draw() could be seperated from these functions? 
- the createObject()'s object will just return the coords and object-shape?? and then the universalDraw() will draw on canvas
    - this way the functions will also be HTML canvas independent

## not important but urgent


# features
- point light source
- keyboard movement
- debugging mode

# notes
**---2023---**
**---june---**
wrote some janky code to detect which side of object is colliding. it checks which vertice of the hitbox is overlapping and if the collision vertical/horizontal then if the points are on the right/left/bottom/top side and so the other object would be colliding on the opposite side

**---may---**
added playAnimation() and stopAnimation(). added a buffer for key presses
changed collision resolution logic. now only the coords normal to the collision surface are changed so that the object can slide on the surface. removed undoUpdate() added coordsBeforeUpdate() instead

fixed division by zero issue which was vanishing the hero or other objects. handled the deltaY/deltaX logic in moveTo

seperated the collision functions and createPoint into a physics module
added functionality to set velocity of an object

**--2021--**
**---nov---**
implemented shadow for a a light source for rectangles looks pretty cool!

should everything be a rectangle...shouldn't this also work for any n-sided polygon?

i'm going to implement a 'moved-area' logic where the objects that

**---oct 1---**
collision could get skipped between 2 frames or a gap may show between objects 

**---sept 29---**
calculate speed in px/ms so that it's frame rate independent. 

**---sept 28---**
dumped the idea of rendering only pixels that are changing due to weird bug that contracted edges of rectangles under the cursor area.
setInterval is good idea for slowing down frame rate for debugging.
the idea of using corner vertices to check if ojects are colliding is nice but there's an edge case where a rectangle can pass through the middle of a wider object. the wider object will stop because isCollision() will be true for it, since corner of the other object is inside it, but the narrow rectangle will not since no corner is inside it. solved the bug by lazy fix, now both objects corner points are checked with respect to other