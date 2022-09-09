import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface INM extends IProperty {
}

export class HubsNavMeshComponent extends ExtensionProperty<INM> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "nav-mesh";

    propertyType = "HubsNavMeshComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "nav-mesh";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsNavMeshComponent";
        this.componentName = "nav-mesh";
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