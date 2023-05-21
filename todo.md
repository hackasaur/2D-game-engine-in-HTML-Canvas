# bugs
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
- [x] collision physics
    - [x] speed should stop after one collision 
- [x] import image texture
- [ ] object rotation
- [ ] animations
- [x] changed draw() of createObject to use coords as center and calculate the top-left-coords. also had to do same in areColliding() 
- [x] object should move from it's center
- [ ] instead of moveTo coords, user should have control over object's velocity

## important, not urgent
- [ ] object collision could be missed between 2 frames, if displacement between frames is greater than object size.
- [ ] use quadtree for collision optimization
- [ ] speed should be calcuated in px/ms instead of px/frame to make it frame rate independent
- [x] make a seperate game engine module
- [x] instead of getProperties() return properties so that it can be accessed as e.g. obj1.properties.coords
- [x] point light source for rects using shadowOffset
- [ ] use pointInPath() inbuilt function instead of the pointInsideBox() 
- [x] show object velocity vectors x and y in debugging
- [ ] add collision detection for circle bounding box
    - this can be solved by calculating potential object collision and calculating line intersection to see if they would collide 
- can ctx argument be removed from createObject etc. functions? a universal draw() could be seperated from these functions? 
- the createObject()'s object will just return the coords and object-shape?? and then the universalDraw() will draw on canvas
    - this way the functions will also be HTML canvas independent
- [ ] multiple lightsources. find a better formula for shadow offset 
- [ ] objects should have a property if they are collidable or not

## not important not urgent
- [ ] collision-detection should be an event for which collision-resolution logic can be given 

## not important but urgent


# features
- point light source
- keyboard movement
- debugging mode

# notes
**---2023---**
**---may 21---**


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