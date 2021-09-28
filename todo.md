# bugs
- object passes through middle of objects horizontally bigger than self *-sept 28 19:30*
- move here cursor doesn' look sharp

# features
- point light source
- keyboard movement
- debugging mode

# notes
**---sept 28---**
dumped the idea of rendering only pixels that are changing due to weird bug that contracted edges of rectangles under the cursor area.
setInterval is good idea for slowing down frame rate for debugging.
the idea of using corner vertices to check if ojects are colliding is nice but there's an edge case where a rectangle can pass through the middle of a wider object. the wider object will stop because isCollision() will be true for it since corner of the other object is inside it, but the narrow rectangle will not since no corner is inside it. solved the bug by lazy fix, now both objects corner points are checked with respect to other