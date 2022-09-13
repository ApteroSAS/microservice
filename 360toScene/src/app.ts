import express from 'express'
import cors from 'cors'
import { NodeIO,Node,JSONDocument } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { HubsComponentsExtension} from './hubs_extensions/MOZ_hubs_components'
import {
    HubsAudioComponent, HubsBackgroundComponent,
    HubsVisibleComponent, HubsShadowComponent,
    HubsSpawnPointComponent, HubsTrimeshComponent,
    HubsNavMeshComponent, HubsBoxColliderComponent,
    HubsSkyboxComponent, HubsDirectionalLightComponent,
    HubsImageComponent,HubsNetworkComponent,
    HubsScenePreviewCameraComponent
} from './hubs_extensions/hubs_components/index'
const app = express()
app.use(express.json())
app.use(cors())
app.get('/api/:targetUrl', async (req, res) => {
    const targetUrl:string = req.params.targetUrl;
    console.log("ping for " + targetUrl)
    const urlRegex:RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    const io:NodeIO = await new NodeIO().registerExtensions([...KHRONOS_EXTENSIONS, HubsComponentsExtension])
        .registerDependencies({
            "hubs-components": [
                HubsAudioComponent,
                HubsBackgroundComponent,
                HubsVisibleComponent,
                HubsShadowComponent,
                HubsSpawnPointComponent,
                HubsTrimeshComponent,
                HubsNavMeshComponent,
                HubsBoxColliderComponent,
                HubsSkyboxComponent,
                HubsDirectionalLightComponent,
                HubsImageComponent,
                HubsNetworkComponent,
                HubsScenePreviewCameraComponent
            ]
        });
    const jsondocument:JSONDocument = await io.readAsJSON('./assets/defaultScene2.glb');
    // @ts-ignore
    const finalUrl = (urlRegex.test(targetUrl))? targetUrl : jsondocument.json.nodes[9].extensions.MOZ_hubs_components.image.src;
    // @ts-ignore
    jsondocument.json.nodes[9].extensions.MOZ_hubs_components.image.src = finalUrl;
    const glbBuffer = Buffer.from(await io.writeBinary(await io.readJSON(jsondocument)));
    let filename = finalUrl.split('/');
    filename = filename[filename.length-1];
    filename = filename.split('.')[0]
    res.set('Content-Type','model/gltf-binary')
    res.set('Content-Disposition','attachment; filename="'+filename+'.glb"')
    res.send(glbBuffer)
})


module.exports = app;