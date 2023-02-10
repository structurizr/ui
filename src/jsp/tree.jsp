<%@ include file="/WEB-INF/fragments/workspace/javascript.jspf" %>
<%@ include file="/WEB-INF/fragments/progress-message.jspf" %>

<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/d3-7.8.2.min.js"></script>
<script type="text/javascript" src="${structurizrConfiguration.cdnUrl}/js/structurizr-ui${structurizrConfiguration.versionSuffix}.js"></script>

<%@ include file="/WEB-INF/fragments/tooltip.jspf" %>

<div id="graphs" style="margin: 10px 50px 10px 50px; padding: 20px">

    <div class="centered form-inline">
        <select id="graphSelector" class="hidden form-control" onchange="showSelectedGraph()"></select>
    </div>

</div>

<script nonce="${scriptNonce}">
    const sizes = {
        "Model": 20,
        "Person": 18,
        "SoftwareSystem": 18,
        "SoftwareSystemInstance": 18,
        "Container": 14,
        "ContainerInstance": 14,
        "Component": 10,
        "DeploymentEnvironment": 20,
        "DeploymentNode": 18,
        "InfrastructureNode": 14
    };

    function workspaceLoaded() {
        structurizr.ui.loadThemes(function() {
            init();
        });
    }

    function init() {
        const viewKey = '${view}';
        var view;

        if (viewKey.length > 0) {
            view = structurizr.workspace.findViewByKey(viewKey);
        }

        if (view !== undefined && view.type === structurizr.constants.DEPLOYMENT_VIEW_TYPE) {
            const deploymentEnvironment = view.environment;
            graph(
                'deploymentView',
                'Deployment: ' + deploymentEnvironment,
                d3.hierarchy(getDeploymentEnvironmentAsTreeStructure(deploymentEnvironment, view))
            );
            $('#deploymentView').removeClass('hidden');
        } else {
            graph(
                'staticStructure',
                'Static structure',
                d3.hierarchy(getStaticStructureAsTreeStructure())
            );

            const deploymentEnvironments = [];
            structurizr.workspace.model.deploymentNodes.forEach(function (deploymentNode) {
                if (deploymentEnvironments.indexOf(deploymentNode.environment) === -1) {
                    deploymentEnvironments.push(deploymentNode.environment);
                }
            });
            deploymentEnvironments.sort();

            var counter = 1;
            deploymentEnvironments.forEach(function (deploymentEnvironment) {
                graph(
                    'deploymentEnvironment' + counter++,
                    'Deployment: ' + deploymentEnvironment,
                    d3.hierarchy(getDeploymentEnvironmentAsTreeStructure(deploymentEnvironment))
                );
            });

            $('#graphSelector').removeClass('hidden');
            $('#staticStructure').removeClass('hidden');
        }

        progressMessage.hide();
    }

    function graph(domId, label, root) {
        const horizontalMargin = 50;
        const width = window.innerWidth - horizontalMargin;
        const dx = 100;
        const dy = width / 5;
        const tree = d3.tree().nodeSize([dx, dy]);
        const treeLink = d3.linkHorizontal().x(d => d.y).y(d => d.x);
        const marginLeft = 100;

        root = tree(root);

        let minX = Infinity;
        let maxX = -Infinity;
        root.each(d => {
            minX = Math.min(d.x, minX);
            maxX = Math.max(d.x, maxX);
        });

        const height = maxX - minX + dx * 2;

        const svg = d3.create("svg")
            .attr("width", (width+dy) + "px")
            .attr("height", height + "px")
            .style("overflow", "visible");

        const g = svg.append("g")
            .attr("font-size", 12)
            .attr("transform", function() {
                return "translate(" + marginLeft + "," + (dx - minX) + ")";
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

        node.filter(function(d) {
            return d.data.type === structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE || d.data.type === structurizr.constants.INFRASTRUCTURE_NODE_ELEMENT_TYPE;
        }).append("rect")
            .attr("fill", function(d) {
                return d.data.style.background;
            })
            .attr("stroke-width", 1)
            .attr("stroke", function(d) {
                return d.data.style.stroke;
            })
            .attr("width", function(d) {
                return sizes[d.data.type] * 2;
            })
            .attr("height", function(d) {
                return sizes[d.data.type] * 2;
            })
            .attr("x", function(d){  return -(sizes[d.data.type]);})
            .attr("y", function(d){  return -(sizes[d.data.type]);})
            .attr("rx", "3")
            .attr("ry", "3");

        node.filter(function(d) {
            return d.data.type !== structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE && d.data.type !== structurizr.constants.INFRASTRUCTURE_NODE_ELEMENT_TYPE;
        }).append("circle")
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

        node.filter(function(d) {
            return d.data.style.icon !== undefined;
        }).append("image")
            .attr("width", function(d) {
                return sizes[d.data.type];
            })
            .attr("height", function(d) {
                return sizes[d.data.type];
            })
            .attr("x", function(d) {
                return -(sizes[d.data.type]/2);
            })
            .attr("y", function(d) {
                return -(sizes[d.data.type]/2);
            })
            .attr("href", function(d) {
                return d.data.style.icon;
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

        const html = svg.node();

        $('#graphs').append('<div id="'+ domId + '" class="graph hidden" style="overflow-x: scroll"><div width="' + width + '"></div></div>');
        $('#' + domId + ' div').html(svg.node());

        $('#graphSelector').append(
            $('<option></option>').val('#' + domId).html(label)
        );
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

    function showSelectedGraph() {
        $('.graph').addClass('hidden')
        const selectedGraph = $('#graphSelector').val();
        $(selectedGraph).removeClass('hidden')
    }

    function getStaticStructureAsTreeStructure() {
        const softwareSystems = [];

        structurizr.workspace.model.softwareSystems.forEach(function(softwareSystem) {
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
            name: "",
            children: softwareSystems,
            description: "",
            type: "Model",
            style: {
                background: '#777777',
                stroke: '#000000'
            }
        };
    }

    function getDeploymentEnvironmentAsTreeStructure(environmentName, view) {
        const deploymentNodes = [];

        structurizr.workspace.model.deploymentNodes.forEach(function(deploymentNode) {
            if (deploymentNode.environment === environmentName && inView(view, deploymentNode)) {
                deploymentNodes.push(getDeploymentNodeAsTreeStructure(deploymentNode, view));
            }

        });

        sortArrayByNameAscending(deploymentNodes);

        return {
            name: "",
            children: deploymentNodes,
            description: "",
            type: "DeploymentEnvironment",
            style: {
                background: '#777777',
                stroke: '#000000'
            }
        };
    }

    function inView(view, element) {
        if (view === undefined) {
            return true;
        }

        return view.elements.map(function(e) { return e.id; }).indexOf(element.id) > -1;
    }

    function getDeploymentNodeAsTreeStructure(deploymentNode, view) {
        const dn = {
            name: deploymentNode.name,
            element: deploymentNode,
            type: structurizr.constants.DEPLOYMENT_NODE_ELEMENT_TYPE,
            style: structurizr.ui.findElementStyle(deploymentNode),
            children: []
        };

        if (deploymentNode.children) {
            deploymentNode.children.forEach(function(child) {
                if (inView(view, child)) {
                    dn.children.push(getDeploymentNodeAsTreeStructure(child, view));
                }
            });
        }

        if (deploymentNode.infrastructureNodes) {
            deploymentNode.infrastructureNodes.forEach(function(infrastructureNode) {
                if (inView(view, infrastructureNode)) {
                    dn.children.push({
                        name: infrastructureNode.name,
                        element: infrastructureNode,
                        type: structurizr.constants.INFRASTRUCTURE_NODE_ELEMENT_TYPE,
                        style: structurizr.ui.findElementStyle(infrastructureNode)
                    });
                }
            });
        }

        if (deploymentNode.softwareSystemInstances) {
            deploymentNode.softwareSystemInstances.forEach(function(softwareSystemInstance) {
                if (inView(view, softwareSystemInstance)) {
                    dn.children.push({
                        name: softwareSystemInstance.name,
                        element: softwareSystemInstance,
                        type: structurizr.constants.SOFTWARE_SYSTEM_INSTANCE_ELEMENT_TYPE,
                        style: structurizr.ui.findElementStyle(softwareSystemInstance)
                    });
                }
            });
        }

        if (deploymentNode.containerInstances) {
            deploymentNode.containerInstances.forEach(function(containerInstance) {
                if (inView(view, containerInstance)) {
                    dn.children.push({
                        name: containerInstance.name,
                        element: containerInstance,
                        type: structurizr.constants.CONTAINER_INSTANCE_ELEMENT_TYPE,
                        style: structurizr.ui.findElementStyle(containerInstance)
                    });
                }
            });
        }

        return dn;
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