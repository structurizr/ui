structurizr.ui.DEFAULT_FONT_NAME = "Arial";
structurizr.ui.DEFAULT_FONT_URL = undefined;

structurizr.ui.RENDERING_MODE_COOKIE_NAME = 'structurizr.renderingMode';
structurizr.ui.RENDERING_MODE_SYSTEM = '';
structurizr.ui.RENDERING_MODE_LIGHT = 'light';
structurizr.ui.RENDERING_MODE_DARK = 'dark';

structurizr.ui.LIGHT_MODE_DEFAULTS = {
    background: '#ffffff',
    color: '#444444'
};
structurizr.ui.DARK_MODE_DEFAULTS = {
    background: '#111111',
    color: '#cccccc'
};

structurizr.ui.themes = [];
structurizr.ui.ignoredImages = [];

structurizr.ui.getBranding = function() {
    const branding = {};

    structurizr.ui.themes.forEach(function(theme) {
        if (theme.logo !== undefined) {
            branding.logo = theme.logo;
        }

        if (theme.font !== undefined) {
            branding.font = theme.font;
        }
    })

    if (structurizr.workspace.views.configuration.branding.logo !== undefined) {
        branding.logo = structurizr.workspace.views.configuration.branding.logo;
    }

    if (structurizr.workspace.views.configuration.branding.font !== undefined) {
        branding.font = structurizr.workspace.views.configuration.branding.font;
    }

    if (branding.font === undefined) {
        branding.font = {
            name: structurizr.ui.DEFAULT_FONT_NAME,
            url: structurizr.ui.DEFAULT_FONT_URL
        }
    }

    return branding;
}

structurizr.ui.applyBranding = function() {
    var branding = structurizr.ui.getBranding();
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

structurizr.ui.loadThemes = function(localPrebuiltThemesUrl, callback) {
    structurizr.workspace.views.configuration.themes.forEach(function(theme) {
        structurizr.ui.loadTheme(localPrebuiltThemesUrl, theme);
    });

    setTimeout(function() {
        structurizr.ui.waitForThemesToLoad(callback);
    }, 100);
}

structurizr.ui.waitForThemesToLoad = function(callback) {
    if (structurizr.ui.themes.length < structurizr.workspace.views.configuration.themes.length) {
        setTimeout(function() {
            structurizr.ui.waitForThemesToLoad(callback);
        }, 100);
    } else {
        callback();
    }
}

structurizr.ui.loadTheme = function(localPrebuiltThemesUrl, url) {
    // use local versions of the prebuilt themes if configured
    const prebuiltThemesUrl = 'https://static.structurizr.com/themes/';
    if (url.indexOf(prebuiltThemesUrl) === 0) {
        url = localPrebuiltThemesUrl + url.substring(prebuiltThemesUrl.length);
    }

    $.get(url, undefined, function(data) {
        try {
            const theme = JSON.parse(data);
            if (theme !== undefined) {
                const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

                if (theme.elements === undefined) {
                    theme.elements = [];
                }
                if (theme.relationships === undefined) {
                    theme.relationships = [];
                }

                for (var i = 0; i < theme.elements.length; i++) {
                    const style = theme.elements[i];
                    if (style.icon) {
                        if (style.icon.indexOf('http') > -1) {
                            // okay, image served over HTTP
                        } else if (style.icon.indexOf('data:image') > -1) {
                            // also okay, data URI
                        } else {
                            // convert the relative icon filename into a full URL
                            style.icon = baseUrl + style.icon;
                        }
                    }
                }
            }

            structurizr.ui.themes.push(
                {
                    elements: theme.elements.sort(structurizr.util.sortStyles),
                    relationships: theme.relationships.sort(structurizr.util.sortStyles),
                    logo: theme.logo,
                    font: theme.font
                }
            );
        } catch (e) {
            console.log('Could not load theme from ' + url);
            console.log(e);
        }
    }, 'text')
        .fail(function(xhr, textStatus, errorThrown) {
            const errorMessage = 'Could not load theme from ' + url + '; error ' + xhr.status + ' (' + xhr.statusText + ')';
            console.log(errorMessage);
            alert(errorMessage);

            structurizr.ui.themes.push(
                {
                    elements: [],
                    relationships: []
                }
            );
        });
};

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
    this.iconPosition = 'Bottom';
    this.border = border;
    this.opacity = opacity;
    this.metadata = metadata;
    this.description = description;

    this.tag = "Element";

    this.copyStyleAttributeIfSpecified = function(source, name) {
        structurizr.util.copyAttributeIfSpecified(source, this, name);
    };

    this.toString = function() {
        return "".concat(this.tag, ",", this.width, ",", this.height, ",", this.background, ",", this.stroke, ",", this.color, ",", this.fontSize, ",", this.shape, ",", this.icon, ",", this.iconPosition, ",", this.border, ",", this.opacity, ",", this.metadata, ",", this.description);
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
    if (darkMode === undefined) {
        darkMode = false;
    }

    const defaults = darkMode ? structurizr.ui.DARK_MODE_DEFAULTS : structurizr.ui.LIGHT_MODE_DEFAULTS;
    var defaultStyle = new structurizr.ui.ElementStyle(450, 300, undefined, undefined, 24, 'Box', undefined, 'Solid', undefined, 2, 100, true, true);
    var defaultSizeInUse = true;

    var elementStylesMap = {};
    var elementStyles = [];

    // use the styles defined in the theme as a starting point
    structurizr.ui.themes.forEach(function(theme) {
        elementStyles = elementStyles.concat(theme.elements);
    });

    // then the styles defined in the workspace
    elementStyles = elementStyles.concat(structurizr.workspace.views.configuration.styles.elements);

    elementStyles.forEach(function(elementStyleDefinition) {
        const colorScheme = darkMode ? 'Dark' : 'Light';
        if (elementStyleDefinition.colorScheme === undefined || elementStyleDefinition.colorScheme === colorScheme) {
            const tag = elementStyleDefinition.tag;
            const elementStyle = elementStylesMap[tag];

            if (elementStyle === undefined) {
                elementStylesMap[tag] = elementStyleDefinition;
            } else {
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'width');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'height');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'background');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'stroke');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'color');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'fontSize');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'shape');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'icon');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'iconPosition');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'border');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'opacity');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'metadata');
                structurizr.util.copyAttributeIfSpecified(elementStyleDefinition, elementStyle, 'description');
            }
        }
    });

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
    for (var i = 0; i < tags.length; i++) {
        const tag = tags[i].trim();
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
            style.copyStyleAttributeIfSpecified(elementStyle, 'iconPosition');
            style.copyStyleAttributeIfSpecified(elementStyle, 'border');
            style.copyStyleAttributeIfSpecified(elementStyle, 'opacity');
            style.copyStyleAttributeIfSpecified(elementStyle, 'metadata');
            style.copyStyleAttributeIfSpecified(elementStyle, 'description');
            style.tag = tag;

            if (style.tags.indexOf(tag) === -1) {
                style.tags.push(tag);
            }
        }
    }

    if (element.type === 'Boundary') {
        // do nothing
    } else {
        if (style.background !== undefined) {
            // the background has been defined, so default the stroke to a darker version if necessary
            if (style.stroke === undefined) {
                style.stroke = structurizr.util.shadeColor(style.background, -10);
            }
        }

        if (style.background === undefined) {
            style.background = defaults.background;
        }

        if (style.stroke === undefined) {
            style.stroke = defaults.color;
        }

        if (style.color === undefined) {
            style.color = defaults.color;
        }
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

    if (style.icon && structurizr.ui.ignoredImages.indexOf(style.icon) > -1) {
        style.icon = undefined;
    }

    return style;
};

structurizr.ui.findRelationshipStyle = function(relationship, darkMode) {
    if (darkMode === undefined) {
        darkMode = false;
    }

    const defaults = darkMode ? structurizr.ui.DARK_MODE_DEFAULTS : structurizr.ui.LIGHT_MODE_DEFAULTS;
    const defaultRelationshipStyle = new structurizr.ui.RelationshipStyle(2, defaults.color, true, 'Direct', 24, 200, 50, 100);

    var defaultStyle = defaultRelationshipStyle;

    var relationshipStylesMap = {};
    var relationshipStyles = [];

    // use the styles defined in the theme as a starting point
    structurizr.ui.themes.forEach(function(theme) {
        relationshipStyles = relationshipStyles.concat(theme.relationships);
    });

    // then the styles defined in the workspace
    relationshipStyles = relationshipStyles.concat(structurizr.workspace.views.configuration.styles.relationships);

    relationshipStyles.forEach(function(relationshipStyleDefinition) {
        const colorScheme = darkMode ? 'Dark' : 'Light';
        if (relationshipStyleDefinition.colorScheme === undefined || relationshipStyleDefinition.colorScheme === colorScheme) {
            const tag = relationshipStyleDefinition.tag;
            var relationshipStyle = relationshipStylesMap[tag];

            if (relationshipStyle === undefined) {
                relationshipStylesMap[tag] = relationshipStyleDefinition;
            } else {
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'thickness');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'color');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'dashed');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'style');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'routing');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'fontSize');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'width');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'position');
                structurizr.util.copyAttributeIfSpecified(relationshipStyleDefinition, relationshipStyle, 'opacity');
            }
        }
    });

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

    const tags = structurizr.workspace.getAllTagsForRelationship(relationship);
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
        var baseView = structurizr.workspace.findViewByKey(view.baseViewKey);
        return this.getTitleForView(baseView);
    }

    return this.getDefaultViewName(view);
};

structurizr.ui.getDefaultViewName = function(view) {
    if (view.type === structurizr.constants.FILTERED_VIEW_TYPE) {
        view = structurizr.workspace.findViewByKey(view.baseViewKey);
    }

    if (view.type === structurizr.constants.CUSTOM_VIEW_TYPE) {
        return '[Custom] ' + ((view.title && view.title.trim().length > 0) ? view.title : 'Untitled');

    } else if (view.type === structurizr.constants.SYSTEM_LANDSCAPE_VIEW_TYPE) {
        const enterprise = structurizr.workspace.model.enterprise;
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
    } else if (view.type === structurizr.constants.IMAGE_VIEW_TYPE) {
        return '[Image] ' + view.key;
    }

    return '';
}

structurizr.ui.openingMetadataSymbols = {
    SquareBrackets: '[',
    RoundBrackets: '(',
    CurlyBrackets: '{',
    AngleBrackets: '<',
    DoubleAngleBrackets: '<<',
    None: ''
};

structurizr.ui.closingMetadataSymbols = {
    SquareBrackets: ']',
    RoundBrackets: ')',
    CurlyBrackets: '}',
    AngleBrackets: '>',
    DoubleAngleBrackets: '>>',
    None: ''
};

structurizr.ui.getMetadataForElement = function(element, includeTechnology) {
    const openingSymbol = structurizr.ui.openingMetadataSymbols[structurizr.workspace.views.configuration.metadataSymbols];
    const closingSymbol = structurizr.ui.closingMetadataSymbols[structurizr.workspace.views.configuration.metadataSymbols];

    if (element.type === structurizr.constants.CUSTOM_ELEMENT_TYPE) {
        if (element.metadata && element.metadata.length > 0) {
            return openingSymbol + element.metadata + closingSymbol;
        } else {
            return '';
        }
    } else {
        if (includeTechnology === true && element.technology) {
            return openingSymbol + structurizr.workspace.getTerminologyFor(element) + ": " + element.technology + closingSymbol;
        }

        return openingSymbol + structurizr.workspace.getTerminologyFor(element) + closingSymbol;
    }
};

structurizr.ui.getMetadataForRelationship = function(relationship) {
    if (relationship.technology) {
        const openingSymbol = structurizr.ui.openingMetadataSymbols[structurizr.workspace.views.configuration.metadataSymbols];
        const closingSymbol = structurizr.ui.closingMetadataSymbols[structurizr.workspace.views.configuration.metadataSymbols];

        return openingSymbol + relationship.technology + closingSymbol;
    } else {
        return '';
    }
};

structurizr.ui.isFullScreenEnabled = function() {
    return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
};

structurizr.ui.isFullScreen = function() {
    return document.enterFullScreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement;
};

structurizr.ui.enterFullScreen = function(domId) {
    if (domId === undefined) {
        domId = 'content';
    }

    if (this.isFullScreenEnabled()) {
        var content = document.getElementById(domId);
        if (content.requestFullscreen) {
            content.requestFullscreen();
        } else if (content.webkitRequestFullscreen) {
            content.webkitRequestFullscreen();
        } else if (content.mozRequestFullScreen) {
            content.mozRequestFullScreen();
        } else if (content.msRequestFullscreen) {
            content.msRequestFullscreen();
        }
    }
};

structurizr.ui.exitFullScreen = function() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
};

const darkModeStylesheetLink = document.createElement('link');

structurizr.ui.initDarkMode = function(stylesheet) {
    darkModeStylesheetLink.setAttribute('rel', 'stylesheet');
    darkModeStylesheetLink.setAttribute('type', 'text/css');
    darkModeStylesheetLink.setAttribute('href', stylesheet);

    structurizr.ui.changeRenderingMode();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (structurizr.ui.getRenderingMode() === structurizr.ui.RENDERING_MODE_SYSTEM) {
            structurizr.ui.changeRenderingMode();
        }
    });
};

structurizr.ui.changeRenderingMode = function() {
    try {
        if (structurizr.ui.isDarkMode()) {
            document.head.appendChild(darkModeStylesheetLink);
        } else {
            document.head.removeChild(darkModeStylesheetLink);
        }
    } catch (e) {
        // ignore
    }
};

structurizr.ui.setRenderingMode = function(renderingMode) {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    document.cookie = structurizr.ui.RENDERING_MODE_COOKIE_NAME + '=' + renderingMode + '; expires=' + nextYear.toUTCString() + '; path=/';
    structurizr.ui.changeRenderingMode();
};

structurizr.ui.getRenderingMode = function() {
    if (document.cookie.indexOf(structurizr.ui.RENDERING_MODE_COOKIE_NAME + '=' + structurizr.ui.RENDERING_MODE_LIGHT) > -1) {
        return structurizr.ui.RENDERING_MODE_LIGHT;
    } else if (document.cookie.indexOf(structurizr.ui.RENDERING_MODE_COOKIE_NAME + '=' + structurizr.ui.RENDERING_MODE_DARK) > -1) {
        return structurizr.ui.RENDERING_MODE_DARK;
    } else {
        return structurizr.ui.RENDERING_MODE_SYSTEM;
    }
};

structurizr.ui.isDarkMode = function() {
    const renderingMode = structurizr.ui.getRenderingMode();

    if (renderingMode === structurizr.ui.RENDERING_MODE_DARK) {
        // forced dark mode
        return true;
    } else if (renderingMode === structurizr.ui.RENDERING_MODE_LIGHT) {
        // forced light mode
        return false;
    } else {
        // use system rendering mode
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
};