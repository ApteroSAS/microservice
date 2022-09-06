import express from 'express'
import cors from 'cors'
import { NodeIO,Node,JSONDocument } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { HubsComponentsExtension} from './hubs_extensions/MOZ_hubs_components'

const app = express()
app.use(express.json())
app.use(cors())
app.get('/api/:targetUrl', async (req, res) => {
    const targetUrl:string = req.params.targetUrl;
    const urlRegex:RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    const io:NodeIO = new NodeIO().registerExtensions([...KHRONOS_EXTENSIONS, HubsComponentsExtension]);
    const jsondocument:JSONDocument = await io.readAsJSON('./assets/defaultScene.glb');
    // @ts-ignore
    const finalUrl = (urlRegex.test(targetUrl))? targetUrl : jsondocument.json.nodes[9].extensions.MOZ_hubs_components.image.src;;
    // @ts-ignore
    jsondocument.json.nodes[9].extensions.MOZ_hubs_components.image.srce = finalUrl;
    const glbBuffer = Buffer.from(await io.writeBinary(await io.readJSON(jsondocument)));
    let filename = finalUrl.split('/');
   filename = filename[filename.length-1];
   filename = filename.split('.')[0]
    res.set('Content-Type','model/gltf-binary')
    res.set('Content-Disposition','attachment; filename="'+filename+'.glb"')
    res.send(glbBuffer)
})

app.listen(3000, () => console.log('Silence, ça tourne.'))