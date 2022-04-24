class TreeMapAppearances {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 30, right: 10, bottom: 30, left: 110},
            tooltipPadding: _config.tooltipPadding || 15
        }
  
    this.data = _data;
    this.initVis();
    
    }

    initVis(){
        let vis = this;

        // min appearance count to have character on tree map
        vis.minAppearanceCount = 5;
        // filter data
        vis.filteredData = filterData(null,null,null,vis.data)[1];

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.radius = vis.config.containerHeight / 2 - vis.config.margin.top;

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // // Append group element that will contain our actual chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.bottom}, ${vis.config.margin.top})`)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // remove old rects
        vis.chart.selectAll("rect").remove().transition();
        vis.chart.selectAll("text").remove();

        // process data
        vis.charAppearances = [];
            vis.filteredData.forEach(d => {
                let numCharAppearances = 0;
                let charData = filterData(d.name,null,null,vis.data)[1];
                charData.forEach(j => {
                    if (d.name == j.name) {
                        numCharAppearances = j.numAppearances;
                    }
                })
                if (numCharAppearances > vis.minAppearanceCount) {
                    vis.charAppearances.push({name: d.name, numAppearances: numCharAppearances});
                }
            });

        // scales
        // set the color scale
        vis.color = d3.scaleOrdinal()
            .domain(vis.charAppearances)
            .range(d3.schemeSet2);

        // Set all data as top level children
        vis.treeData = {
            children: vis.charAppearances
        }

        // Calculate the root and build the treemap
        vis.root = d3.hierarchy(vis.treeData).sum(d=>d.numAppearances) // Here the size of each leave is given in the 'value' field in input data
        vis.treemap = d3.treemap()
            .size([vis.width, vis.height])
            .padding(2)
            (vis.root);

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        // Function to wrap text if sentences are too long
        function wrap(text, width) {
            text.each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    x = text.attr("x"),
                    y = text.attr("y"),
                    dy = 0, //parseFloat(text.attr("dy")),
                    tspan = text.text(null)
                                .append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan")
                                    .attr("x", x)
                                    .attr("y", y)
                                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                    .text(word);
                    }
                }
            });
        }

        // Draw rects for tree map
        vis.rect = vis.chart.selectAll('rect')
            .data(vis.root.leaves())
            .enter()
            .append('rect')
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('width', d => d.x1 - d.x0)
                .attr('height', d => d.y1 - d.y0)
                .style("stroke", "black")
                .style("fill", (d,i) => vis.color(i));

        // Add text in tree map if cells are bigger than mix/max height
        // If the cells aren't, set opacity of text to 0
        const minHeight = 60;
        const minWidth = 60;
        vis.rectText = vis.chart.selectAll("text")
            .data(vis.root.leaves())
            .enter()
            .append("text")
                .attr("x", d => d.x0+5)    // +5 to adjust position (more right)
                .attr("y", d => d.y0+20)    // +20 to adjust position (lower)
                .text(d => {
                    if ( d.x1 - d.x0 <= minWidth || d.y1 - d.y0 <= minHeight ) {
                        return ''
                    };
                    return d.data.name;
                })
                .call(wrap, minWidth)
                .attr("font-size", "15px")
                .attr("fill", "black");
                // .attr('opacity', d => {
                //         if ( d.x1 - d.x0 <= minWidth || d.y1 - d.y0 <= minHeight ) {
                //             return 0
                //         };
                //         return 1;
                //     });

        // Add tooltips on mouseover for rect AND text, because even if the text is
        // invisible it still takes up room
        vis.rect.on('mouseover', (event,d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">${d.data.name}</div>
                <div><i>Appeared in ${d.data.numAppearances} episodes.</i></div>
                `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });
        vis.rectText.on('mouseover', (event,d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">${d.data.name}</div>
                <div><i>Appeared in ${d.data.numAppearances} episodes.</i></div>
                `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });

        // Update num char appearances
        updateElement('treeAppearancesNumChars', vis.charAppearances.length)
    }
    // Helper Functions

    //from tree min select
    updateTree(min) {
        let vis = this;
        vis.minAppearanceCount = min;
        vis.updateVis();
    }
}
