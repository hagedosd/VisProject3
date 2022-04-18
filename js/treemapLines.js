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
        console.log('pie filtered data: ', vis.filteredData)
        vis.pieData = new Array;
        let otherCharLineCount = 0;

        // Only show characters with more than 50 lines in the pie chart
        // The rest will be combined into an "other" wedge
        vis.filteredData.forEach(d=> {
            if (d.numLines > 50) {
                vis.pieData.push(d);
            }
            else {
                otherCharLineCount += 1;
            }
        });
        vis.pieData.push({name: "Other", numLines: otherCharLineCount})

        console.log('pie data: ', vis.pieData)

        vis.characters = [];
        vis.pieDataStats = [];
        vis.pieData.forEach(d=>{
            vis.characters.push(d.name);
            vis.pieDataStats.push(d.numLines);
        });

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
        // vis.color = d3.scaleOrdinal()
        //     .domain(vis.pieData)
        //     .range(["#3D550C", "#81B622"]);
        vis.color = d3.scaleOrdinal()
            .domain(vis.pieData)
            .range(d3.schemeSet2);

        vis.treeData = {
            children: vis.pieData.map(d=> ({value: d.numLines}))
        }

        vis.root = d3.hierarchy(vis.treeData).sum(d=>d.value) // Here the size of each leave is given in the 'value' field in input data
        vis.treemap = d3.treemap()
            .size([vis.width, vis.height])
            .padding(2)
            (vis.root);


        console.log('tree data: ', vis.treeData)

        console.log('root leaves: ', vis.root.leaves())

        // Compute the position of each group on the pie:
        vis.pie = d3.pie();
        vis.data_ready = vis.pie(vis.pieDataStats);

        // shape helper to build arcs:
        vis.arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(vis.radius);

        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        // vis.slices = vis.chart.selectAll('mySlices')
        //     .data(vis.data_ready)
        //     .enter()
        //     .append('path')
        //         .attr('d', d3.arc()
        //             .innerRadius(0)
        //             .outerRadius(vis.radius)
        //         )
        //         .attr('fill', function(d, i){ return(vis.color(i)) })
        //         .attr("stroke", "black")
        //         .style("stroke-width", "2px")
        //         .style("opacity", 0.7);

        vis.rect = vis.chart.selectAll('rect')
            .data(vis.root.leaves())
            .enter()
            .append('rect')
                .attr('x', function (d) { return d.x0; })
                .attr('y', function (d) { return d.y0; })
                .attr('width', function (d) { return d.x1 - d.x0; })
                .attr('height', function (d) { return d.y1 - d.y0; })
                .style("stroke", "black")
                .style("fill", "slateblue")

        // vis.slices.on('mouseover', (event,d) => {
        //     console.log('mouseover: ', d)
        //     d3.select('#tooltip')
        //         .style('display', 'block')
        //         .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        //         .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        //         .html(`
        //         <div class="tooltip-title">${vis.characters[d.index]} had ${d.value} lines.</div>
        //         `);
        // })
        // .on('mouseleave', () => {
        //     d3.select('#tooltip').style('display', 'none');
        // });
    }
}