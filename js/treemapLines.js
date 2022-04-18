class TreeMapLines {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 50, right: 10, bottom: 30, left: 110},
            tooltipPadding: _config.tooltipPadding || 15
        }
  
    this.data = _data;
    this.initVis();
    
    }

    initVis(){
        let vis = this;

        vis.filteredData = filterData(null,null,null,vis.data)[1];
        vis.processedData = [];
        let otherCharLineCount = 0;

        // Only show characters with more than 50 lines in the pie chart
        // The rest will be combined into an "other" group
        vis.filteredData.forEach(d=> {
            if (d.numLines > 50) {
                vis.processedData.push(d);
            }
            else {
                otherCharLineCount += 1;
            }
        });
        vis.processedData.push({name: "Other", numLines: otherCharLineCount})

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

        // scales
        // set the color scale
        vis.color = d3.scaleOrdinal()
            .domain(vis.processedData)
            .range(d3.schemeSet2);

        // Set all data as top level children
        vis.treeData = {
            children: vis.processedData
        }

        // Calculate the root and build the treemap
        vis.root = d3.hierarchy(vis.treeData).sum(d=>d.numLines) // Here the size of each leave is given in the 'value' field in input data
        vis.treemap = d3.treemap()
            .size([vis.width, vis.height])
            .padding(2)
            (vis.root);

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

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
        const minHeight = 80
        const minWidth = 45;
        vis.rectText = vis.chart.selectAll("text")
            .data(vis.root.leaves())
            .enter()
            .append("text")
                .attr("x", d => d.x0+5)    // +5 to adjust position (more right)
                .attr("y", d => d.y0+20)    // +20 to adjust position (lower)
                .text(d => d.data.name)
                .attr("font-size", "15px")
                .attr("fill", "black")
                .attr('opacity', d => {
                        if ( d.x1 - d.x0 <= minWidth || d.y1 - d.y0 <= minHeight ) {
                            return 0
                        };
                        return 1;
                    });
        
        // Add tooltips on mouseover for rect AND text, because even if the text is
        // invisible it still takes up room
        vis.rect.on('mouseover', (event,d) => {
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">${d.data.name} had ${d.data.numLines} lines.</div>
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
                <div class="tooltip-title">${d.data.name} had ${d.data.numLines} lines.</div>
                `);
        })
        .on('mouseleave', () => {
            d3.select('#tooltip').style('display', 'none');
        });
    }
}