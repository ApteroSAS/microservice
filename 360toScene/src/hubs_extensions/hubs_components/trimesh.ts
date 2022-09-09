import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface ITrimesh extends IProperty {
}

export class HubsTrimeshComponent extends ExtensionProperty<ITrimesh> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "trimesh";

    propertyType = "HubsTrimeshComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "trimesh";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsTrimeshComponent";
        this.componentName = "trimesh";
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