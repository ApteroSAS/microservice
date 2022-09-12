import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface IImage extends IProperty {
    src:string;
    controls:boolean;
    alphaMode:string;
    projection:string
}

export class HubsImageComponent extends ExtensionProperty<IImage> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "image";

    propertyType = "HubsImageComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "image";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsImageComponent";
        this.componentName = "image";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
            src: "",
            controls: false,
            alphaMode:'opaque',
            projection:'flat'
        });
    }

    read(context, componentDef) {
        if (componentDef.src) this.set("src", componentDef.src);
        if (componentDef.controls != undefined) this.set("controls", componentDef.controls);
        if (componentDef.alphaMode) this.set("alphaMode", componentDef.alphaMode);
        if (componentDef.projection) this.set("projection", componentDef.projection);
        return this;
    }

    write(context) {
        return {
            src: this.get("src"),
            controls: this.get("controls"),
            alphaMode: this.get("alphaMode"),
            projection: this.get("projection"),
        };
    }
}