class BarChartAppearances {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 800,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || {top: 50, right: 10, bottom: 75, left: 110},
            tooltipPadding: _config.tooltipPadding || 15
        }
  
    this.data = _data;
    this.initVis();
    
    }

    initVis() {
        let vis = this;

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // // Append group element that will contain our actual chart (see margin convention)
        const transformheight = - vis.config.margin.top 
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${transformheight})`);

        vis.chart.append("text")
            .attr("y", vis.height + 130)
            .attr("x", vis.width/2 - 80)
            .attr("text-anchor", "right")
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text("Appearances");

        vis.chart.append("text")
            .attr("y", -99)
            .attr("x", -vis.height / 2 - 50)
            .attr("text-anchor", "end")
            .attr('font-size', '14px')
            .attr("transform", "rotate(-90)")
            .attr('font-weight', 'bold')
            .text("Characters");


        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.filterResult = filterData("Ted", "1", null, vis.data);
        // vis.test = testfunc();
        console.log("All Ted data for season 1:", vis.filterResult);
        
        // scales
        vis.xScale = d3.scaleLinear()
            // .domain([0, d3.max(vis.phylumCount)])
            .range([0, vis.width]);
        vis.yScale = d3.scaleBand()
            // .domain(vis.phylumNum)
            .paddingInner(0.15)
            // .domain(vis.phylumList)  
            .range([0, vis.height]);

        // console.log('max count in a month', d3.max(vis.phylumCount));

        // init axis
        vis.xAxis = d3.axisBottom(vis.xScale)
            // .tickFormat(d3.format("d")); // Remove thousand comma
            .tickSizeOuter(0);
        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSizeOuter(0);

        // init axis groups
        vis.xAxisGroup = vis.chart.append("g")
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${vis.height+75})`);
        

        vis.yAxisGroup = vis.chart.append("g")
            .attr('class', 'axis y-axis')
            // .attr('transform', `translate(0, ${vis.height})`);
            .attr('transform', `translate(0, 75)`);

        vis.renderVis();

    }

    renderVis() {
        let vis = this;
        // console.log('Counts for each month:', vis.phylumCount);
        // console.log(vis.phylumNum);
        // Add rectangles
        // vis.rect = vis.chart.selectAll('rect')
        //     .data(vis.phylumNum)
        //     .enter()
        //     .append('rect')
        //         .attr('class', 'bar')
        //         .attr('fill', "#59981A")
        //         .attr('width', d => vis.xScale(vis.phylumCount[d]))
        //         // .attr('height', d => vis.height - vis.yScale(vis.phylumCount[d]))
        //         .attr('height', vis.yScale.bandwidth())
        //         .attr('y', d => vis.yScale(vis.phylumList[d])+75)
        //         .attr('x', 1);

        // vis.rect.on('mouseover', (event,d) => {
        //     d3.select('#tooltip')
        //         .style('display', 'block')
        //         .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
        //         .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        //         .html(`
        //         <div class="tooltip-title">${vis.phylumList[d]}</div>
        //         <div><i>${vis.phylumCount[d]} samples collected</i></div>
        //         `);
        // })
        // .on('mouseleave', () => {
        //     d3.select('#tooltip').style('display', 'none');
        // });

        // Update axis
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }

    updateByYear(yearFrom, yearTo){
        let vis = this;
        vis.svg.selectAll('*').remove();
        vis.startYear = yearFrom;
        vis.endYear = yearTo;
        vis.updateVis();
    }
}