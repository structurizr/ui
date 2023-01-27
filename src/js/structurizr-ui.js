structurizr.ui.applyBranding = function(branding) {
    if (branding.font.url) {
        const head = document.head;
        const link = document.createElement('link');

        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = branding.font.url;

        head.appendChild(link);
    }

    var fontNames = '';
    branding.font.name.split(',').forEach(function(fontName) {
        fontNames += '"' + structurizr.util.escapeHtml(fontName.trim()) + '", ';
    });

    const brandingStyles = $('#brandingStyles');
    brandingStyles.append('#documentationPanel { font-family: ' + fontNames.substr(0, fontNames.length-2) + ' }');

    if (branding.logo) {
        const brandingLogo = $('.brandingLogo');
        brandingLogo.attr('src', branding.logo);
        brandingLogo.removeClass('hidden');
    }
}

structurizr.ui.themes = [];

structurizr.ui.ElementStyle = function(width, height, background, color, fontSize, shape, icon, border, stroke, strokeWidth, opacity, metadata, description) {
    this.width = width;
    this.height = height;
    this.background = background;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.color = color;
    this.fontSize = fontSize;
    this.shape = shape;
    this.icon = icon;
    this.border = border;
    this.opacity = opacity;
    this.metadata = metadata;
    this.description = description;

    this.tag = "Element";

    this.copyStyleAttributeIfSpecified = function(source, name) {
        structurizr.util.copyAttributeIfSpecified(source, this, name);
    };

    this.toString = function() {
        return "".concat(this.tag, ",", this.width, ",", this.height, ",", this.background, ",", this.stroke, ",", this.color, ",", this.fontSize, ",", this.shape, ",", this.icon, ",", this.border, ",", this.opacity, ",", this.metadata, ",", this.description);
    };

};

structurizr.ui.RelationshipStyle = function(thickness, color, dashed, routing, fontSize, width, position, opacity) {
    this.thickness = thickness;
    this.color = color;
    this.dashed = dashed;
    this.routing = routing;
    this.fontSize = fontSize;
    this.width = width;
    this.position = position;
    this.opacity = opacity;

    this.tag = "Relationship";

    this.copyStyleAttributeIfSpecified =  function(source, name) {
        structurizr.util.copyAttributeIfSpecified(source, this, name);
    };

    this.toString = function() {
        return "".concat(this.tag, ",", this.thickness, ",", this.color, ",", this.dashed, ",", this.routing, ",", this.fontSize, ",", this.width, ",", this.position, ",", this.opacity)
    };

};

structurizr.ui.findElementStyle = function(element, darkMode) {
    const defaultElementStyle = new structurizr.ui.ElementStyle(450, 300, '#dddddd', '#000000', 24, 'Box', undefined, 'Solid', undefined, 2, 100, true, true);
    const defaultElementStyleForDeploymentNode = new structurizr.ui.ElementStyle(450, 300, '#ffffff', '#000000', 24, 'Box', undefined, 'Solid', '#888888', 1, 100, true, true);
    const defaultBoundaryStyle = new structurizr.ui.ElementStyle(undefined, undefined, undefined, undefined, 24, undefined, undefined, undefined, undefined, 1, undefined, true, true);

    var defaultStyle;
    var defaultSizeInUse = true;

    if (darkMode === undefined) {
        darkMode = false;
    }

    if (element.type === structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE) {
        defaultStyle = defaultElementStyleForDeploymentNode;

        if (darkMode === true) {
            defaultStyle.color = '#ffffff';
        } else {
            defaultStyle.color = '#000000';
        }
    } else if (element.type === 'Boundary') {
        defaultStyle = defaultBoundaryStyle;
    } else {
        defaultStyle = defaultElementStyle;
    }

    var elementStylesMap = {};

    if (structurizr.ui.themes.length > 0) {
        // use the styles defined in the theme as a starting point
        structurizr.ui.themes.forEach(function(theme) {
            theme.elements.forEach(function(elementStyle) {
                elementStylesMap[elementStyle.tag] = elementStyle;
            });
        })

        // (1) add workspace styles that are not defined in the theme
        // (2) override the styles defined in the theme where necessary
        structurizr.workspace.getViews().configuration.styles.elements.forEach(function(elementStyleFromWorkspace) {
            const tag = elementStyleFromWorkspace.tag;
            var elementStyle = elementStylesMap[tag];

            if (elementStyle === undefined) {
                // the workspace has an element style defined for a tag that isn't in the theme, so add it
                elementStylesMap[tag] = elementStyleFromWorkspace;
            } else {
                // both the theme and workspace have an element style defined for a tag, so override the attributes
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'width');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'height');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'background');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'stroke');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'color');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'fontSize');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'shape');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'icon');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'border');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'opacity');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'metadata');
                structurizr.util.copyAttributeIfSpecified(elementStyleFromWorkspace, elementStyle, 'description');
            }
        });
    } else {
        structurizr.workspace.getViews().configuration.styles.elements.forEach(function(elementStyleFromWorkspace) {
            const tag = elementStyleFromWorkspace.tag;
            elementStylesMap[tag] = elementStyleFromWorkspace;
        });
    }

    var style = new structurizr.ui.ElementStyle(
        defaultStyle.width,
        defaultStyle.height,
        defaultStyle.background,
        defaultStyle.color,
        defaultStyle.fontSize,
        defaultStyle.shape,
        defaultStyle.icon,
        defaultStyle.border,
        defaultStyle.stroke,
        defaultStyle.strokeWidth,
        defaultStyle.opacity,
        defaultStyle.metadata,
        defaultStyle.description);

    style.tags = ['Element'];

    const tags = structurizr.workspace.getAllTagsForElement(element);
    var tagsAsArray = tags.split(",");
    for (var i = 0; i < tagsAsArray.length; i++) {
        const tag = tagsAsArray[i].trim();
        var elementStyle = elementStylesMap[tag];
        if (elementStyle) {
            if (elementStyle.width !== undefined || elementStyle.height !== undefined) {
                defaultSizeInUse = false;
            }
            style.copyStyleAttributeIfSpecified(elementStyle, 'width');
            style.copyStyleAttributeIfSpecified(elementStyle, 'height');
            style.copyStyleAttributeIfSpecified(elementStyle, 'background');
            style.copyStyleAttributeIfSpecified(elementStyle, 'stroke');
            style.copyStyleAttributeIfSpecified(elementStyle, 'strokeWidth');
            style.copyStyleAttributeIfSpecified(elementStyle, 'color');
            style.copyStyleAttributeIfSpecified(elementStyle, 'fontSize');
            style.copyStyleAttributeIfSpecified(elementStyle, 'shape');
            style.copyStyleAttributeIfSpecified(elementStyle, 'icon');
            style.copyStyleAttributeIfSpecified(elementStyle, 'border');
            style.copyStyleAttributeIfSpecified(elementStyle, 'opacity');
            style.copyStyleAttributeIfSpecified(elementStyle, 'metadata');
            style.copyStyleAttributeIfSpecified(elementStyle, 'description');
            style.tag = tagsAsArray[i].trim();

            if (style.tags.indexOf(tagsAsArray[i].trim()) === -1) {
                style.tags.push(tagsAsArray[i].trim());
            }
        }
    }

    if (style.stroke === undefined && style.background) {
        style.stroke = structurizr.util.shadeColor(style.background, -10);
    }

    if (style.strokeWidth !== undefined) {
        if (style.strokeWidth < 1) {
            style.strokeWidth = 1;
        } else if (style.strokeWidth > 10) {
            style.strokeWidth = 10;
        }
    }

    if (style.shape === 'MobileDevicePortrait') {
        if (style.height < style.width) {
            var width = style.width;
            var height = style.height;
            style.width = height;
            style.height = width;
        }
    }

    if (style.shape === 'MobileDeviceLandscape') {
        if (style.height > style.width) {
            var width = style.width;
            var height = style.height;
            style.width = height;
            style.height = width;
        }
    }

    if (defaultSizeInUse === true && (style.shape === 'Person' || style.shape === 'Robot')) {
        style.width = 400;
        style.height = 400;
    }

    return style;
};

structurizr.ui.findRelationshipStyle = function(relationship, darkMode) {
    const defaultRelationshipStyle = new structurizr.ui.RelationshipStyle(2, '#707070', true, 'Direct', 24, 200, 50, 100);

    if (darkMode === undefined) {
        darkMode = false;
    }

    var defaultStyle = defaultRelationshipStyle;

    if (darkMode === true) {
        defaultStyle.color = '#aaaaaa';
    } else {
        defaultStyle.color = '#707070';
    }

    var relationshipStylesMap = {};

    if (structurizr.ui.themes.length > 0) {
        // use the styles defined in the theme as a starting point
        structurizr.ui.themes.forEach(function(theme) {
            theme.relationships.forEach(function(relationshipStyle) {
                relationshipStylesMap[relationshipStyle.tag] = relationshipStyle;
            });
        })

        // (1) add workspace styles that are not defined in the theme
        // (2) override the styles defined in the theme where necessary
        structurizr.workspace.getViews().configuration.styles.relationships.forEach(function(relationshipStyleFromWorkspace) {
            const tag = relationshipStyleFromWorkspace.tag;
            var relationshipStyle = relationshipStylesMap[tag];

            if (relationshipStylesMap === undefined) {
                // the workspace has a relationship style defined for a tag that isn't in the theme, so add it
                relationshipStylesMap[tag] = relationshipStyleFromWorkspace;
            } else {
                // both the theme and workspace have an element style defined for a tag, so override the attributes
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'thickness');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'color');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'dashed');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'style');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'routing');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'fontSize');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'width');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'position');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleFromWorkspace, relationshipStyle, 'opacity');
            }
        });
    } else {
        structurizr.workspace.getViews().configuration.styles.relationships.forEach(function(relationshipStyleFromWorkspace) {
            const tag = relationshipStyleFromWorkspace.tag;
            relationshipStylesMap[tag] = relationshipStyleFromWorkspace;
        });
    }

    var style = new structurizr.ui.RelationshipStyle(
        defaultStyle.thickness,
        defaultStyle.color,
        defaultStyle.dashed,
        defaultStyle.routing,
        defaultStyle.fontSize,
        defaultStyle.width,
        defaultStyle.position,
        defaultStyle.opacity);
    style.tags = [ "Relationship" ];

    var definedTags = structurizr.workspace.getAllTagsForRelationship(relationship);
    if (definedTags) {
        var tags = definedTags.split(",");
        for (var i = 0; i < tags.length; i++) {
            var relationshipStyle = relationshipStylesMap[tags[i].trim()];
            if (relationshipStyle) {
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'thickness');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'color');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'dashed');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'style');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'routing');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'fontSize');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'width');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'position');
                style.copyStyleAttributeIfSpecified(relationshipStyle, 'opacity');
                style.tag = tags[i].trim();

                if (style.tags.indexOf(tags[i].trim()) === -1) {
                    style.tags.push(tags[i].trim());
                }
            }
        }
    }

    if (style.style === undefined) {
        if (style.dashed === false) {
            style.style = 'Solid'
        } else {
            style.style = 'Dashed';
        }
    }

    return style;
};

structurizr.ui.getTitleForView = function(view) {
    // if a title has been provided, use that
    if (view && view.title && view.title.trim().length > 0) {
        return view.title;
    }

    if (view.type === structurizr.constants.FILTERED_VIEW_TYPE) {
        var baseView = structurizr.workspace.getViewByKey(view.baseViewKey);
        return this.getTitleForView(baseView);
    }

    return this.getViewName(view);
};

structurizr.ui.getViewName = function(view) {
    if (view.type === structurizr.constants.FILTERED_VIEW_TYPE) {
        view = structurizr.workspace.findViewByKey(view.baseViewKey);
    }

    if (view.type === structurizr.constants.CUSTOM_VIEW_TYPE) {
        return '[Custom] ' + ((view.title && view.title.trim().length > 0) ? view.title : 'Untitled');

    } else if (view.type === structurizr.constants.SYSTEM_LANDSCAPE_VIEW_TYPE) {
        const enterprise = structurizr.workspace.getModel().enterprise;
        return '[System Landscape]' + (enterprise ? ' ' + enterprise.name : '');

    } else if (view.type === structurizr.constants.SYSTEM_CONTEXT_VIEW_TYPE) {
        const softwareSystem = structurizr.workspace.findElementById(view.softwareSystemId);
        return '[System Context] ' + softwareSystem.name;

    } else if (view.type === structurizr.constants.CONTAINER_VIEW_TYPE) {
        const softwareSystem = structurizr.workspace.findElementById(view.softwareSystemId);
        return '[Container] ' + softwareSystem.name;

    } else if (view.type === structurizr.constants.COMPONENT_VIEW_TYPE) {
        const container = structurizr.workspace.findElementById(view.containerId);
        const softwareSystem = structurizr.workspace.findElementById(container.parentId);
        return '[Component] ' + softwareSystem.name + ' - ' + container.name;

    } else if (view.type === structurizr.constants.DYNAMIC_VIEW_TYPE) {
        var element = structurizr.workspace.findElementById(view.elementId);
        if (!element) {
            element = structurizr.workspace.findElementById(view.softwareSystemId);
        }
        if (element) {
            if (element.type === structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE) {
                return '[Dynamic] ' + element.name;
            } else if (element.type === structurizr.constants.CONTAINER_ELEMENT_TYPE) {
                const softwareSystem = structurizr.workspace.findElementById(element.parentId);
                return '[Dynamic] ' + softwareSystem.name + ' - ' + element.name;
            }
        } else {
            return '[Dynamic]';
        }

    } else if (view.type === structurizr.constants.DEPLOYMENT_VIEW_TYPE) {
        if (view.softwareSystemId) {
            const softwareSystem = structurizr.workspace.findElementById(view.softwareSystemId);
            return '[Deployment] ' + softwareSystem.name + ' - ' + view.environment;
        } else {
            return '[Deployment] ' + view.environment;
        }
    }

    return '';
}

