# bugs
- [ ] controlled objects stick together and don't move after colliding
- [ ] move here cursor doesn't look sharp
- [ ] weird vibrations when moving objects collide
    - collisions should be calculated after updates and collision in between 2 frames should be considered  
- [x] object passes through middle of objects horizontally bigger than self *-sept 28 19:30*
    - solved the bug by lazy fix, now both objects corner points are checked with respect to other

# todo
- [ ] object should move from it's center
- [ ] object collision could be missed between 2 frames, if displacement between frames is greater than object size.
    - this can be solved by calculating potential object collision and calculating line intersection to see if they would collide 
- [ ] speed should be calcuated in px/ms instead of px/frame to make it frame rate independent
- [ ] speed should stop after one collision 
- [ ] use pointInPath() inbuilt function instead of the pointInsideBox() 
- can ctx argumment be removed from createObject etc. functions? a universal draw() could be seperated from these functions? 
    - the createObject()'s object will just return the coords and object-shape?? and then the universalDraw() will draw on canvas
    - this way the functions will also be HTML canvas independent
- [x] instead of getProperties() return properties so that it can be accessed as e.g. obj1.properties.coords
- [x] make a seperate game engine module

# features
- point light source
- keyboard movement
- debugging mode

# notes
**---oct 1---**
collision could get skipped between 2 frames or a gap may show between objects 

**---sept 29---**
calculate speed in px/ms so that it's frame rate independent. 

**---sept 28---**
dumped the idea of rendering only pixels that are changing due to weird bug that contracted edges of rectangles under the cursor area.
setInterval is good idea for slowing down frame rate for debugging.
the idea of using corner vertices to check if ojects are colliding is nice but there's an edge case where a rectangle can pass through the middle of a wider object. the wider object will stop because isCollision() will be true for it since corner of the other object is inside it, but the narrow rectangle will not since no corner is inside it. solved the bug by lazy fix, now both objects corner points are checked with respect to other