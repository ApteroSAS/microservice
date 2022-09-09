import { ExtensionProperty, IProperty  } from "@gltf-transform/core";
import { MOZ_HUBS_COMPONENTS } from "../MOZ_hubs_components";

interface ISPC extends IProperty {
}

export class HubsScenePreviewCameraComponent extends ExtensionProperty<ISPC> {
    parentTypes: string[];
    static EXTENSION_NAME = MOZ_HUBS_COMPONENTS;
    static componentName = "scene-preview-camera";

    propertyType = "HubsScenePreviewCameraComponent";
    extensionName = MOZ_HUBS_COMPONENTS;
    componentName = "scene-preview-camera";

    init() {
        this.extensionName = MOZ_HUBS_COMPONENTS;
        this.propertyType = "HubsScenePreviewCameraComponent";
        this.componentName = "scene-preview-camera";
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