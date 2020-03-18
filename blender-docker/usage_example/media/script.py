import bpy
from bpy import context

####################
#import object
####################
bpy.ops.import_scene.gltf(filepath='/media/3dfile.glb')


####################
# Select objects that will be rendered
####################
for obj in bpy.context.scene.objects:
    obj.select_set(True)
bpy.ops.view3d.camera_to_view_selected()
        
####################
#render
####################

bpy.context.scene.frame_current = 1
bpy.context.scene.render.filepath = (
                        "/media/"
                        + "thumbnail.png"
                        )
bpy.ops.render.render( #{'dict': "override"},
                      #'INVOKE_DEFAULT',  
                      False,            # undo support
                      animation=False, 
                      write_still=True
                     )