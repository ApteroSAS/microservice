import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface Ivisible extends IProperty {
    visible:boolean;
}

export class HubsVisibleComponent extends ExtensionProperty<Ivisible> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "visible";

    propertyType = "HubsVisibleComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "visible";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsVisibleComponent";
        this.componentName = "visible";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
            visible:true
        });
    }

    read(context, componentDef) {
        if (componentDef.visible != undefined) this.set("visible", componentDef.visible);
       return this;
    }

    write(context) {
        return {
            visible: this.get("visible"),
        };
    }
}