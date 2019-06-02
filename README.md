# Visualizer
It is a Molecular visualizer works on browser.  
We should use json format instead of ruffled formats. Do not you think so ?  
You can visualize json atomic file by drag and drop.  
If you use OSX, you can use two finger drag, three finger drag and pan to change your sight.  
You can modify atoms by three finger drag.  
And you can download json file by right click.  

TODO: RとTで並進と回転を切り替えるように変更。
TODO: リファクタリング
TODO: Ctrl+Z

メモ：ために初期位置などでカメラの平行移動が出来ないことe

があるが、これはcenterがカメラよりも後ろにある状態であり、この状態ではplaneとrayが交差しないため動かない。