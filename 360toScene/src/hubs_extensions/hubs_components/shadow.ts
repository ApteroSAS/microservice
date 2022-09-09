import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface IShadow extends IProperty {
    cast:boolean;
    receive:boolean;
}

export class HubsShadowComponent extends ExtensionProperty<IShadow> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "shadow";

    propertyType = "HubsShadowComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "shadow";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsShadowComponent";
        this.componentName = "shadow";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
            cast:true,
            receive:true,
        });
    }

    read(context, componentDef) {
        if (componentDef.cast) this.set("cast", componentDef.src);
        if (componentDef.receive) this.set("receive", componentDef.src);
       return this;
    }

    write(context) {
        return {
            cast: this.get("cast"),
            receive: this.get("receive"),
        };
    }
}