import express from 'express'
import cors from 'cors'
import { NodeIO,Node,JSONDocument } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { HubsComponentsExtension} from './hubs_extensions/MOZ_hubs_components'
import fs from 'fs';

const app = express()
app.use(express.json())
app.use(cors())
app.get('/api/:targetUrl', async (req, res) => {
    fs.readFile("./assets/defaultScene.glb","utf-8",function (err, contents) {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: 'Failed reading default file.'
            })
        }
        const replaced = contents.replace(/to be replaced/g, 'replacement string');
        let filename:string = req.params.targetUrl.split('/').pop() as string;
        filename = filename.split('.')[0]
        res.set('Content-Type','model/gltf-binary')
        res.set('Content-Disposition','attachment; filename="'+filename+'.glb"')
        res.send(replaced)
    })
    /*
    const targetUrl:string = req.params.targetUrl;
    const urlRegex:RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    const io:NodeIO = new NodeIO().registerExtensions([...KHRONOS_EXTENSIONS, HubsComponentsExtension]);
    const jsondocument:JSONDocument = await io.readAsJSON('./assets/defaultScene.glb');
    // @ts-ignore
    console.log(jsondocument.json.nodes[9].extensions.MOZ_hubs_components.image)
    // @ts-ignore
    const finalUrl = (urlRegex.test(targetUrl))? targetUrl : jsondocument.json.nodes[9].extensions.MOZ_hubs_components.image.src;
    // @ts-ignore
    jsondocument.json.nodes[9].extensions.MOZ_hubs_components.image.src = finalUrl;
    const glbBuffer = Buffer.from(await io.writeBinary(await io.readJSON(jsondocument)));

     */


})

app.listen(3000, () => console.log('Silence, ça tourne.'))