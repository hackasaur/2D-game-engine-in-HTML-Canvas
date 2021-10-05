# bugs
- [x] object passes through middle of objects horizontally bigger than self *-sept 28 19:30*
    - solved the bug by lazy fix, now both objects corner points are checked with respect to other
- [ ] move here cursor doesn't look sharp
- [ ] weird vibrations when moving objects collide
    - collisions should be calculated after updates and collision in between 2 frames should be considered  

# todo
- [ ] speed should be calcuated in px/ms instead of px/frame to make it frame rate independent
- [ ] speed should stop after one collision 
- [ ] use pointInPath() inbuilt function instead of the pointInsideBox() 
- [ ] make a seperate game engine module

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