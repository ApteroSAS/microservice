import { ExtensionProperty, IProperty, vec3} from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface IBC extends IProperty {
    position:vec3;
    rotation:vec3;
    scale:vec3;
}

export class HubsBoxColliderComponent extends ExtensionProperty<IBC> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "box-collider";

    propertyType = "HubsBoxColliderComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "box-collider";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsBoxColliderComponent";
        this.componentName = "box-collider";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
            position: [0,0,0],
            rotation:[0,0,0],
            scale:[1,1,1],
        });
    }

    read(context, componentDef) {
        if (componentDef.position) this.set("position", componentDef.position);
        if (componentDef.rotation) this.set("rotation", componentDef.rotation);
        if (componentDef.scale) this.set("scale", componentDef.scale);
        return this;
    }

    write(context) {
        return {
            position: this.get("position"),
            rotation: this.get("rotation"),
            scale: this.get("scale"),
        };
    }
}