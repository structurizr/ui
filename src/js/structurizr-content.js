// this code renders the following items in Markdown/AsciiDoc documentation:
// - images that are embedded in the workspace (as base64 data uris)
// - diagrams from the workspace (as iframe embeds)
structurizr.ui.ContentRenderer = function(workspace, host, urlPrefix, urlSuffix, safeMode) {

    const MAX_HEIGHT_PERCENTAGE = 0.8;
    var images = workspace.documentation.images;
    var embedIndex = 0;

    var md = window.markdownit({
        html: !safeMode
    });

    md.renderer.rules.image = function(tokens, idx, options, env, self) {
        var token = tokens[idx];
        var srcIndex = token.attrIndex('src');
        var name = token.attrs[srcIndex][1];
        var alt = token.content;

        if (name.indexOf("embed:") === 0) {
            var diagramIdentifier = name.split(":")[1];
            diagramIdentifier = decodeURIComponent(diagramIdentifier);
            return renderEmbeddedDiagram(diagramIdentifier);
        } else {
            return renderImage(name, alt);
        }
    };

    var default_inline_code_block_renderer = md.renderer.rules.code_inline;
    md.renderer.rules.code_inline = function(tokens, idx, options, env, self) {
        var code = tokens[idx].content;
        if (code.startsWith('$') && code.endsWith('$')) {
            code = code.substr(1, code.length - 2);
            try {
                return katex.renderToString(code)
            } catch (err) {
                return '<code>' + err + '</code>';
            }
        } else {
            return default_inline_code_block_renderer(tokens, idx, options, env, self);
        }
    };

    var default_fenced_code_block_renderer = md.renderer.rules.fence.bind(md.renderer.rules)
    md.renderer.rules.fence = function(tokens, idx, options, env, self) {
        var token = tokens[idx];
        var code = token.content.trim();
        if (token.info === 'katex') {
            var content = '';
            code.split(/(?:\n\s*){2,}/).forEach(function(line) { // consecutive new lines means a new formula
                try {
                    content += katex.renderToString(line.trim(), { displayMode: true })
                } catch (err) {
                        content += '<pre>${err}</pre>';
                }
            });

            return '<div>' + content + '</div>';
        } else {
            return default_fenced_code_block_renderer(tokens, idx, options, env, self)
        }
    };

    function renderEmbeddedDiagram(diagramIdentifier) {
        var type = 'diagram';
        var perspective = '';

        var view = workspace.findViewByKey(diagramIdentifier);
        if (!view) {
            // there was no view with the specified identifier, so check for parameters
            var match = diagramIdentifier.match(/^(.*){(.*)}$/);
            if (match && match[1] && match[2]) {
                var parameters = match[2].split(',');
                parameters.forEach(function(parameter) {
                    if (parameter) {
                        parameter = parameter.trim();
                        var tokens = parameter.split('=');
                        if (tokens.length === 2) {
                            var parameterName = tokens[0].trim().toLowerCase();
                            var parameterValue = tokens[1].trim();

                            if (parameterName === 'type' && parameterValue === 'graph') {
                                type = 'graph';
                            } else if (parameterName === 'type' && parameterValue === 'tree') {
                                type = 'tree';
                            }

                            if (parameterName === 'perspective') {
                                perspective = parameterValue;
                            }
                        }
                    }
                });

                diagramIdentifier = match[1];
                view = workspace.findViewByKey(diagramIdentifier);
            }
        }

        if (view) {
            if (view.type === structurizr.constants.IMAGE_VIEW_TYPE) {
                const content = view.content;
                const title = view.title;
                return '<div style="text-align: center"><img src="' + content + '" alt="' + title + '" class="img-thumbnail" style="max-height: ' + (window.innerHeight * MAX_HEIGHT_PERCENTAGE) + 'px" /><br />' + title + '</div>';
            } else {
                // embed the specified diagram
                var id = 'structurizrEmbed' + (++embedIndex);
                var embedUrl = '/embed' + '?workspace=' + workspace.id + '&view=' + encodeURIComponent(diagramIdentifier) + '&perspective=' + encodeURIComponent(perspective) + '&type=' + type + '&iframe=' + id + '&urlPrefix=' + urlPrefix + '&urlSuffix=' + encodeURIComponent(urlSuffix);

                return '<div style="text-align: center"><iframe id="' + id + '" class="structurizrEmbed thumbnail" src="' + embedUrl + '" width="100%" height="' + (window.innerHeight * MAX_HEIGHT_PERCENTAGE) + 'px" marginwidth="0" marginheight="0" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>' + '</div>';
            }
        } else {
            return '<div class="alert alert-danger" role="alert">Unable to embed view \'' + diagramIdentifier + '\' - there is no view with this key in the workspace.</div>';
        }
    }

    function renderImage(name, alt) {
        // if the image is a workspace diagram PNG, replace it with the embedded version
        var regex = new RegExp(host + '/workspace/' + workspace.id + '/diagrams/(.*?).png');
        var match = regex.exec(name);
        if (match && match[1]) {
            return renderEmbeddedDiagram(match[1]);
        }

        regex = new RegExp(host + '/workspace/' + workspace.id + '/[0-9a-zA-Z-]{36}/diagrams/(.*?).png');
        match = regex.exec(name);
        if (match && match[1]) {
            return renderEmbeddedDiagram(match[1]);
        }

        var image = findImage(name);

        var imageTitle = '';
        if (alt) {
            imageTitle = '<div class="imageTitle">' + alt + '</div>';
        }

        if (image) {
            return '<div style="text-align: center"><img src="data:' + image.type + ';base64,' + image.content + '" alt="' + alt + '" class="img-thumbnail" style="max-height: ' + (window.innerHeight * MAX_HEIGHT_PERCENTAGE) + 'px" />' + imageTitle + '</div>';
        } else {
            return '<div style="text-align: center"><img src="' + name + '" alt="' + alt + '" class="img-thumbnail" style="max-height: ' + (window.innerHeight * MAX_HEIGHT_PERCENTAGE) + 'px" />' + imageTitle + '</div>';
        }
    }

    function findImage(name) {
        var result = undefined;

        name = name.replaceAll('%5C', '/');
        if (name.indexOf("./") === 0) {
            name = name.substr(2);
        }

        images.forEach(function (image) {
            if (image.name === name) {
                result = image;
            }
        });

        return result;
    }

    this.render = function(section) {
        if (section.content === undefined || section.content.trim().length === 0) {
            return "";
        }

        if (section.format && section.format === "AsciiDoc") {

            const inlinePassthroughRegex = /.*pass:.*\[/g;

            var preparsedContent = "";
            var lines = section.content.split('\n');
            for (var i = 0; i < lines.length; i++){
                var line = lines[i];
                if (safeMode && (line.trim() === "[pass]" || line.trim() === "++++")) {
                    // skip passthroughs
                } else if (safeMode && line.match(inlinePassthroughRegex)) {
                    preparsedContent += line.replaceAll(inlinePassthroughRegex, "[");
                } else if (line.startsWith("image::embed:")) {
                    var altTagStartIndex = line.indexOf("[");
                    var diagramIdentifier = line.substring("image::embed:".length, altTagStartIndex);
                    preparsedContent += ("pass:[" + renderEmbeddedDiagram(diagramIdentifier) + "]");
                } else if (line.startsWith("image::")) {
                    var altTagStartIndex = line.indexOf("[");
                    var altTagEndIndex = line.indexOf("]");
                    var name = line.substring("image::".length, altTagStartIndex);
                    var alt = line.substring(altTagStartIndex+1, altTagEndIndex);
                    preparsedContent += ("pass:[" + renderImage(name, alt) + "]");
                } else {
                    preparsedContent += line;
                }

                preparsedContent += "\n";
            }

            return new Asciidoctor().$convert(preparsedContent);
        } else {
            // default to Markdown
            return md.render(section.content);
        }
    };

    this.setScope = function(element) {
        if (element.documentation && element.documentation.images) {
            images = element.documentation.images.concat(images);
        }
    }

};