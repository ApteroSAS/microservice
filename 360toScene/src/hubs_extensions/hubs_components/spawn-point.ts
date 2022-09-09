import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface ISP extends IProperty {
}

export class HubsSpawnPointComponent extends ExtensionProperty<ISP> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "spawn-point";

    propertyType = "HubsSpawnPointComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "spawn-point";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsSpawnPointComponent";
        this.componentName = "spawn-point";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
        });
    }

    read(context, componentDef) {
        return this;
    }

    write(context) {
        return {
        };
    }
}