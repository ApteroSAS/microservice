import { ExtensionProperty, IProperty,vec2  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface IDR extends IProperty {
    color: string,
    intensity: number,
    castShadow: boolean,
    shadowMapResolution: vec2,
    shadowBias: number,
    shadowRadius: number
}

export class HubsDirectionalLightComponent extends ExtensionProperty<IDR> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "directional-light";

    propertyType = "HubsDirectionalLightComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "directional-light";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsDirectionalLightComponent";
        this.componentName = "directional-light";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
            color: "white",
            intensity: 1.0,
            castShadow: true ,
            shadowMapResolution:[512, 512],
            shadowBias: 0 ,
            shadowRadius: 1 
        });
    }

    read(context, componentDef) {
        if (componentDef.color) this.set("color", componentDef.color);
        if (componentDef.intensity) this.set("intensity", componentDef.intensity);
        if (componentDef.castShadow) this.set("castShadow", componentDef.castShadow);
        if (componentDef.shadowMapResolution) this.set("shadowMapResolution", componentDef.shadowMapResolution);
        if (componentDef.shadowBias) this.set("shadowBias", componentDef.shadowBias);
        if (componentDef.shadowRadius) this.set("shadowRadius", componentDef.shadowRadius);
        return this;
    }

    write(context) {
        return {
            color: this.get("color"),
            intensity: this.get("intensity"),
            castShadow: this.get("castShadow"),
            shadowMapResolution: this.get("shadowMapResolution"),
            shadowBias: this.get("shadowBias"),
            shadowRadius: this.get("shadowRadius"),
        };
    }
}