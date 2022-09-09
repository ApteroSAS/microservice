import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface Iskybox extends IProperty {
    turbidity:number;
    rayleigh:number;
    luminance:number;
    mieCoefficient:number;
    mieDirectionalG:number;
    inclination:number;
    azimuth:number;
    distance:number;
}

export class HubsSkyboxComponent extends ExtensionProperty<Iskybox> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "skybox";

    propertyType = "HubsSkyboxComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "skybox";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsSkyboxComponent";
        this.componentName = "skybox";
    }

    getDefaults() {
        return Object.assign(super.getDefaults(), {
            turbidity:10,
            rayleigh:2,
            luminance:1,
            mieCoefficient:0.005,
            mieDirectionalG:0.8,
            inclination:0,
            azimuth:0.15,
            distance:8000
        });
    }

    read(context, componentDef) {
        if (componentDef.turbidity) this.set("turbidity", componentDef.turbidity);
        if (componentDef.rayleigh) this.set("rayleigh", componentDef.rayleigh);
        if (componentDef.luminance) this.set("luminance", componentDef.luminance);
        if (componentDef.mieCoefficient) this.set("mieCoefficient", componentDef.mieCoefficient);
        if (componentDef.mieDirectionalG) this.set("mieDirectionalG", componentDef.mieDirectionalG);
        if (componentDef.inclination) this.set("inclination", componentDef.inclination);
        if (componentDef.azimuth) this.set("azimuth", componentDef.azimuth);
        if (componentDef.distance) this.set("distance", componentDef.distance);
        return this;
    }

    write(context) {
        return {
            turbidity: this.get("turbidity"),
            rayleigh: this.get("rayleigh"),
            luminance: this.get("luminance"),
            mieCoefficient: this.get("mieCoefficient"),
            mieDirectionalG: this.get("mieDirectionalG"),
            inclination: this.get("inclination"),
            azimuth: this.get("azimuth"),
            distance: this.get("distance"),
        };
    }
}