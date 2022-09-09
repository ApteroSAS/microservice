import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface IBG extends IProperty {
    color:string;
    transparent:boolean;
}

export class HubsBackgroundComponent extends ExtensionProperty<IBG> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "background";

    propertyType = "HubsBackgroundComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "background";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsBackgroundComponent";
        this.componentName = "background";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
            color: "black",
            transparent: false,
        });
    }

    read(context, componentDef) {
        if (componentDef.color) this.set("color", componentDef.src);
        if (componentDef.transparent) this.set("transparent", componentDef.controls);
       return this;
    }

    write(context) {
        return {
            color: this.get("color"),
            transparent: this.get("transparent"),
        };
    }
}