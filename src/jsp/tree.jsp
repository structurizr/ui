<%@ include file="/WEB-INF/fragments/workspace/javascript.jspf" %>
<%@ include file="/WEB-INF/fragments/progress-message.jspf" %>

<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/d3-7.8.2.min.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-ui${structurizrConfiguration.versionSuffix}.js"></script>

<%@ include file="/WEB-INF/fragments/tooltip.jspf" %>

<div id="exploreTree" style="margin-left: 100px; margin-right: 100px;">
</div>

<script nonce="${scriptNonce}">
    const horizontalMargin = 100;
    const width = window.innerWidth - horizontalMargin;
    const dx = 100;
    const dy = width / 4;
    var tree, treeLink;

    const sizes = {
        "Model": 24,
        "Person": 18,
        "SoftwareSystem": 18,
        "Container": 14,
        "Component": 10
    };

    function workspaceLoaded() {
        structurizr.ui.loadThemes(function() {
            init();
        });
    }

    function init() {
        tree = d3.tree().nodeSize([dx, dy]);
        treeLink = d3.linkHorizontal().x(d => d.y).y(d => d.x);
        $("#exploreTree").html(graph(d3.hierarchy(getModelAsTreeStructure())));

        progressMessage.hide();
    }

    function graph(root) {
        root = tree(root);

        let x0 = Infinity;
        let x1 = -x0;
        root.each(d => {
            if (d.x > x1) x1 = d.x;
            if (d.x < x0) x0 = d.x;
        });

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, x1 - x0 + dx * 2])
            .style("overflow", "visible");

        const g = svg.append("g")
            .attr("font-size", 14)
            .attr("transform", function() {
                return "translate(" + 0 + "," + (dx - x0) + ")";
            })

        const link = g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", treeLink);

        const node = g.append("g")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", function(d) {
                return 'translate(' + d.y + ',' + d.x +')';
            })
            .on("mouseover", showTooltipForElement)
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

        node.append("circle")
            .attr("fill", function(d) {
                return d.data.style.background;
            })
            .attr("stroke-width", 1)
            .attr("stroke", function(d) {
                return d.data.style.stroke;
            })
            .attr("r", function(d) {
                return sizes[d.data.type];
            });

        node.append("text")
            .attr("fill", '#000000')
            .attr("stroke", "white")
            .attr("paint-order", "stroke")
            .attr("dy", "0.31em")
            .attr("x", function(d) {
                if (d.children) {
                    return -(sizes[d.data.type] * 1.4);
                } else {
                    return (sizes[d.data.type] * 1.4);
                }
            })
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text(function(d) {
                return d.data.name;
            });

        return svg.node();
    }

    function showTooltipForElement(event, d) {
        if (d.data.element) {
            tooltip.showTooltipForElement(d.data.element, d.data.style, event.pageX, event.pageY, '');
        }
    }

    function moveTooltip(event, d) {
        tooltip.reposition(event.pageX, event.pageY);

    }

    function hideTooltip(event, d) {
        tooltip.hide();
    }

    function getModelAsTreeStructure() {
        const model = structurizr.workspace.model;
        const softwareSystems = [];

        model.softwareSystems.forEach(function(softwareSystem) {
            const s = {
                name: softwareSystem.name,
                element: softwareSystem,
                type: structurizr.constants.SOFTWARE_SYSTEM_ELEMENT_TYPE,
                style: structurizr.ui.findElementStyle(softwareSystem),
                children: []
            };
            softwareSystems.push(s);

            if (softwareSystem.containers) {
                softwareSystem.containers.forEach(function (container) {
                    const c = {
                        name: container.name,
                        element: container,
                        type: structurizr.constants.CONTAINER_ELEMENT_TYPE,
                        style: structurizr.ui.findElementStyle(container),
                        children: []
                    };
                    s.children.push(c);

                    if (container.components) {
                        container.components.forEach(function (component) {
                            const cc = {
                                element: component,
                                name: component.name,
                                type: structurizr.constants.COMPONENT_ELEMENT_TYPE,
                                style: structurizr.ui.findElementStyle(component)
                            };
                            c.children.push(cc);
                        });

                        sortArrayByNameAscending(c.children);
                    }
                });

                sortArrayByNameAscending(s.children);
            }
        });

        sortArrayByNameAscending(softwareSystems);

        return {
            name: "Model",
            children: softwareSystems,
            description: "",
            type: "Model",
            style: {
                background: '#777777',
                stroke: '#000000'
            }
        };
    }

    function sortArrayByNameAscending(array) {
        array.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        })
    }
</script>

<c:choose>
    <c:when test="${not empty workspaceAsJson}">
<%@ include file="/WEB-INF/fragments/workspace/load-via-inline.jspf" %>
    </c:when>
    <c:otherwise>
<%@ include file="/WEB-INF/fragments/workspace/load-via-api.jspf" %>
    </c:otherwise>
</c:choose>