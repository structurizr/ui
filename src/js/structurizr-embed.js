var structurizr = structurizr || {
    ui: {}
};

structurizr.ui.Embed = function() {

    var specifiedMaxHeight = undefined;
    var embeds = {};

    this.receiveStructurizrResponsiveEmbedMessage = function(event) {
        if (event === undefined) {
            return;
        }

        if (event.data) {
            if (event.data.iframe) {
                try {
                    var elementId = event.data.iframe;
                    var aspectRatio = event.data.aspectRatio;
                    var addition = event.data.controlsHeight;
                    var type = event.data.type;
                    if (type === undefined) {
                        type = 'diagram';
                    }
                    var scriptingContext = event.data.scriptingContext;

                    var embed = getEmbed(elementId);
                    embed.aspectRatio = aspectRatio;
                    embed.addition = addition;
                    embed.type = type;
                    embed.scriptingContext = scriptingContext;


                    resizeEmbeddedDiagram(elementId);
                } catch (err) {
                    console.log(event);
                    console.log("Ignoring message: " + err);
                }
            }

        }
    };

    this.setMaxHeight = function(maxHeight) {
        specifiedMaxHeight = maxHeight;
    };

    function getEmbed(elementId) {
        var embed = embeds[elementId];

        if (embed === undefined) {
            embed = {
                elementId: elementId,
                aspectRatio: 1,
                addition: 0,
                type: 'diagram',
                scriptingContext: undefined
            };

            embeds[elementId] = embed;
        }

        return embed;
    }

    this.resizeEmbeddedDiagrams = function () {
        Object.keys(embeds).forEach(function(key) {
            resizeEmbeddedDiagram(key);
        });
    };

    function resizeEmbeddedDiagram(elementId) {
        var iframe = document.getElementById(elementId);
        var parentNode = iframe.parentNode;
        if (parentNode) {
            var width = parentNode.offsetWidth;
            var embed = getEmbed(elementId);

            var aspectRatio = embed.aspectRatio;
            var addition = embed.addition;
            var type = embed.type;

            var height = Math.ceil((width / aspectRatio) + addition);
            var maxHeight = specifiedMaxHeight;
            if (maxHeight === undefined) {
                maxHeight = window.innerHeight * 0.85;
            }

            if (type !== 'exploration') {
                if (height > maxHeight) {
                    width = Math.floor((maxHeight - addition) * aspectRatio);
                    height = maxHeight;
                }
            }

            // enforce some minimum dimensions
            width =  Math.max(width, 200);
            height =  Math.max(height, 200);

            iframe.width = width + "px";
            iframe.height = height + "px";
        }
    }

};

structurizr.embed = new structurizr.ui.Embed();
window.addEventListener("message", structurizr.embed.receiveStructurizrResponsiveEmbedMessage, false);
window.addEventListener("resize", structurizr.embed.resizeEmbeddedDiagrams, false);