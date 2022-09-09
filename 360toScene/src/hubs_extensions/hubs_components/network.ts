import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface INetwork extends IProperty {
    id:string;
}

export class HubsNetworkComponent extends ExtensionProperty<INetwork> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "networked";

    propertyType = "HubsNetworkComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "networked";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsNetworkComponent";
        this.componentName = "networked";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
        });
    }

    read(context, componentDef) {
        if (componentDef.id) this.set("id", componentDef.id);
        return this;
    }

    write(context) {
        return {
            id: this.get("id")
        };
    }
}